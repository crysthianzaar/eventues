import json
from typing import Any, Dict, Tuple
import requests
import os
from datetime import datetime, timedelta
from chalice import Blueprint, Response, CORSConfig, UnauthorizedError, NotFoundError
from chalicelib.src.utils.firebase import db, verify_token

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['*'],
    max_age=600
)

payment_api = Blueprint(__name__)
ASAAS_API_KEY = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk1ZTUwZTlkLTUyYmQtNGMyYy05MjViLTUwNjQzMWUxODZlZTo6JGFhY2hfMjZkMTY3NjQtMDA3NC00ZTg2LTk1MzItMzVjMjc2ZjNlNmRj'
ASAAS_API_URL = 'https://sandbox.asaas.com/api/v3'

class AsaasService:
    def __init__(self):
        self.headers = {
            'Content-Type': 'application/json',
            'access_token': ASAAS_API_KEY
        }

    def create_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(
            f'{ASAAS_API_URL}/customers',
            json=customer_data,
            headers=self.headers
        )
        return response.json() if response.ok else None

    def tokenize_card(self, tokenization_data: Dict[str, Any]) -> Dict[str, Any]:
        print("[DEBUG] Tokenizing card with data:", json.dumps(tokenization_data, indent=2))
        # Ensure creditCard fields match Asaas API requirements
        if 'creditCard' in tokenization_data:
            card_data = tokenization_data['creditCard']
            if 'expirationMonth' in card_data:
                card_data['expiryMonth'] = card_data.pop('expirationMonth')
            if 'expirationYear' in card_data:
                card_data['expiryYear'] = card_data.pop('expirationYear')

        response = requests.post(
            f'{ASAAS_API_URL}/creditCard/tokenize',
            json=tokenization_data,
            headers=self.headers
        )
        print("[DEBUG] Asaas API Response:", response.status_code)
        if not response.ok:
            print("[ERROR] Tokenization failed:", response.text)
        return response.json() if response.ok else None

    def create_payment(self, payment_data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        response = requests.post(
            f'{ASAAS_API_URL}/payments',
            json=payment_data,
            headers=self.headers
        )
        return response.json(), response.status_code

    def get_pix_qr_code(self, payment_id: str) -> Dict[str, Any]:
        response = requests.get(
            f'{ASAAS_API_URL}/payments/{payment_id}/pixQrCode',
            headers=self.headers
        )
        return response.json() if response.ok else None

    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        response = requests.get(
            f'{ASAAS_API_URL}/payments/{payment_id}',
            headers=self.headers
        )
        return response.json() if response.ok else None

asaas_service = AsaasService()

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
        if not data:
            return Response(
                body={'error': 'No data provided'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        required_fields = ['name', 'email', 'cpfCnpj']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return Response(
                body={'error': f'Missing required fields: {missing_fields}'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        customer_data = {
            'name': data['name'],
            'email': data['email'],
            'cpfCnpj': data['cpfCnpj'],
            'notificationDisabled': False
        }

        if data.get('phone'):
            customer_data['phone'] = data['phone']

        customer = asaas_service.create_customer(customer_data)
        if not customer:
            return Response(
                body={'error': 'Failed to create customer'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        return Response(
            body=customer,
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/tokenize-card', methods=['POST'], cors=cors_config)
def tokenize_card():
    try:
        request = payment_api.current_request
        data = request.json_body
        print("[DEBUG] Received tokenization request:", json.dumps(data, indent=2))
        
        if not data:
            return Response(
                body={'error': 'No data provided'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        required_fields = ['customer', 'creditCard', 'creditCardHolderInfo']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            print("[ERROR] Missing required fields:", missing_fields)
            return Response(
                body={'error': f'Missing required fields: {missing_fields}'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        tokenization_data = {
            'customer': data['customer'],
            'creditCard': data['creditCard'],
            'creditCardHolderInfo': data['creditCardHolderInfo'],
            'remoteIp': request.context.get('identity', {}).get('sourceIp', '')
        }
        print("[DEBUG] Prepared tokenization data:", json.dumps(tokenization_data, indent=2))

        token = asaas_service.tokenize_card(tokenization_data)
        if not token:
            print("[ERROR] Failed to get token from Asaas")
            return Response(
                body={'error': 'Failed to tokenize card'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        print("[DEBUG] Successfully tokenized card:", json.dumps(token, indent=2))
        return Response(
            body=token,
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        print("[ERROR] Tokenization exception:", str(e))
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/create_payment_session', methods=['POST'], cors=cors_config)
def create_payment_session():
    try:
        request = payment_api.current_request
        data = request.json_body
        if not data:
            return Response(
                body={'error': 'No data provided'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        # Check required fields
        required_fields = ['customer', 'event_id', 'tickets', 'payment']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return Response(
                body={'error': f'Missing required fields: {missing_fields}'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        # Validate tickets array
        tickets = data.get('tickets', [])
        if not tickets or not isinstance(tickets, list):
            return Response(
                body={'error': 'Invalid tickets format. Expected array of tickets'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        for ticket in tickets:
            if not ticket.get('ticket_id') or not ticket.get('quantity'):
                return Response(
                    body={'error': 'Each ticket must have ticket_id and quantity'},
                    status_code=400,
                    headers={'Content-Type': 'application/json'}
                )

        # Get event and validate tickets
        event_ref = db.collection('events').document(data['event_id'])
        event_doc = event_ref.get()
        if not event_doc.exists:
            return Response(
                body={'error': 'Event not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )

        event_data = event_doc.to_dict()
        event_slug = event_data.get('slug')
        if not event_slug:
            return Response(
                body={'error': 'Invalid event data'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        # Get ticket details
        subtotal_amount = 0
        for ticket in tickets:
            ticket_ref = event_ref.collection('tickets').document(ticket['ticket_id'])
            ticket_doc = ticket_ref.get()
            if not ticket_doc.exists:
                return Response(
                    body={'error': 'Ticket not found'},
                    status_code=404,
                    headers={'Content-Type': 'application/json'}
                )

            ticket_data = ticket_doc.to_dict()
            quantity = int(ticket['quantity'])
            subtotal_amount += float(ticket_data['valor']) * quantity
            
        # Calculate fee and total amount using the same logic as frontend
        # This matches the calculatePlatformFee function in the frontend
        def calculate_platform_fee(price):
            if price == 0:
                return 0  # Free tickets have no fee
            if price < 20:
                return 2  # Minimum fee
            return round((price * 7.99) / 100, 2)  # 7.99% with 2 decimal places
        
        # Calculate fees for each ticket
        fee_amount = 0
        for ticket in tickets:
            ticket_ref = event_ref.collection('tickets').document(ticket['ticket_id'])
            ticket_doc = ticket_ref.get()
            ticket_data = ticket_doc.to_dict()
            quantity = int(ticket['quantity'])
            ticket_price = float(ticket_data['valor'])
            fee_amount += calculate_platform_fee(ticket_price) * quantity
            
        total_amount = subtotal_amount + fee_amount
    
        # Create payment
        payment_method = data['payment'].get('billingType', '').lower()
        due_date = (datetime.now() + timedelta(days=3 if payment_method == 'boleto' else 1)).strftime('%Y-%m-%d')
        
        payment_data = {
            'customer': data['customer'],
            'billingType': payment_method.upper(),
            'value': total_amount,  # This now includes the fee
            'dueDate': due_date,
            'description': f"Compra de ingressos para o evento {event_data['name']}",
        }

        # Handle credit card payment
        if payment_method == 'credit_card' and data['payment'].get('creditCard'):
            card_data = data['payment']['creditCard']
            payment_data.update({
                'creditCardToken': card_data.get('token'),
                'creditCardHolderName': card_data.get('holderName'),
                'creditCardNumber': card_data.get('number'),
                'creditCardExpiryMonth': card_data.get('expiryMonth'),
                'creditCardExpiryYear': card_data.get('expiryYear'),
                'creditCardCcv': card_data.get('ccv')
            })

        payment_result, status_code = asaas_service.create_payment(payment_data)
        
        if status_code != 200:
            error_msg = payment_result.get('errors', [{}])[0].get('description', 'Payment failed')
            return Response(
                body={'error': error_msg},
                status_code=status_code,
                headers={'Content-Type': 'application/json'}
            )

        # Get PIX QR code if applicable
        if payment_method == 'pix' and payment_result.get('id'):
            pix_data = asaas_service.get_pix_qr_code(payment_result['id'])
            if pix_data:
                payment_result['pixQrCode'] = pix_data

        if payment_result.get('status') == 'PENDING':
            order_status = 'PAGAMENTO PENDENTE'
        if payment_result.get('status') == 'CONFIRMED':
            order_status = 'CONFIRMADO'
        # Save order to database
        order_ref = db.collection('orders').document(data["order_id"])
        order_ref.update({
            'payment_id': payment_result['id'],
            'payment_url': payment_result.get('invoiceUrl'),
            'status': order_status or payment_result['status'],
            'payment_details': payment_result
        })

        # Add fee and subtotal information to the response
        payment_result['subtotal_amount'] = subtotal_amount
        payment_result['fee_amount'] = fee_amount
        payment_result['total_amount'] = total_amount
        
        return Response(
            body=payment_result,
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/pix-qrcode/{payment_id}', methods=['GET'], cors=cors_config)
def get_pix_qrcode(payment_id):
    try:
        pix_data = asaas_service.get_pix_qr_code(payment_id)
        if not pix_data:
            return Response(
                body={'error': 'Failed to get PIX QR code'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        return Response(
            body=pix_data,
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/webhook', methods=['POST'], cors=cors_config)
def webhook():
    try:
        request = payment_api.current_request
        event = request.json_body
        
        # Get payment details
        payment_id = event.get('payment', {}).get('id')
        if not payment_id:
            return Response(
                body={'error': 'Invalid webhook data'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        # Get order by payment_id
        orders = db.collection('orders').where('payment_id', '==', payment_id).limit(1).get()
        if not orders:
            return Response(
                body={'error': 'Order not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )

        order = orders[0]
        
        # Update order status
        order.reference.update({
            'status': event['payment']['status'],
            'updated_at': datetime.now()
        })

        return Response(
            body={'status': 'received'},
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/check-payment-status/{payment_id}', methods=['GET'], cors=cors_config)
def check_payment_status(payment_id):
    try:
        # Obter o token de autenticação do cabeçalho
        auth_header = payment_api.current_request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            raise UnauthorizedError('Token de autenticação inválido')
        
        # Verificar token com Firebase
        id_token = auth_header.split('Bearer ')[1]
        decoded_token = verify_token(id_token)
        user_id = decoded_token

        # Buscar o pagamento no banco de dados
        orders = db.collection('orders').where('payment_id', '==', payment_id).limit(1).get()
        if not orders:
            raise NotFoundError('Pagamento não encontrado')

        order = orders[0]
        # Verificar se o usuário tem permissão para ver este pagamento
        if order.to_dict()['user_id'] != user_id:
            raise UnauthorizedError('Usuário não autorizado a ver este pagamento')

        # Consultar status na Asaas
        asaas_payment = asaas_service.get_payment_status(payment_id)
        
        if asaas_payment['status'] == 'PENDING':
            order_status = 'PAGAMENTO PENDENTE'
        if asaas_payment['status'] == 'CONFIRMED':
            order_status = 'CONFIRMANO'
        if asaas_payment['status'] == 'RECEIVED':
            order_status = 'CONFIRMADO'
        else:
            order_status = 'PAGAMENTO EM ANÁLISE'
        # Atualizar status no banco de dados se necessário
        if order.to_dict()['status'] != asaas_payment['status']:
            order.reference.update({
                'status': order_status,
                'updated_at': datetime.now()
            })

        return {
            'status': asaas_payment['status'],
            'value': float(asaas_payment['value']),
            'billingType': asaas_payment['billingType'],
            'invoiceUrl': asaas_payment.get('invoiceUrl'),
            'paymentDate': asaas_payment.get('paymentDate')
        }

    except (UnauthorizedError, NotFoundError) as e:
        return Response(
            body={'error': str(e)},
            status_code=e.status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
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
        if not data:
            return Response(
                body={'error': 'No data provided'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        # Validate required fields
        required_fields = ['user_id', 'event_id', 'tickets']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return Response(
                body={'error': f'Missing required fields: {missing_fields}'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        # Define platform fee calculation function (same as frontend)
        def calculate_platform_fee(price):
            if price == 0:
                return 0  # Free tickets have no fee
            if price < 20:
                return 2
            return round((price * 7.99) / 100, 2)  # 7.99% fee with 2 decimal places
        
        # Calculate total amount including platform fees
        subtotal = 0
        total_fees = 0
        tickets = data['tickets']
        
        for ticket in tickets:
            ticket_ref = db.collection('events').document(data['event_id']).collection('tickets').document(ticket['ticket_id'])
            ticket_doc = ticket_ref.get()
            if not ticket_doc.exists:
                return Response(
                    body={'error': 'Ticket not found'},
                    status_code=404,
                    headers={'Content-Type': 'application/json'}
                )
            
            ticket_data = ticket_doc.to_dict()
            ticket_price = ticket_data['valor']
            ticket_quantity = ticket['quantity']
            
            # Calculate base price and fee for this ticket
            ticket_subtotal = ticket_price * ticket_quantity
            ticket_fee = calculate_platform_fee(ticket_price) * ticket_quantity
            
            subtotal += ticket_subtotal
            total_fees += ticket_fee
        
        # Total amount is subtotal + fees
        total_amount = subtotal + total_fees

        # Save order to database
        order_ref = db.collection('orders').document()
        order_data = {
            'user_id': data['user_id'],
            'event_id': data['event_id'],
            "status": "AGUARDANDO INFORMAÇÕES",
            'tickets': tickets,
            'subtotal_amount': subtotal,
            'fee_amount': total_fees,
            'total_amount': total_amount,
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
        }
        order_ref.set(order_data)

        return Response(
            body={'order_id': order_ref.id},
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/update-order/{order_id}/tickets', methods=['PATCH'], cors=cors_config)
def update_order_tickets(order_id):
    try:
        request = payment_api.current_request
        data = request.json_body
        if not data or 'tickets' not in data:
            return Response(
                body={'error': 'No tickets data provided'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        # Get the order
        order_ref = db.collection('orders').document(order_id)
        order_doc = order_ref.get()
        if not order_doc.exists:
            return Response(
                body={'error': 'Order not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        
        order_data = order_doc.to_dict()
        event_id = order_data.get('event_id')

        # Define platform fee calculation function (same as frontend)
        def calculate_platform_fee(price):
            if price == 0:
                return 0  # Free tickets have no fee
            if price < 20:
                return 2  # Minimum fee for low-priced tickets
            return round((price * 7.99) / 100, 2)  # 7.99% fee with 2 decimal places
        
        # Calculate new total amount including platform fees
        subtotal = 0
        total_fees = 0
        tickets = data['tickets']
        
        for ticket in tickets:
            ticket_ref = db.collection('events').document(event_id).collection('tickets').document(ticket['ticket_id'])
            ticket_doc = ticket_ref.get()
            if not ticket_doc.exists:
                return Response(
                    body={'error': f'Ticket {ticket["ticket_id"]} not found'},
                    status_code=404,
                    headers={'Content-Type': 'application/json'}
                )
            
            ticket_data = ticket_doc.to_dict()
            ticket_price = ticket_data['valor']
            ticket_quantity = ticket['quantity']
            
            # Calculate base price and fee for this ticket
            ticket_subtotal = ticket_price * ticket_quantity
            ticket_fee = calculate_platform_fee(ticket_price) * ticket_quantity
            
            subtotal += ticket_subtotal
            total_fees += ticket_fee
        
        # Total amount is subtotal + fees
        total_amount = subtotal + total_fees

        # Update tickets, subtotal, fees, and total_amount fields
        order_ref.update({
            'tickets': tickets,
            'subtotal_amount': subtotal,
            'fee_amount': total_fees,
            'total_amount': total_amount,  # This now includes both subtotal and fees
            'updated_at': datetime.now()
        })

        return Response(
            body={
                'message': 'Order tickets updated successfully',
                'tickets': tickets,
                'subtotal_amount': subtotal,
                'fee_amount': total_fees,
                'total_amount': total_amount
            },
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/orders/{order_id}/participants', methods=['POST'], cors=cors_config)
def update_order_participants(order_id):
    try:
        request = payment_api.current_request
        data = request.json_body

        if not data or 'tickets' not in data:
            return Response(
                body={'error': 'No participant data provided'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        # Get the order
        order_ref = db.collection('orders').document(order_id)
        order_doc = order_ref.get()
        if not order_doc.exists:
            return Response(
                body={'error': 'Order not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )

        # Update order with participant information
        order_ref.update({
            'tickets': data['tickets'],
            "status": "PAGAMENTO PENDENTE",
            'updated_at': datetime.now()
        })

        return Response(
            body={'message': 'Participant information updated successfully'},
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/get-order/{order_id}', methods=['GET'], cors=cors_config)
def get_order(order_id):
    try:
        # Fetch order from database
        order_ref = db.collection('orders').document(order_id)
        order_doc = order_ref.get()
        if not order_doc.exists:
            return Response(
                body={'error': 'Order not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )

        order_data = order_doc.to_dict()
        # Convert datetime objects to ISO format strings
        order_data['created_at'] = order_data['created_at'].isoformat()
        order_data['updated_at'] = order_data['updated_at'].isoformat()
        # Ensure event_id is included in the response
        return Response(
            body={'event_id': order_data.get('event_id'), **order_data},
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
