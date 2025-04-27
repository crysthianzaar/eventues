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
        # Get all orders for the user
        orders = db.collection('orders').where('user_id', '==', user_id).stream()
        
        events_list = []
        for order in orders:
            order_data = order.to_dict()
            # Get event details
            event_ref = db.collection('events').document(order_data['event_id'])
            event = event_ref.get()
            
            if event.exists:
                event_data = event.to_dict()
                
                # Map order status to event status
                status_mapping = {
                    'pending': 'Aguardando Pagamento',
                    'received': 'Inscrito',
                    'confirmed': 'Inscrito',
                    'overdue': 'Pagamento Atrasado',
                    'refunded': 'Reembolsado',
                    'cancelled': 'Cancelado',
                    'deleted': 'Cancelado'
                }
                
                event_status = status_mapping.get(order_data.get('status', 'pending'), 'Aguardando Pagamento')
                created_at = order_data.get('created_at', '')
                if hasattr(created_at, 'isoformat'):
                    created_at = created_at.isoformat()
                
                # Get banner from documents subcollection
                documents = list(event_ref.collection('documents').stream())
                banners = [doc.to_dict() for doc in documents if doc.to_dict().get('file_name', '').lower().startswith('banner')]
                banner_url = banners[-1].get('url') if banners else ''

                events_list.append({
                    'event_id': event.id,
                    'name': event_data.get('name', ''),
                    'event_status': event_status,
                    'imageUrl': banner_url,
                    'start_date': event_data.get('start_date', ''),
                    'order_id': order.id,
                    'ticket_id': order_data.get('ticket_id', order.id),  # Use order ID as ticket ID if not present
                    'status': order_data.get('status', 'pending'),
                    'payment_id': order_data.get('payment_id', ''),
                })
        
        return Response(
            body={'events': events_list},
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
        
    except Exception as e:
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
