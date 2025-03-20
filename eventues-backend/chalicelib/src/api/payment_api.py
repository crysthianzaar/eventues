import json
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

def create_asaas_payment_link(customer_id, value, description, payment_method, due_date, event_slug, event_id, success_url, ticket_id):
    url = f"{ASAAS_API_URL}/payments"
    headers = {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json'
    }
    
    # Map frontend payment methods to Asaas billing types
    billing_type_map = {
        'pix': 'PIX',
        'boleto': 'BOLETO',
        'credit_card': 'CREDIT_CARD',
        'debit_card': 'DEBIT_CARD'
    }
    
    # Create a compact external reference
    external_ref = f"{event_id[:8]}:{event_slug[:30]}"
    
    # Create payment request
    response = requests.post(url, headers=headers, json={
        'customer': customer_id,
        'billingType': 'UNDEFINED',
        'value': value,
        'description': description,
        'externalReference': external_ref,
        'postalService': False,
        'dueDate': due_date
    })
    
    payment_data = response.json()
    if 'errors' in payment_data:
        return payment_data
        
    payment_id = payment_data['id']
    
    # Update payment with callback URL after creation
    update_url = f"{ASAAS_API_URL}/payments/{payment_id}"
    update_data = {
        "callback": {
            "successUrl": success_url,
            "autoRedirect": True
        }
    }
    
    update_response = requests.post(update_url, headers=headers, json=update_data)
    if not update_response.ok:
        print(f"Warning: Failed to update payment callback URL: {update_response.text}")
    
    # Get the appropriate payment URL based on the payment method
    payment_url = None
    if payment_method == 'pix':
        payment_url = payment_data.get('invoiceUrl')  # For PIX
    elif payment_method == 'boleto':
        payment_url = payment_data.get('bankSlipUrl')  # For Boleto
    elif payment_method in ['credit_card', 'debit_card']:
        payment_url = payment_data.get('invoiceUrl')  # For Credit/Debit Card
    
    return {
        'payment_id': payment_id,
        'payment_url': payment_url,
        'status': payment_data['status'],
        'success_url': success_url,
        'ticket_id': ticket_id
    }

@payment_api.route('/create_payment_session', methods=['POST'], cors=cors_config)
def create_payment_session():
    try:
        request = payment_api.current_request
        data = request.json_body
        
        # Validate required fields
        required_fields = ['name', 'email', 'cpf', 'event_id', 'ticket_id', 'payment']
        for field in required_fields:
            if field not in data:
                return Response(
                    body={'error': f'Missing required field: {field}'},
                    status_code=400,
                    headers={'Content-Type': 'application/json'}
                )

        # Get event details from database
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
                body={'error': 'Event slug not found'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        # Get ticket details from database
        ticket = event_ref.collection('tickets').document(data['ticket_id']).get()
        if not ticket.exists:
            return Response(
                body={'error': 'Ticket not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        
        ticket_data = ticket.to_dict()
        
        # Calculate total amount
        quantity = data.get('quantity', 1)
        total_amount = ticket_data['valor'] * quantity

        # Set due date to 24 hours from now for PIX/Credit Card, 3 days for Boleto
        payment_method = data['payment'].get('method', 'pix')
        if payment_method == 'boleto':
            due_date = (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d')
        else:
            due_date = (datetime.now() + timedelta(hours=24)).strftime('%Y-%m-%d')

        try:
            # Try to create customer
            customer = create_asaas_customer(data['name'], data['email'], data['cpf'])
            
            if 'errors' in customer:
                # If customer already exists, try to get it
                customers = requests.get(
                    f"{ASAAS_API_URL}/customers",
                    headers={'access_token': ASAAS_API_KEY},
                    params={'cpfCnpj': data['cpf']}
                )
                if customers.status_code == 200 and customers.json().get('data'):
                    customer = customers.json()['data'][0]
                else:
                    return Response(
                        body={'error': 'Failed to create/get customer'},
                        status_code=400,
                        headers={'Content-Type': 'application/json'}
                    )
            success_url = f"https://eventues.com/i/{data['ticket_id']}"
            # Create payment link
            payment_info = create_asaas_payment_link(
                customer_id=customer['id'],
                value=total_amount,
                description=f"Ingresso para {ticket_data.get('event_name', 'Evento')} - {ticket_data.get('nome', 'Ingresso')} x{quantity}",
                payment_method=payment_method,
                due_date=due_date,
                event_slug=event_slug,
                event_id=data['event_id'],
                success_url=success_url,
                ticket_id=data['ticket_id']
            )

            if 'errors' in payment_info:
                return Response(
                    body={'error': payment_info['errors']},
                    status_code=400,
                    headers={'Content-Type': 'application/json'}
                )

            # Add order info
            payment_info.update({
                'customer_id': customer['id'],
                'event_id': data['event_id'],
                'ticket_id': data['ticket_id'],
                'quantity': quantity,
                'total_value': total_amount,
                'created_at': datetime.now().isoformat(),
                'due_date': due_date,
                'user_id': data.get('user_id'),  
                'status': 'pending'  
            })
            
            # Save to database
            db.collection('orders').document(payment_info['payment_id']).set(payment_info)

            return Response(
                body=payment_info,
                status_code=200,
                headers={'Content-Type': 'application/json'}
            )

        except Exception as e:
            return Response(
                body={'error': str(e)},
                status_code=500,
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
                'status': payment_status.lower(),
                'updated_at': datetime.now()
            })
        
        return Response(
            body={'message': 'Webhook processed successfully'},
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/orders/{order_id}', methods=['GET'], cors=cors_config)
def get_order(order_id):
    try:
        order_ref = db.collection('orders').document(order_id)
        order = order_ref.get()
        
        if not order.exists:
            return Response(
                body={'error': 'Order not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        
        order_data = order.to_dict()
        
        # Get tickets if order is completed
        if order_data['status'] == 'completed':
            tickets = []
            tickets_ref = order_ref.collection('tickets').stream()
            for ticket in tickets_ref:
                ticket_data = ticket.to_dict()
                ticket_data['id'] = ticket.id
                tickets.append(ticket_data)
            order_data['tickets'] = tickets
        
        return Response(
            body=order_data,
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@payment_api.route('/payment/{payment_id}', methods=['GET'], cors=cors_config)
def get_payment_details(payment_id):
    url = f"{ASAAS_API_URL}/payments/{payment_id}"
    headers = {
        'access_token': ASAAS_API_KEY
    }
    
    response = requests.get(url, headers=headers)
    if not response.ok:
        return Response(
            body={'error': 'Payment not found'},
            status_code=404,
            headers={'Content-Type': 'application/json'}
        )
        
    payment_data = response.json()
    external_ref = payment_data.get('externalReference', '')
    
    # Parse the compact external reference
    event_id = None
    event_slug = None
    if ':' in external_ref:
        event_id_part, event_slug = external_ref.split(':', 1)
        event_id = event_id_part + '0' * (36 - len(event_id_part))  # Pad the ID back to full length
    
    # Get additional event details from database if needed
    event_details = {}
    if event_id:
        event_doc = db.collection('events').document(event_id).get()
        if event_doc.exists:
            event_details = event_doc.to_dict()
    
    return Response(
        body={
            'payment_id': payment_data['id'],
            'status': payment_data['status'],
            'value': payment_data['value'],
            'billingType': payment_data['billingType'],
            'event_id': event_id,
            'event_slug': event_slug,
            'event_name': event_details.get('name', ''),
            'description': payment_data.get('description', ''),
            'created_at': payment_data.get('dateCreated'),
            'paid_at': payment_data.get('confirmedDate')
        },
        status_code=200,
        headers={'Content-Type': 'application/json'}
    )

def get_payment_status(payment_id):
    url = f"{ASAAS_API_URL}/payments/{payment_id}"
    headers = {
        'access_token': ASAAS_API_KEY
    }
    
    response = requests.get(url, headers=headers)
    return response.json()

def get_payment_history(user_id):
    # Get user's orders from Firebase
    orders = db.collection('orders').where('user_id', '==', user_id).stream()
    
    payment_history = []
    for order in orders:
        order_data = order.to_dict()
        payment_history.append({
            'order_id': order.id,
            'payment_id': order_data['payment_id'],
            'status': order_data['status'],
            'total_value': order_data['total_value'],
            'created_at': order_data['created_at'],
            'completed_at': order_data.get('completed_at'),
            'event_id': order_data.get('event_id'),
            'ticket_id': order_data.get('ticket_id'),
            'quantity': order_data.get('quantity')
        })
    
    return payment_history

@payment_api.route('/orders/{order_id}/cancel', methods=['POST'], cors=cors_config)
def cancel_order(order_id):
    try:
        # Get order details
        order_ref = db.collection('orders').document(order_id)
        order = order_ref.get()
        
        if not order.exists:
            return Response(
                body={'error': 'Order not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
            
        order_data = order.to_dict()
        
        # Check if order can be cancelled
        if order_data.get('status') not in ['pending', 'waiting']:
            return Response(
                body={'error': 'Order cannot be cancelled in its current status'},
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )
            
        # Cancel payment in Asaas if it exists
        payment_id = order_data.get('payment_id')
        if payment_id:
            url = f"{ASAAS_API_URL}/payments/{payment_id}"
            headers = {
                'access_token': ASAAS_API_KEY
            }
            
            response = requests.delete(url, headers=headers)
            if not response.ok:
                return Response(
                    body={'error': 'Failed to cancel payment'},
                    status_code=500,
                    headers={'Content-Type': 'application/json'}
                )
        
        # Update order status
        order_ref.update({
            'status': 'cancelled',
            'cancelled_at': datetime.now().isoformat()
        })
        
        return Response(
            body={'message': 'Order cancelled successfully'},
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
        
    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
