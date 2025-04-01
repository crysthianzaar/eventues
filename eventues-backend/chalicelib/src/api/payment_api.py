import json
from typing import Any, Dict, Tuple
import requests
import os
from datetime import datetime, timedelta
from chalice import Blueprint, Response, CORSConfig
from chalicelib.src.utils.firebase import db, verify_token

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['*'],
    max_age=600
)

payment_api = Blueprint(__name__)
ASAAS_API_KEY = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk1ZTUwZTlkLTUyYmQtNGMyYy05MjViLTUwNjQzMWUxODZlZTo6JGFhY2hfMjZkMTY3NjQtMDA3NC00ZTg2LTk1MzItMzVjMjc2ZjNlNmRj'
ASAAS_API_URL = 'https://sandbox.asaas.com/api/v3'

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['Content-Type', 'Authorization'],
    max_age=600,
    expose_headers=['Content-Type', 'Authorization'],
    allow_credentials=True
)

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

        required_fields = ['customer', 'event_id', 'ticket_id', 'quantity', 'payment']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return Response(
                body={'error': f'Missing required fields: {missing_fields}'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        # Get event and ticket details
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
        ticket_ref = event_ref.collection('tickets').document(data['ticket_id'])
        ticket_doc = ticket_ref.get()
        if not ticket_doc.exists:
            return Response(
                body={'error': 'Ticket not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )

        ticket_data = ticket_doc.to_dict()
        quantity = int(data['quantity'])
        total_amount = float(ticket_data['valor']) * quantity

        # Create payment
        payment_method = data['payment'].get('billingType', '').lower()
        due_date = (datetime.now() + timedelta(days=3 if payment_method == 'boleto' else 1)).strftime('%Y-%m-%d')
        
        payment_data = {
            'customer': data['customer'],
            'billingType': payment_method.upper(),
            'value': total_amount,
            'dueDate': due_date,
            'description': f"{ticket_data['nome']} - {event_data['name']} - {quantity}x",
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

        # Save order to database
        order_ref = db.collection('orders').document()
        order_data = {
            'payment_id': payment_result['id'],
            'user_id': data['user_id'],
            'payment_url': payment_result.get('invoiceUrl'),
            'status': payment_result['status'],
            'customer_id': data['customer'],
            'event_id': data['event_id'],
            'ticket_id': data['ticket_id'],
            'quantity': quantity,
            'total_amount': total_amount,
            'created_at': datetime.now(),
            'updated_at': datetime.now(),
            'payment_details': payment_result
        }
        order_ref.set(order_data)

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
