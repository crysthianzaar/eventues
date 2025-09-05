# api/user_api.py
from chalice import Blueprint, Response, CORSConfig
from chalicelib.src.usecases.user_usecase import UserUseCase
from chalicelib.src.utils.firebase import db
import json

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['*'],
    max_age=600
)

user_api = Blueprint(__name__)
use_case = UserUseCase()

@user_api.route('/auth', methods=['POST'], cors=cors_config)
def authenticate_or_create_user():
    request = user_api.current_request
    user_data = request.json_body
    response_data = use_case.authenticate_or_create_user(user_data)
    return Response(
        body=response_data,
        status_code=201,
        headers={'Content-Type': 'application/json'}
    )

@user_api.route('/users/{user_id}', methods=['GET'], cors=cors_config)
def get_user(user_id):
    try:
        user = use_case.get_user(user_id)
        if not user:
            return Response(
                body=json.dumps({"error": "Usuário não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        return Response(
            body=json.dumps(user.to_dict()),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@user_api.route('/users/{user_id}/update', methods=['PATCH'], cors=cors_config)
def update_user(user_id):
    request = user_api.current_request
    user_data = request.json_body
    user_data['id'] = user_id
    user = use_case.update_user(user_data)
    response_data = user.to_dict()
    return Response(
        body=response_data,
        status_code=200,
        headers={'Content-Type': 'application/json'}
    )

@user_api.route('/users/{user_id}', methods=['PUT'], cors=cors_config)
def update_user_put(user_id):
    try:
        request = user_api.current_request
        user_data = request.json_body
        updated_user = use_case.update_user(user_id, user_data)
        return Response(
            body=json.dumps(updated_user),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@user_api.route('/users/{user_id}/events', methods=['GET'], cors=cors_config)
def get_user_events(user_id):
    try:
        import time
        start_time = time.time()
        
        # Get query parameters for pagination and filtering
        request = user_api.current_request
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))  # Default to 5 items per page
        status_filter = request.query_params.get('status', None)
        
        # Calculate offset for pagination
        offset = (page - 1) * page_size
        
        # Base query - always order by creation date (most recent first to oldest)
        # This ensures newest tickets/registrations appear at the top of the user's account page
        query = db.collection('orders')\
                  .where(field_path='user_id', op_string='==', value=user_id)\
                  .order_by('created_at', direction='DESCENDING')
        
        # Apply status filter if provided
        if status_filter and status_filter.lower() != 'all':
            query = query.where(field_path='status', op_string='==', value=status_filter.upper())
        
        # First get total count for pagination info (limited to 500 for performance)
        total_count_query = query.limit(500)
        total_count_docs = list(total_count_query.stream())
        total_count = len(total_count_docs)
        
        # Then get paginated results
        paginated_query = query.limit(page_size).offset(offset)
        orders = list(paginated_query.stream())
        
        print(f"[PERF] Fetched {len(orders)} orders (page {page}, size {page_size}) in {time.time() - start_time:.2f}s")
        
        if not orders:
            return Response(
                body={
                    'events': [],
                    'pagination': {
                        'total': total_count,
                        'page': page,
                        'page_size': page_size,
                        'total_pages': (total_count + page_size - 1) // page_size
                    }
                },
                status_code=200,
                headers={'Content-Type': 'application/json'}
            )
        
        # Extract all unique event IDs for batch fetching
        event_ids = set()
        orders_map = {}
        
        for order in orders:
            order_id = order.id
            order_data = order.to_dict()
            event_id = order_data.get('event_id')
            
            if event_id:
                event_ids.add(event_id)
                if event_id not in orders_map:
                    orders_map[event_id] = []
                orders_map[event_id].append((order_id, order_data))
        
        # Batch fetch all required events
        events_query_time = time.time()
        events = {}
        for event_id in event_ids:
            event_ref = db.collection('events').document(event_id)
            event_doc = event_ref.get()
            if event_doc.exists:
                events[event_id] = {
                    'id': event_id,
                    'data': event_doc.to_dict(),
                    'banner_url': None
                }
        
        print(f"[PERF] Fetched {len(events)} events in {time.time() - events_query_time:.2f}s")
        
        # Efficient banner fetching - only query for events we need
        banner_query_time = time.time()
        banner_queries = []
        
        for event_id in events.keys():
            # Only query for the most recent banner document with proper filters
            banner_query = db.collection('events')\
                            .document(event_id)\
                            .collection('documents')\
                            .where(field_path='file_type', op_string='==', value='image')\
                            .where(field_path='file_category', op_string='==', value='banner')\
                            .order_by('created_at', direction='DESCENDING')\
                            .limit(1)
            banner_queries.append((event_id, banner_query.get()))
        
        # Process banner results
        for event_id, banner_docs in banner_queries:
            banner_docs = list(banner_docs)
            if banner_docs:
                events[event_id]['banner_url'] = banner_docs[0].to_dict().get('url', '')
        
        print(f"[PERF] Fetched banners in {time.time() - banner_query_time:.2f}s")
        
        # Map status values for consistent display
        status_mapping = {
            'PAGAMENTO PENDENTE': 'Aguardando Pagamento',
            'CONFIRMADO': 'Inscrito',
            'PENDING': 'Aguardando Pagamento',
            'RECEIVED': 'Inscrito',
            'CONFIRMED': 'Inscrito',
            'OVERDUE': 'Pagamento Atrasado',
            'REFUNDED': 'Reembolsado',
            'CANCELLED': 'Cancelado',
            'CANCELED': 'Cancelado',
            'DELETED': 'Cancelado'
        }
        
        # Build the final response with all the data we've gathered
        events_list = []
        for event_id, event_orders in orders_map.items():
            if event_id in events:
                event_info = events[event_id]
                
                for order_id, order_data in event_orders:
                    # Format created_at if needed
                    created_at = order_data.get('created_at', '')
                    if hasattr(created_at, 'isoformat'):
                        created_at = created_at.isoformat()
                    
                    # Determine status
                    order_status = order_data.get('status', 'PAGAMENTO PENDENTE')
                    event_status = status_mapping.get(order_status, 'Aguardando Pagamento')
                    
                    events_list.append({
                        'event_id': event_id,
                        'name': event_info['data'].get('name', ''),
                        'event_status': event_status,
                        'imageUrl': event_info['banner_url'] or '',
                        'start_date': event_info['data'].get('start_date', ''),
                        'order_id': order_id,
                        'ticket_id': order_data.get('ticket_id', order_id),
                        'status': order_status,
                        'payment_id': order_data.get('payment_id', ''),
                        'payment_url': order_data.get('payment_url', ''),
                        'total_amount': order_data.get('total_amount', 0),
                        'created_at': created_at,
                    })
        
        # Calculate pagination information
        total_pages = (total_count + page_size - 1) // page_size
        
        print(f"[PERF] Total processing time: {time.time() - start_time:.2f}s for {len(events_list)} events")
        
        return Response(
            body={
                'events': events_list,
                'pagination': {
                    'total': total_count,
                    'page': page,
                    'page_size': page_size,
                    'total_pages': total_pages
                }
            },
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        import traceback
        print(f"Error in get_user_events: {str(e)}")
        print(traceback.format_exc())
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@user_api.route('/users/{user_id}/organizer-info', methods=['POST'], cors=cors_config)
def save_organizer_info(user_id):
    try:
        request = user_api.current_request
        organizer_data = request.json_body
        
        # Verificar se o usuário existe
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if not user_doc.exists:
            return Response(
                body={'error': 'Usuário não encontrado'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        
        # Adicionar campos de data
        from datetime import datetime
        organizer_data['created_at'] = datetime.now()
        organizer_data['updated_at'] = datetime.now()
        
        # Atualizar o documento do usuário com as informações do organizador
        user_ref.update({
            'organizer_info': organizer_data
        })
        
        return Response(
            body={'success': True, 'message': 'Informações salvas com sucesso'},
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@user_api.route('/users/{user_id}/organizer-info', methods=['GET'], cors=cors_config)
def get_organizer_info(user_id):
    try:
        # Buscar o documento do usuário
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return Response(
                body={'error': 'Usuário não encontrado'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        
        user_data = user_doc.to_dict()
        
        # Verificar se existem informações de organizador
        if 'organizer_info' not in user_data or not user_data['organizer_info']:
            return Response(
                body={'exists': False},
                status_code=200,
                headers={'Content-Type': 'application/json'}
            )
        
        organizer_data = user_data['organizer_info']
        
        # Converter timestamps para string
        if 'created_at' in organizer_data and hasattr(organizer_data['created_at'], 'isoformat'):
            organizer_data['created_at'] = organizer_data['created_at'].isoformat()
        if 'updated_at' in organizer_data and hasattr(organizer_data['updated_at'], 'isoformat'):
            organizer_data['updated_at'] = organizer_data['updated_at'].isoformat()
        
        return Response(
            body={'exists': True, 'data': organizer_data},
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@user_api.route('/tickets/{order_id}', methods=['GET'], cors=cors_config)
def get_ticket_details(order_id):
    try:
        # Get the order associated with this ticket
        orders = db.collection('orders').document(order_id).get()
        
        if not orders:
            order = db.collection('orders').document(order_id).get()
            if not order.exists:
                return Response(
                    body={'error': 'Ticket not found'},
                    status_code=404,
                    headers={'Content-Type': 'application/json'}
                )
            
        order_data = orders.to_dict()
        
        # Get event details
        event_ref = db.collection('events').document(order_data.get('event_id', ''))
        if event_ref:
            event = event_ref.get()
        
        if not event.exists:
            return Response(
                body={'error': 'Event not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
            
        event_data = event.to_dict()
        
        # Get participant info - safely handle missing user_id
        user_data = {}
        user_id = order_data.get('user_id')
        if user_id:
            user_ref = db.collection('users').document(user_id)
            user = user_ref.get()
            if user.exists:
                user_data = user.to_dict()
        
        # Convert datetime fields to ISO format strings
        event_date = event_data.get('start_date')
        if hasattr(event_date, 'isoformat'):
            event_date = event_date.isoformat()
            
        created_at = order_data.get('created_at')
        if hasattr(created_at, 'isoformat'):
            created_at = created_at.isoformat()
        
        # Combine all data
        ticket_details = {
            'order_id': order_id,
            'event_id': event.id,
            'event_slug': event_data.get('slug'),
            'event_type': event_data.get('event_type'),
            'event_name': event_data.get('name'),
            'event_date': event_date,
            'event_location': event_data.get('location'),
            'user_id': order_data.get('user_id', ''),  # Adicionando user_id do pedido
            'ticket_name': order_data.get('ticket_name'),
            'ticket_value': order_data.get('ticket_value'),
            'quantity': order_data.get('quantity'),
            'total_value': order_data.get('total_amount'),
            'payment_details': order_data.get('payment_details'),
            'status': order_data.get('status'),
            'created_at': created_at,
            'payment_url': order_data.get('payment_url'),
            'tickets': order_data.get('tickets')
        }
        
        return Response(
            body=ticket_details,
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
