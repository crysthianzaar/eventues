import json
import requests
from datetime import datetime
from cachetools import TTLCache, cached
from chalice import Blueprint, Response, CORSConfig
from chalicelib.src.utils.firebase import db, verify_token

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['*'],
    max_age=600
)

payment_api = Blueprint(__name__)
ASAAS_API_KEY = 'YOUR_ASAAS_API_KEY'  # Move to environment variables
ASAAS_API_URL = 'https://sandbox.asaas.com/api/v3'  # Use production URL in prod

# Cache configuration
payment_status_cache = TTLCache(maxsize=100, ttl=60)  # 1 minute cache for payment status
payment_history_cache = TTLCache(maxsize=100, ttl=300)  # 5 minutes cache for payment history

def create_asaas_customer(name, email, cpf):
    url = f"{ASAAS_API_URL}/customers"
    headers = {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json'
    }
    data = {
        'name': name,
        'email': email,
        'cpfCnpj': cpf
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

def create_asaas_payment(customer_id, value, description, due_date):
    url = f"{ASAAS_API_URL}/payments"
    headers = {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json'
    }
    data = {
        'customer': customer_id,
        'billingType': 'CREDIT_CARD',
        'value': value,
        'description': description,
        'dueDate': due_date
    }
    
    response = requests.post(url, headers=headers, json=data)
    return response.json()

@payment_api.route('/create_payment_session', methods=['POST'], cors=cors_config)
def create_payment_session():
    try:
        request = payment_api.current_request
        data = request.json_body
        
        # Validate required fields
        required_fields = ['name', 'email', 'cpf', 'event_id', 'ticket_id', 'quantity']
        for field in required_fields:
            if field not in data:
                return Response(
                    body={'error': f'Missing required field: {field}'},
                    status_code=400,
                    headers={'Content-Type': 'application/json'}
                )
        
        # Get event and ticket details
        event_ref = db.collection('events').document(data['event_id'])
        event = event_ref.get()
        if not event.exists:
            return Response(
                body={'error': 'Event not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        
        ticket_ref = event_ref.collection('tickets').document(data['ticket_id'])
        ticket = ticket_ref.get()
        if not ticket.exists:
            return Response(
                body={'error': 'Ticket not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        
        ticket_data = ticket.to_dict()
        event_data = event.to_dict()
        
        # Calculate total value
        total_value = float(ticket_data['price']) * int(data['quantity'])
        
        # Create or get ASAAS customer
        customer = create_asaas_customer(data['name'], data['email'], data['cpf'])
        
        if 'errors' in customer:
            return Response(
                body={'error': customer['errors']},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
        
        # Create payment
        payment = create_asaas_payment(
            customer['id'],
            total_value,
            f"Ingresso para {event_data['name']} - {ticket_data['name']} x{data['quantity']}",
            datetime.now().strftime('%Y-%m-%d')
        )
        
        if 'errors' in payment:
            return Response(
                body={'error': payment['errors']},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
        
        # Save order in Firebase
        order_ref = db.collection('orders').document()
        order_data = {
            'customer_id': customer['id'],
            'payment_id': payment['id'],
            'event_id': data['event_id'],
            'ticket_id': data['ticket_id'],
            'quantity': data['quantity'],
            'total_value': total_value,
            'status': 'pending',
            'created_at': datetime.now(),
            'customer_name': data['name'],
            'customer_email': data['email'],
            'customer_cpf': data['cpf']
        }
        order_ref.set(order_data)
        
        return Response(
            body={
                'payment_id': payment['id'],
                'order_id': order_ref.id
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

@payment_api.route('/webhook/asaas', methods=['POST'], cors=cors_config)
def asaas_webhook():
    try:
        request = payment_api.current_request
        data = request.json_body
        
        payment_id = data.get('payment', {}).get('id')
        if not payment_id:
            return Response(
                body={'error': 'Invalid webhook data'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
        
        # Find order by payment_id
        orders_ref = db.collection('orders')
        orders = orders_ref.where("payment_id", "==", payment_id).stream()
        
        order = next(orders, None)
        if not order:
            return Response(
                body={'error': 'Order not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        
        # Update order status
        payment_status = data.get('payment', {}).get('status')
        order_ref = orders_ref.document(order.id)
        
        if payment_status == 'CONFIRMED' or payment_status == 'RECEIVED':
            # Generate tickets
            tickets_ref = order_ref.collection('tickets')
            order_data = order.to_dict()
            
            for i in range(order_data['quantity']):
                ticket_data = {
                    'ticket_number': f"{order.id}-{i+1}",
                    'status': 'valid',
                    'created_at': datetime.now()
                }
                tickets_ref.add(ticket_data)
            
            order_ref.update({
                'status': 'completed',
                'completed_at': datetime.now()
            })
        elif payment_status in ['CANCELLED', 'FAILED', 'REFUNDED']:
            order_ref.update({
                'status': 'cancelled',
                'cancelled_at': datetime.now()
            })
        
        # Invalidate payment status cache when processing a payment
        if payment_id in payment_status_cache:
            del payment_status_cache[payment_id]
        
        return Response(
            body={'status': 'success'},
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/payments/{payment_id}/status', methods=['GET'], cors=cors_config)
@cached(payment_status_cache)
def get_payment_status(payment_id):
    try:
        orders_ref = db.collection('orders')
        orders = orders_ref.where("payment_id", "==", payment_id).stream()
        
        order = next(orders, None)
        if not order:
            return Response(
                body=json.dumps({"error": "Pagamento não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        
        order_data = order.to_dict()
        status = {
            'status': order_data['status'],
            'payment_id': order_data['payment_id']
        }
        
        return Response(
            body=json.dumps(status),
            status_code=200,
            headers={
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=60'  # 1 minute cache
            }
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/payments/user/{user_id}/history', methods=['GET'], cors=cors_config)
@cached(payment_history_cache)
def get_payment_history(user_id):
    try:
        orders_ref = db.collection('orders')
        orders = orders_ref.where("customer_id", "==", user_id).stream()
        
        history = []
        for order in orders:
            order_data = order.to_dict()
            history.append({
                'order_id': order.id,
                'payment_id': order_data['payment_id'],
                'event_id': order_data['event_id'],
                'ticket_id': order_data['ticket_id'],
                'quantity': order_data['quantity'],
                'total_value': order_data['total_value'],
                'status': order_data['status']
            })
        
        return Response(
            body=json.dumps(history),
            status_code=200,
            headers={
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300'  # 5 minutes cache
            }
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
