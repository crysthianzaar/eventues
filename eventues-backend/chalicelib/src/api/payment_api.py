from datetime import datetime
from chalice import Blueprint, Response, CORSConfig, UnauthorizedError, NotFoundError
from chalicelib.src.usecases.assas_usecase import AsaasUseCase
from chalicelib.src.usecases.payment_usecase import PaymentUseCase
from chalicelib.src.utils.firebase import db, verify_token
from chalicelib.src.utils.json_encoder import firestore_json_dumps

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['*'],
    max_age=600
)

payment_api = Blueprint(__name__)

asaas_usecase = AsaasUseCase()

@payment_api.authorizer()
def firebase_auth(auth_request):
    token = auth_request.token
    if not token:
        raise Exception('No authorization token provided')
    
    claims = verify_token(token)
    if not claims:
        raise Exception('Invalid token')
    
    return claims

@payment_api.route('/create-customer', methods=['POST'], cors=cors_config)
def create_customer():
    try:
        request = payment_api.current_request
        data = request.json_body
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.create_customer(data, asaas_usecase)
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/tokenize-card', methods=['POST'], cors=cors_config)
def tokenize_card():
    try:
        request = payment_api.current_request
        data = request.json_body
        remote_ip = request.context.get('identity', {}).get('sourceIp', '')
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.tokenize_card(data, asaas_usecase, remote_ip)
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/create_payment_session', methods=['POST'], cors=cors_config)
def create_payment_session():
    try:
        request = payment_api.current_request
        data = request.json_body
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.create_payment_session(data, asaas_usecase, db)
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/pix-qrcode/{payment_id}', methods=['GET'], cors=cors_config)
def get_pix_qrcode(payment_id):
    try:
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.get_pix_qrcode(payment_id, asaas_usecase)
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/webhook/asaas', methods=['POST'], cors=cors_config)
def webhook():
    try:
        request = payment_api.current_request
        event = request.json_body
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.process_webhook(event, db)
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body={'error': f'Error processing webhook: {str(e)}'},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/check-payment-status/{payment_id}', methods=['GET'], cors=cors_config)
def check_payment_status(payment_id):
    try:
        payment_usecase = PaymentUseCase()
        headers = payment_api.current_request.headers
        result, status_code = payment_usecase.check_payment_status(
            payment_id=payment_id,
            headers=headers,
            asaas_usecase=asaas_usecase,
            db=db,
            verify_token=verify_token
        )
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception:
        return Response(
            body={'error': 'Erro ao verificar status do pagamento'},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/create-order', methods=['POST'], cors=cors_config)
def create_order():
    try:
        request = payment_api.current_request
        data = request.json_body
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.create_order(data, db)
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/update-order/{order_id}/tickets', methods=['PATCH'], cors=cors_config)
def update_order_tickets(order_id):
    try:
        request = payment_api.current_request
        data = request.json_body
        tickets = data.get('tickets') if data else None
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.update_order_tickets(order_id, tickets, db)
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/orders/{order_id}/participants', methods=['POST'], cors=cors_config)
def update_order_participants(order_id):
    try:
        request = payment_api.current_request
        data = request.json_body
        tickets = data.get('tickets') if data else None
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.update_order_participants(order_id, tickets, db)
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/orders/{order_id}/update-user', methods=['PUT'], cors=cors_config)
def update_order_user(order_id):
    try:
        request = payment_api.current_request
        data = request.json_body
        user_id = data.get('user_id') if data else None
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.update_order_user(order_id, user_id, db)
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/get-order/{order_id}', methods=['GET'], cors=cors_config)
def get_order(order_id):
    try:
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.get_order(order_id, db)
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/events/{event_id}/participants', methods=['GET'], cors=cors_config)
def get_event_participants(event_id):
    try:
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.get_event_participants(event_id, db)
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/events/{event_id}/participants/{order_id}/checkin', methods=['POST'], cors=cors_config)
def update_participant_checkin(event_id, order_id):
    try:
        request = payment_api.current_request
        data = request.json_body
        if not data or 'participant_index' not in data or 'checkin_status' not in data or 'user_id' not in data:
            return Response(
                body={'error': 'Missing required fields: participant_index, checkin_status, and user_id'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
        participant_index = data['participant_index']
        checkin_status = data['checkin_status']
        user_id = data['user_id']
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.update_participant_checkin(
            event_id, order_id, participant_index, checkin_status, user_id, db
        )
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/events/{event_id}/qr-checkin', methods=['POST'], cors=cors_config)
def qr_code_checkin(event_id):
    try:
        request = payment_api.current_request
        data = request.json_body
        if not data or 'qr_code_uuid' not in data or 'checkin_status' not in data or 'user_id' not in data:
            return Response(
                body={'error': 'Missing required fields: qr_code_uuid, checkin_status, and user_id'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
        qr_code_uuid = data['qr_code_uuid']
        checkin_status = data['checkin_status']
        user_id = data['user_id']
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.qr_code_checkin(event_id, qr_code_uuid, checkin_status, user_id, db)
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/update-order-status/{order_id}', methods=['POST'], cors=cors_config)
def update_order_status(order_id):
    """
    Update the status of an order. Used primarily for free tickets
    to mark them as confirmed without going through payment processing.
    """
    try:
        request = payment_api.current_request
        data = request.json_body
        
        if not data or 'status' not in data:
            return Response(
                body={'error': 'Missing required field: status'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
        
        status = data['status']
        payment_usecase = PaymentUseCase()
        result, status_code = payment_usecase.update_order_status(order_id, status, db)
        
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/simulate-installments', methods=['POST'], cors=cors_config)
def simulate_installments():
    """
    Simula as opções de parcelamento disponíveis para um determinado valor.
    Utiliza a API do Asaas para obter informações detalhadas de cada parcela,
    incluindo valor, data de vencimento e juros aplicados.
    """
    try:
        request = payment_api.current_request
        data = request.json_body
        
        if not data or 'value' not in data:
            return Response(
                body={'error': 'Missing required field: value'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
        
        value = float(data['value'])
        event_id = data.get('event_id', None)
        max_installments = data.get('max_installments', 12)  # Padrão: máximo da Asaas
        
        # Se um event_id for fornecido, verifica as políticas de parcelamento do evento
        if event_id:
            from chalicelib.src.usecases.event_usecase import EventUseCase
            event_usecase = EventUseCase()
            
            try:
                event_policies = event_usecase.get_event_policies(event_id)
                # Se o parcelamento não estiver habilitado para o evento, retorna apenas parcela única
                if not event_policies.get('installment_enabled', False):
                    return Response(
                        body=firestore_json_dumps({
                            'installments': [
                                {
                                    'installmentNumber': 1,
                                    'value': value,
                                    'totalValue': value,
                                    'installmentValue': value,
                                    'dueDate': datetime.now().strftime('%Y-%m-%d'),
                                    'interest': 0,
                                    'interestValue': 0
                                }
                            ]
                        }),
                        status_code=200,
                        headers={'Content-Type': 'application/json'}
                    )
                # Limita o parcelamento ao máximo configurado no evento
                event_max_installments = event_policies.get('max_installments', 12)
                max_installments = min(max_installments, event_max_installments)
            except Exception as e:
                # Se ocorrer erro ao buscar políticas, prossegue com o max_installments padrão
                print(f"Erro ao buscar políticas do evento: {str(e)}")
        
        # Garante que o valor máximo seja 12 (limite da Asaas)
        max_installments = min(max_installments, 12)
        
        # Usa o AsaasUseCase para consultar a API
        result, status_code = asaas_usecase.simulate_installments(value, max_installments)
        
        return Response(
            body=firestore_json_dumps(result) if isinstance(result, dict) else result,
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({'error': str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
