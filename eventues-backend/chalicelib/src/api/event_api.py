# api/event_api.py

import base64
import json
from chalice import Blueprint, Response, CORSConfig
from chalicelib.src.usecases.event_usecase import EventUseCase
from chalicelib.src.usecases.form_usecase import FormUseCase
from chalicelib.src.repositories.analytics_repository import AnalyticsRepository
from chalicelib.src.utils.firebase import verify_token, db
from chalicelib.src.utils.formatters import generate_slug

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['*'],
    max_age=600
)

event_api = Blueprint(__name__)
event_api.cors = cors_config
use_case = EventUseCase()
form_use_case = FormUseCase()
analytics_repository = AnalyticsRepository(db)

@event_api.route('/organizer_detail/{event_id}/dashboard', methods=['GET'], cors=cors_config)
def get_event_dashboard(event_id):
    try:
        # Verificar se o evento existe
        event_ref = db.collection('events').document(event_id)
        event = event_ref.get()
        
        if not event.exists:
            return Response(
                body=json.dumps({"error": "Evento não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )

        # Buscar todos os pedidos relacionados a este evento
        orders = db.collection('orders').where('event_id', '==', event_id).stream()
        
        # Inicializar estatísticas
        stats = {
            'vendasTotais': 0,
            'vendasPendentes': 0,
            'vendasCanceladas': 0,
            'receitaLiquida': 0,
            'valorRepassado': 0,
            'valorAReceber': 0,
            'visualizacoes': event.to_dict().get('views', 0),
            'taxaConversao': 0,
            'totalPedidos': 0,
            'pedidosConfirmados': 0,
            'metodosPagamento': {
                'cartaoCredito': 0,
                'pix': 0,
                'boleto': 0,
                'outros': 0
            },
            'pedidos': []
        }
        
        # Processar pedidos
        all_orders = []
        for order in orders:
            order_data = order.to_dict()
            all_orders.append(order_data)
            
            order_total = order_data.get('total_amount', 0)
            order_status = order_data.get('status', '')
            
            # Obter o método de pagamento dos detalhes de pagamento
            payment_details = order_data.get('payment_details', {})
            billing_type = payment_details.get('billingType', '') if payment_details else ''
            
            # Contabilizar métodos de pagamento
            if billing_type == 'CREDIT_CARD':
                stats['metodosPagamento']['cartaoCredito'] += 1
            elif billing_type == 'PIX':
                stats['metodosPagamento']['pix'] += 1
            elif billing_type == 'BOLETO':
                stats['metodosPagamento']['boleto'] += 1
            else:
                stats['metodosPagamento']['outros'] += 1
            
            # Incrementar contagem total de pedidos
            stats['totalPedidos'] += 1
            
            # Classificar por status
            if order_status in ['CONFIRMADO', 'CONFIRMED', 'RECEIVED']:
                stats['vendasTotais'] += order_total
                stats['valorRepassado'] += order_total
                stats['pedidosConfirmados'] += 1
            elif order_status in ['PAGAMENTO PENDENTE', 'PENDING']:
                stats['vendasPendentes'] += order_total
                stats['valorAReceber'] += order_total
            elif order_status in ['CANCELADO', 'REFUNDED', 'DELETED', 'CHARGEBACK_REQUESTED']:
                stats['vendasCanceladas'] += order_total
        
        # Calcular receita líquida (total - cancelamentos)
        stats['receitaLiquida'] = stats['vendasTotais'] - stats['vendasCanceladas']
        
        # Obter total de visualizações do repositório de analytics
        visualizacoes = analytics_repository.get_page_views(event_id)
        stats['visualizacoes'] = visualizacoes
        
        # Calcular taxa de conversão
        if stats['visualizacoes'] > 0:
            stats['taxaConversao'] = round((stats['pedidosConfirmados'] / stats['visualizacoes']) * 100, 2)
        
        # Obter todos os pedidos ordenados por data (mais recentes primeiro)
        # Função para converter created_at para um formato comparável
        def get_created_at_key(order):
            created_at = order.get('created_at')
            if not created_at:
                return 0.0  # Garantir que retorne float
            # Se for um objeto datetime, converter para timestamp
            if hasattr(created_at, 'timestamp'):
                return float(created_at.timestamp())
            # Se for string, tentar converter para timestamp ou usar um valor padrão
            try:
                # Tentar converter string ISO para datetime e depois para timestamp
                from datetime import datetime
                dt = datetime.fromisoformat(str(created_at).replace('Z', '+00:00'))
                return float(dt.timestamp())
            except (ValueError, TypeError):
                # Se falhar, usar um valor padrão
                return 0.0
            
        all_orders.sort(key=get_created_at_key, reverse=True)
        
        stats['pedidos'] = [{
            'idPedido': order.get('payment_id', ''),
            'status': order.get('status', ''),
            'valor': order.get('subtotal_amount', 0),
            'total_amount': order.get('total_amount', ''),
            'fee_amount': order.get('fee_amount', ''),
            'payment_url': order.get('payment_url', ''),
            'data': order.get('created_at').isoformat() if hasattr(order.get('created_at'), 'isoformat') else str(order.get('created_at')) if order.get('created_at') else '',
            'metodoPagamento': order.get('payment_details', {}).get('billingType', '') if order.get('payment_details') else 'Não especificado'
        } for order in all_orders]
        
        return Response(
            body=json.dumps(stats),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        print(f"Erro ao buscar dashboard do evento: {str(e)}")
        return Response(
            body=json.dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )


@event_api.route('/events/{event_id}/pageview', methods=['POST'], cors=cors_config)
def record_page_view(event_id):
    """
    Registra uma nova visualização para o evento especificado.
    Não requer autenticação para permitir contabilizar todas as visualizações públicas.
    """
    try:
        # Incrementar contador de visualizações
        total_views = analytics_repository.increment_page_view(event_id)
        
        return Response(
            body=json.dumps({'visualizacoes': total_views}),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        print(f"Erro ao registrar visualização: {str(e)}")
        return Response(
            body=json.dumps({'error': 'Erro ao registrar visualização'}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )


@event_api.route('/events', methods=['POST'], cors=cors_config)
def create_event():
    request = event_api.current_request
    event_data = request.json_body
    try:
        event_data['slug'] = generate_slug(event_data['name'])
        new_event = use_case.create_event(event_data)
        return Response(
            body=new_event.to_dict(),
            status_code=201,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=400,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/list_events', methods=['GET'], cors=cors_config)
def list_events():
    request = event_api.current_request
    auth_header = request.headers.get('Authorization', '')

    if not auth_header.startswith('Bearer '):
        return Response(
            body=json.dumps({"error": "Token de autenticação ausente ou inválido."}),
            status_code=401,
            headers={'Content-Type': 'application/json'}
        )
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        user_id = verify_token(token)
    except ValueError as ve:
        return Response(
            body=json.dumps({"error": str(ve)}),
            status_code=401,
            headers={'Content-Type': 'application/json'}
        )
    
    try:
        events = use_case.get_events_by_user(user_id)
        events_dict = [event.to_dict() for event in events]
        return Response(
            body=json.dumps(events_dict),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": "Erro ao carregar eventos."}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/{event_id}', methods=['GET'], cors=cors_config)
def get_event_detail(event_id):
    try:
        event_ref = db.collection('events').document(event_id)
        event = event_ref.get()
        
        if not event.exists:
            return Response(
                body=json.dumps({"error": "Evento não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )

        event_data = event.to_dict()
        event_data['event_id'] = event.id

        # Garantir que o slug existe
        if 'slug' not in event_data or not event_data['slug']:
            event_data['slug'] = generate_slug(event_data['name'])
            event_ref.update({'slug': event_data['slug']})

        return Response(
            body=json.dumps(event_data),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        print(f"Erro ao buscar detalhes do evento: {str(e)}")
        return Response(
            body=json.dumps({"error": f"Erro ao buscar detalhes do evento: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )


@event_api.route('/organizer_detail/{event_id}/details', methods=['PATCH'], cors=cors_config)
def update_event_details(event_id):
    try:
        request = event_api.current_request
        event_data = request.json_body

        # Gerar slug se o nome foi atualizado
        if 'name' in event_data:
            event_data['slug'] = generate_slug(event_data['name'], event_id)

        event = use_case.update_event_detail(event_id, event_data)
        
        if not event:
            raise ValueError("Evento não encontrado.")

        return Response(
            body=event,
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        print(f"Erro ao atualizar evento: {str(e)}")
        return Response(
            body=json.dumps({"error": f"Erro ao atualizar evento: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )


@event_api.route('/organizer_detail/{event_id}/upload_document_file', methods=['POST'], cors=cors_config)
def upload_files(event_id):
    try:
        request = event_api.current_request
        data = request.json_body
        document_file = use_case.upload_event_file(event_id, data)
        return Response(
            body=document_file,
            status_code=201,
            headers={'Content-Type': 'application/json'}
        )
    
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )


@event_api.route('/organizer_detail/{event_id}/get_document_files', methods=['GET'], cors=cors_config)
def get_files(event_id):
    try:
        event_ref = db.collection('events').document(event_id)
        documents = event_ref.collection('documents').stream()

        files = [doc.to_dict() for doc in documents]
        return Response(
            body=json.dumps(files),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/{event_id}/delete_document_file', methods=['POST'], cors=cors_config)
def delete_file(event_id):
    request = event_api.current_request
    data = request.json_body
    try:
        use_case.delete_event_file(event_id, data)
        return Response(
            body=json.dumps({"message": "Arquivo deletado com sucesso."}),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/{event_id}/create_ticket', methods=['POST'], cors=cors_config)
def create_ticket(event_id):
    request = event_api.current_request
    data = request.json_body
    try:
        use_case.create_ticket(event_id, data)
        return Response(
            body=json.dumps({"message": "Ingresso criado com sucesso."}),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/{event_id}/get_tickets', methods=['GET'], cors=cors_config)
def get_tickets(event_id):
    try:
        event_ref = db.collection('events').document(event_id)
        tickets_ref = event_ref.collection('tickets').stream()

        tickets = []
        for ticket in tickets_ref:
            ticket_data = ticket.to_dict()
            ticket_data['id'] = ticket.id  # Adiciona o ID do documento
            tickets.append(ticket_data)

        return Response(
            body=json.dumps(tickets),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/{event_id}/tickets/{ticket_id}', methods=['DELETE'], cors=cors_config)
def delete_ticket(event_id, ticket_id):
    try:
        event_ref = db.collection('events').document(event_id)
        ticket_ref = event_ref.collection('tickets').document(ticket_id)
        ticket = ticket_ref.get()
        if not ticket.exists:
            raise ValueError("Ingresso não encontrado.")
        ticket_ref.delete()
        return Response(
            body=json.dumps({"message": "Ingresso deletado com sucesso."}),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/{event_id}/tickets/{ticket_id}', methods=['PATCH'], cors=cors_config)
def update_ticket(event_id, ticket_id):
    try:
        request = event_api.current_request
        ticket_data = request.json_body

        # Validar se o evento existe
        event_ref = db.collection('events').document(event_id)
        event = event_ref.get()
        if not event.exists:
            return Response(
                body=json.dumps({"error": "Evento não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )

        # Validar se o ingresso existe
        ticket_ref = event_ref.collection('tickets').document(ticket_id)
        ticket = ticket_ref.get()
        if not ticket.exists:
            return Response(
                body=json.dumps({"error": "Ingresso não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )

        # Garantir que os campos obrigatórios estejam presentes
        required_fields = ['nome', 'tipo', 'valor', 'taxaServico', 'visibilidade']
        for field in required_fields:
            if field not in ticket_data:
                return Response(
                    body=json.dumps({"error": f"Campo obrigatório ausente: {field}"}),
                    status_code=400,
                    headers={'Content-Type': 'application/json'}
                )

        # Converter campos numéricos
        if 'valor' in ticket_data:
            ticket_data['valor'] = float(ticket_data['valor'])
        if 'totalIngressos' in ticket_data:
            ticket_data['totalIngressos'] = str(ticket_data['totalIngressos'])

        # Atualiza o documento
        ticket_ref.update(ticket_data)

        # Busca o documento atualizado
        updated_ticket = ticket_ref.get()
        response_data = updated_ticket.to_dict()
        response_data['id'] = ticket_id

        return Response(
            body=json.dumps(response_data),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        print(f"Erro ao atualizar ingresso: {str(e)}")  # Log do erro
        return Response(
            body=json.dumps({"error": f"Erro ao atualizar ingresso: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/create_event', methods=['POST'], cors=cors_config)
def create_event():
    try:
        request = event_api.current_request
        event_data = request.json_body

        # Gerar slug a partir do nome do evento
        event_data['slug'] = generate_slug(event_data['name'])

        # Criar o documento do evento
        event_ref = db.collection('events').document()
        event_ref.set(event_data)

        response_data = {
            'event_id': event_ref.id,
            'slug': event_data['slug']
        }

        return Response(
            body=json.dumps(response_data),
            status_code=201,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        print(f"Erro ao criar evento: {str(e)}")
        return Response(
            body=json.dumps({"error": f"Erro ao criar evento: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/public/events', methods=['GET'], cors=cors_config)
def list_public_events():
    request = event_api.current_request
    cursor = request.query_params.get('cursor', None)
    limit = int(request.query_params.get('limit', 10))
    
    try:
        events, next_cursor = use_case.get_public_events(cursor, limit)
        events_dict = []
        
        for event in events:
            card_info = {
                'event_id': event.event_id,
                'name': event.name,
                'slug': event.slug,
                'banner_url': event.banner_url,
                'start_date': event.start_date.isoformat() if event.start_date else None,
                'end_date': event.end_date.isoformat() if event.end_date else None,
                'event_type': event.event_type,
                'event_category': event.event_category,
                'state': event.state,
                'city': event.city
            }
            events_dict.append(card_info)
        
        response = {
            "events": events_dict,
            "next_cursor": next_cursor
        }
        
        return Response(
            body=json.dumps(response),
            status_code=200,
            headers={
                'Content-Type': 'application/json'
            }
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": f"Erro ao carregar eventos: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/public/events/slug/{slug}', methods=['GET'], cors=cors_config)
def get_public_event_by_slug(slug):
    try:
        # Buscar evento pelo slug
        events_ref = db.collection('events')
        query = events_ref.where("slug", "==", slug)
        docs = list(query.stream())
        
        if not docs:
            return Response(
                body=json.dumps({"error": "Evento não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
            
        event = docs[0]
        event_data = event.to_dict()
        event_data['event_id'] = event.id
        
        return Response(
            body=json.dumps(event_data),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": f"Erro ao buscar evento: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/publish_event/{event_id}/{status}', methods=['PATCH'], cors=cors_config)
def publish_event(event_id, status):
    try:
        event = use_case.publish_event(event_id, status)
        return Response(
            body=event,
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/{event_id}/get_form', methods=['GET'], cors=cors_config)
def get_event_form(event_id):
    try:
        form_data = form_use_case.get_event_form(event_id)
        return Response(
            body=json.dumps(form_data['fields']),
            status_code=200,
            headers={
                'Content-Type': 'application/json'
            }
        )
    except Exception as e:
        print(f"Erro ao buscar formulário do evento: {str(e)}")
        return Response(
            body=json.dumps({"error": f"Erro ao buscar formulário do evento: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/{event_id}/update_form', methods=['POST'], cors=cors_config)
def update_event_form(event_id):
    try:
        request = event_api.current_request
        payload = request.json_body
        
        # Extract form_fields from the payload
        form_fields = payload.get('form_fields') if payload and isinstance(payload, dict) else None
        
        form_data = form_use_case.update_event_form(event_id, form_fields)
        
        return Response(
            body=json.dumps(form_data),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        print(f"Erro ao atualizar formulário do evento: {str(e)} --> payload: {request.json_body}")
        return Response(
            body=json.dumps({"error": f"Erro ao atualizar formulário do evento: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/{event_id}/create_form', methods=['POST'], cors=cors_config)
def create_event_form(event_id):
    try:
        request = event_api.current_request
        payload = request.json_body
        
        # Extract form_fields from the payload
        form_fields = payload.get('form_fields') if payload and isinstance(payload, dict) else None
        
        print(f"Creating form for event {event_id} with fields: {form_fields}")
        form_data = form_use_case.create_event_form(event_id, form_fields)
        
        return Response(
            body=json.dumps(form_data),
            status_code=201,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        print(f"Erro ao criar formulário do evento: {str(e)} --> payload: {request.json_body}")
        return Response(
            body=json.dumps({"error": f"Erro ao criar formulário do evento: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/{event_id}/delete_form', methods=['DELETE'], cors=cors_config)
def delete_event_form(event_id):
    try:
        result = form_use_case.delete_event_form(event_id)
        return Response(
            body=json.dumps({"success": result}),
            status_code=200 if result else 404,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        print(f"Erro ao excluir formulário do evento: {str(e)}")
        return Response(
            body=json.dumps({"error": f"Erro ao excluir formulário do evento: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/events/{event_id}/policies', methods=['GET'], cors=cors_config)
def get_event_policies(event_id):
    try:
        policies = use_case.get_event_policies(event_id)
        return Response(
            body=json.dumps(policies),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except ValueError as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=404,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        print(f"Erro ao obter políticas do evento: {str(e)}")
        return Response(
            body=json.dumps({"error": f"Erro ao obter políticas do evento: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/events/{event_id}/policies', methods=['PUT'], cors=cors_config)
def update_event_policies(event_id):
    try:
        request = event_api.current_request
        payload = request.json_body
        
        # Validação dos campos obrigatórios
        if not isinstance(payload, dict):
            return Response(
                body=json.dumps({"error": "Formato de dados inválido. É esperado um objeto JSON."}),
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
        
        # Verifica os campos específicos
        if 'installment_enabled' in payload and not isinstance(payload['installment_enabled'], bool):
            return Response(
                body=json.dumps({"error": "O campo 'installment_enabled' deve ser um valor booleano."}),
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
            
        if 'max_installments' in payload:
            try:
                max_installments = int(payload['max_installments'])
                if max_installments < 2 or max_installments > 6:
                    return Response(
                        body=json.dumps({"error": "O campo 'max_installments' deve ser um número entre 2 e 6."}),
                        status_code=400,
                        headers={'Content-Type': 'application/json'}
                    )
            except (ValueError, TypeError):
                return Response(
                    body=json.dumps({"error": "O campo 'max_installments' deve ser um número inteiro."}),
                    status_code=400,
                    headers={'Content-Type': 'application/json'}
                )
        
        # Atualiza as políticas do evento
        updated_event = use_case.update_event_policies(event_id, payload)
        
        # Retorna as políticas atualizadas
        if isinstance(updated_event, dict):
            installment_enabled = updated_event.get('installment_enabled')
            max_installments = updated_event.get('max_installments')
        else:
            installment_enabled = getattr(updated_event, 'installment_enabled', None)
            max_installments = getattr(updated_event, 'max_installments', None)
        return Response(
            body=json.dumps({
                'installment_enabled': installment_enabled,
                'max_installments': max_installments
            }),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except ValueError as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=404,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        print(f"Erro ao atualizar políticas do evento: {str(e)}")
        return Response(
            body=json.dumps({"error": f"Erro ao atualizar políticas do evento: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
