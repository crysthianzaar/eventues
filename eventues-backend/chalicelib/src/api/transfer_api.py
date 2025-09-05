import json
from datetime import datetime, timedelta
from chalice import Blueprint, Response, CORSConfig
from chalicelib.src.utils.firebase import db

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['*'],
    max_age=600
)

transfer_api = Blueprint(__name__)
transfer_api.cors = cors_config

@transfer_api.route('/events/{event_id}/transfers', methods=['GET'], cors=cors_config)
def get_transfer_requests(event_id):
    """
    Busca todas as solicitações de repasse para um evento específico
    """
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
        
        # Buscar solicitações de repasse
        transfers = db.collection('transfer_requests')\
                     .where('event_id', '==', event_id)\
                     .stream()
        
        transfer_list = []
        for transfer in transfers:
            transfer_data = transfer.to_dict()
            transfer_data['id'] = transfer.id
            
            # Convert datetime objects to ISO format strings
            for field in ['requested_at', 'estimated_date', 'created_at', 'updated_at', 'completed_at']:
                if field in transfer_data and transfer_data[field]:
                    if hasattr(transfer_data[field], 'isoformat'):
                        transfer_data[field] = transfer_data[field].isoformat()
                    elif hasattr(transfer_data[field], 'timestamp'):
                        transfer_data[field] = datetime.fromtimestamp(transfer_data[field].timestamp()).isoformat()
            
            transfer_list.append(transfer_data)
        
        # Sort by requested_at in descending order (most recent first)
        transfer_list.sort(key=lambda x: x.get('requested_at', ''), reverse=True)
        
        return Response(
            body=json.dumps(transfer_list),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        print(f"Erro ao buscar solicitações de repasse: {str(e)}")
        return Response(
            body=json.dumps({"error": f"Erro interno: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@transfer_api.route('/events/{event_id}/transfers', methods=['POST'], cors=cors_config)
def create_transfer_request(event_id):
    """
    Cria uma nova solicitação de repasse
    """
    try:
        request_data = transfer_api.current_request.json_body
        
        # Verificar se o evento existe
        event_ref = db.collection('events').document(event_id)
        event = event_ref.get()
        
        if not event.exists:
            return Response(
                body=json.dumps({"error": "Evento não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        
        # Validar dados da requisição
        amount = request_data.get('amount', 0)
        is_advance = request_data.get('is_advance', False)
        
        if amount <= 0:
            return Response(
                body=json.dumps({"error": "Valor deve ser maior que zero"}),
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
        
        # Buscar dados financeiros do evento para validação
        orders = db.collection('orders').where('event_id', '==', event_id).stream()
        
        valor_confirmado = 0
        valor_pendente = 0
        valor_repassado = 0
        
        for order in orders:
            order_data = order.to_dict()
            order_total = order_data.get('total_amount', 0)
            order_status = order_data.get('status', '')
            
            payment_details = order_data.get('payment_details', {})
            is_transferred = payment_details.get('transferred_to_organizer', False)
            
            if order_status in ['CONFIRMADO', 'CONFIRMED', 'RECEIVED']:
                if is_transferred:
                    valor_repassado += order_total
                else:
                    valor_confirmado += order_data.get('subtotal_amount', order_data.get('valor', 0))
            elif order_status in ['PAGAMENTO PENDENTE', 'PENDING']:
                valor_pendente += order_data.get('subtotal_amount', order_data.get('valor', 0))
        
        # Validar se há valor disponível
        max_amount = valor_confirmado + (valor_pendente if is_advance else 0)
        
        if amount > max_amount:
            return Response(
                body=json.dumps({
                    "error": f"Valor solicitado excede o disponível. Máximo: R$ {max_amount:.2f}"
                }),
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
        
        # Calcular taxa para adiantamento (5%)
        fee = amount * 0.05 if is_advance else 0
        net_amount = amount - fee
        
        # Calcular data estimada de repasse
        days_to_add = 2 if is_advance else 5
        estimated_date = datetime.now() + timedelta(days=days_to_add)
        
        # Criar solicitação de repasse
        transfer_data = {
            'event_id': event_id,
            'amount': amount,
            'net_amount': net_amount,
            'fee': fee if fee > 0 else None,
            'type': 'ADVANCE' if is_advance else 'NORMAL',
            'status': 'PENDING',
            'requested_at': datetime.now(),
            'estimated_date': estimated_date,
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        # Salvar no Firestore
        transfer_ref = db.collection('transfer_requests').add(transfer_data)
        transfer_id = transfer_ref[1].id
        
        # Retornar dados da solicitação criada
        transfer_data['id'] = transfer_id
        transfer_data['requested_at'] = transfer_data['requested_at'].isoformat()
        transfer_data['estimated_date'] = transfer_data['estimated_date'].isoformat()
        transfer_data['created_at'] = transfer_data['created_at'].isoformat()
        transfer_data['updated_at'] = transfer_data['updated_at'].isoformat()
        
        return Response(
            body=json.dumps(transfer_data),
            status_code=201,
            headers={'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        print(f"Erro ao criar solicitação de repasse: {str(e)}")
        return Response(
            body=json.dumps({"error": f"Erro interno: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@transfer_api.route('/events/{event_id}/transfers/{transfer_id}/status', methods=['PUT'], cors=cors_config)
def update_transfer_status(event_id, transfer_id):
    """
    Atualiza o status de uma solicitação de repasse
    """
    try:
        request_data = transfer_api.current_request.json_body
        
        # Verificar se o evento existe
        event_ref = db.collection('events').document(event_id)
        event = event_ref.get()
        
        if not event.exists:
            return Response(
                body=json.dumps({"error": "Evento não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        
        # Buscar solicitação de repasse
        transfer_ref = db.collection('transfer_requests').document(transfer_id)
        transfer = transfer_ref.get()
        
        if not transfer.exists:
            return Response(
                body=json.dumps({"error": "Solicitação de repasse não encontrada"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        
        # Atualizar status
        new_status = request_data.get('status')
        notes = request_data.get('notes', '')
        
        valid_statuses = ['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED']
        if new_status not in valid_statuses:
            return Response(
                body=json.dumps({"error": "Status inválido"}),
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
        
        update_data = {
            'status': new_status,
            'updated_at': datetime.now()
        }
        
        if notes:
            update_data['notes'] = notes
        
        if new_status == 'COMPLETED':
            update_data['completed_at'] = datetime.now()
        
        transfer_ref.update(update_data)
        
        return Response(
            body=json.dumps({"message": "Status atualizado com sucesso"}),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        print(f"Erro ao atualizar status do repasse: {str(e)}")
        return Response(
            body=json.dumps({"error": f"Erro interno: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@transfer_api.route('/events/{event_id}/transfers/summary', methods=['GET'], cors=cors_config)
def get_transfer_summary(event_id):
    """
    Retorna resumo de repasses para o evento
    """
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
        
        # Buscar todas as solicitações de repasse
        transfers = db.collection('transfer_requests')\
                     .where('event_id', '==', event_id)\
                     .stream()
        
        summary = {
            'total_requested': 0,
            'total_completed': 0,
            'total_pending': 0,
            'total_fees': 0,
            'requests_count': 0,
            'completed_count': 0,
            'pending_count': 0
        }
        
        for transfer in transfers:
            transfer_data = transfer.to_dict()
            amount = transfer_data.get('amount', 0)
            status = transfer_data.get('status', '')
            fee = transfer_data.get('fee', 0) or 0
            
            summary['total_requested'] += amount
            summary['requests_count'] += 1
            summary['total_fees'] += fee
            
            if status == 'COMPLETED':
                summary['total_completed'] += amount
                summary['completed_count'] += 1
            elif status in ['PENDING', 'APPROVED', 'PROCESSING']:
                summary['total_pending'] += amount
                summary['pending_count'] += 1
        
        return Response(
            body=json.dumps(summary),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        print(f"Erro ao buscar resumo de repasses: {str(e)}")
        return Response(
            body=json.dumps({"error": f"Erro interno: {str(e)}"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
