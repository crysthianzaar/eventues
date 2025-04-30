
from datetime import datetime, timedelta
from chalicelib.src.usecases.assas_usecase import AsaasUseCase
from chalice import UnauthorizedError, NotFoundError

class PaymentUseCase:

    def create_order(self, data: dict, db) -> tuple:
        try:
            if not data:
                return {'error': 'No data provided'}, 400

            required_fields = ['user_id', 'event_id', 'tickets']
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return {'error': f'Missing required fields: {missing_fields}'}, 400

            def calculate_platform_fee(price):
                if price == 0:
                    return 0
                if price < 20:
                    return 2
                return round((price * 7.99) / 100, 2)

            subtotal = 0
            total_fees = 0
            tickets = data['tickets']

            for ticket in tickets:
                ticket_ref = db.collection('events').document(data['event_id']).collection('tickets').document(ticket['ticket_id'])
                ticket_doc = ticket_ref.get()
                if not ticket_doc.exists:
                    return {'error': 'Ticket not found'}, 404

                ticket_data = ticket_doc.to_dict()
                ticket_price = ticket_data['valor']
                ticket_quantity = ticket['quantity']
                ticket_subtotal = ticket_price * ticket_quantity
                ticket_fee = calculate_platform_fee(ticket_price) * ticket_quantity
                subtotal += ticket_subtotal
                total_fees += ticket_fee

            total_amount = subtotal + total_fees

            order_ref = db.collection('orders').document()
            order_data = {
                'user_id': data['user_id'],
                'event_id': data['event_id'],
                'status': 'AGUARDANDO INFORMAÇÕES',
                'tickets': tickets,
                'subtotal_amount': subtotal,
                'fee_amount': total_fees,
                'total_amount': total_amount,
                'created_at': datetime.now(),
                'updated_at': datetime.now(),
            }
            order_ref.set(order_data)
            return {'order_id': order_ref.id}, 200
        except Exception as e:
            return {'error': str(e)}, 500

    def create_customer(self, data: dict, asaas_usecase) -> tuple:
        if not data:
            return {'error': 'No data provided'}, 400

        required_fields = ['name', 'email', 'cpfCnpj']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return {'error': f'Missing required fields: {missing_fields}'}, 400

        customer_data = {
            'name': data['name'],
            'email': data['email'],
            'cpfCnpj': data['cpfCnpj'],
            'notificationDisabled': False
        }
        if data.get('phone'):
            customer_data['phone'] = data['phone']

        try:
            customer = asaas_usecase.create_customer(customer_data)
        except Exception as exc:
            return {'error': f'Asaas integration error: {str(exc)}'}, 500

        if not customer or customer.get('errors'):
            error_msg = 'Failed to create customer'
            if customer and customer.get('errors'):
                error_details = [err.get('description') or err.get('message') or str(err) for err in customer['errors']]
                error_msg = "; ".join(error_details) if error_details else error_msg
            return {'error': error_msg}, 400

        return customer, 200

    def tokenize_card(self, data: dict, asaas_usecase: AsaasUseCase, remote_ip: str = ""):
        """
        Handles all business logic for card tokenization, including validation and Asaas integration.
        Returns (result: dict, status_code: int)
        """
        if not data:
            return {'error': 'No data provided'}, 400

        required_fields = ['customer', 'creditCard', 'creditCardHolderInfo']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return {'error': f'Missing required fields: {missing_fields}'}, 400

        tokenization_data = {
            'customer': data['customer'],
            'creditCard': data['creditCard'],
            'creditCardHolderInfo': data['creditCardHolderInfo'],
            'remoteIp': remote_ip or ''
        }
        try:
            token = asaas_usecase.tokenize_card(tokenization_data)
        except Exception as exc:
            return {'error': f'Asaas integration error: {str(exc)}'}, 500

        if not token or token.get('errors'):
            error_msg = 'Failed to tokenize card'
            if token and token.get('errors'):
                error_details = [err.get('description') or err.get('message') or str(err) for err in token['errors']]
                error_msg = "; ".join(error_details) if error_details else error_msg
            return {'error': error_msg}, 400

        return token, 200

    def create_payment_session(self, data: dict, asaas_usecase: AsaasUseCase, db) -> tuple:
        if not data:
            return {'error': 'No data provided'}, 400

        required_fields = ['customer', 'event_id', 'tickets', 'payment']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return {'error': f'Missing required fields: {missing_fields}'}, 400

        tickets = data.get('tickets', [])
        if not tickets or not isinstance(tickets, list):
            return {'error': 'Invalid tickets format. Expected array of tickets'}, 400

        for ticket in tickets:
            if not ticket.get('ticket_id') or not ticket.get('quantity'):
                return {'error': 'Each ticket must have ticket_id and quantity'}, 400

        # 2. Get event and validate tickets
        event_ref = db.collection('events').document(data['event_id'])
        event_doc = event_ref.get()
        if not event_doc.exists:
            return {'error': 'Event not found'}, 404

        event_data = event_doc.to_dict()
        event_slug = event_data.get('slug')
        if not event_slug:
            return {'error': 'Invalid event data'}, 400

        # 3. Get ticket details and calculate subtotal
        subtotal_amount = 0
        for ticket in tickets:
            ticket_ref = event_ref.collection('tickets').document(ticket['ticket_id'])
            ticket_doc = ticket_ref.get()
            if not ticket_doc.exists:
                return {'error': 'Ticket not found'}, 404
            ticket_data = ticket_doc.to_dict()
            quantity = int(ticket['quantity'])
            subtotal_amount += float(ticket_data['valor']) * quantity

        # 4. Calculate platform fee
        def calculate_platform_fee(price):
            if price == 0:
                return 0
            if price < 20:
                return 2
            return round((price * 7.99) / 100, 2)

        fee_amount = 0
        for ticket in tickets:
            ticket_ref = event_ref.collection('tickets').document(ticket['ticket_id'])
            ticket_doc = ticket_ref.get()
            ticket_data = ticket_doc.to_dict()
            quantity = int(ticket['quantity'])
            ticket_price = float(ticket_data['valor'])
            fee_amount += calculate_platform_fee(ticket_price) * quantity
        total_amount = subtotal_amount + fee_amount
        
        # 4.5 Aplicar desconto do cupom se fornecido
        discount_amount = 0
        coupon_info = None
        
        if data.get('coupon'):
            coupon_data = data['coupon']
            if coupon_data.get('coupon_id') and coupon_data.get('discount_amount'):
                discount_amount = float(coupon_data['discount_amount'])
                coupon_info = {
                    'coupon_id': coupon_data['coupon_id'],
                    'code': coupon_data.get('code', ''),
                    'discount_amount': discount_amount,
                    'original_amount': total_amount
                }
                
                # Verificar se o desconto é válido (não maior que o valor total)
                if discount_amount > total_amount:
                    discount_amount = total_amount
                    coupon_info['discount_amount'] = discount_amount
                
                # Aplicar desconto
                total_amount = total_amount - discount_amount
                
                # Valor mínimo para pagamento
                if total_amount < 0.5:
                    total_amount = 0.5
                    
                # Incrementar o contador de usos do cupom
                try:
                    # Obter referência para o documento do cupom
                    coupon_ref = db.collection('events').document(data['event_id']).collection('coupons').document(coupon_data['coupon_id'])
                    coupon_doc = coupon_ref.get()
                    
                    if coupon_doc.exists:
                        # Atualizar o contador de usos
                        current_uses = coupon_doc.to_dict().get('uses_count', 0)
                        coupon_ref.update({
                            'uses_count': current_uses + 1,
                            'updated_at': datetime.now()
                        })
                        
                        # Atualizar informações no coupon_info para retornar ao frontend
                        coupon_info['uses_count'] = current_uses + 1
                        
                        print(f"Cupom {coupon_data['code']} utilizado. Total de usos: {current_uses + 1}")
                    else:
                        print(f"Cupom {coupon_data['coupon_id']} não encontrado ao tentar atualizar contador.")
                except Exception as e:
                    print(f"Erro ao atualizar contador de usos do cupom: {str(e)}")
        
        # 5. Create payment
        payment_method = data['payment'].get('billingType', '').lower()
        due_date = (datetime.now() + timedelta(days=3 if payment_method == 'boleto' else 1)).strftime('%Y-%m-%d')
        payment_data = {
            'customer': data['customer'],
            'billingType': payment_method.upper(),
            'value': total_amount,
            'dueDate': due_date,
            'description': f"Compra de ingressos para o evento {event_data['name']}"
        }
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
        payment_result, status_code = asaas_usecase.create_payment(payment_data)
        if status_code != 200:
            error_msg = payment_result.get('errors', [{}])[0].get('description', 'Payment failed')
            return {'error': error_msg}, status_code

        # 6. Get PIX QR code if applicable
        if payment_method == 'pix' and payment_result.get('id'):
            pix_data = asaas_usecase.get_pix_qr_code(payment_result['id'])
            if pix_data:
                payment_result['pixQrCode'] = pix_data

        # 7. Save order to database
        order_status = None
        if payment_result.get('status') == 'PENDING':
            order_status = 'PAGAMENTO PENDENTE'
        if payment_result.get('status') == 'CONFIRMED':
            order_status = 'CONFIRMADO'
        order_ref = db.collection('orders').document(data["order_id"])
        order_ref.update({
            'payment_id': payment_result['id'],
            'payment_url': payment_result.get('invoiceUrl'),
            'status': order_status or payment_result['status'],
            'payment_details': payment_result
        })
        payment_result['subtotal_amount'] = subtotal_amount
        payment_result['fee_amount'] = fee_amount
        payment_result['total_amount'] = total_amount
        
        # Adicionar informações do cupom no resultado
        if coupon_info:
            payment_result['coupon'] = coupon_info
            payment_result['discount_amount'] = discount_amount
            payment_result['original_amount'] = coupon_info['original_amount']
            
            # Atualizar informações do cupom na ordem
            order_ref.update({
                'coupon_info': coupon_info,
                'discount_amount': discount_amount,
                'original_amount': coupon_info['original_amount']
            })
            
        return payment_result, 200

    def get_pix_qrcode(self, payment_id: str, asaas_usecase: AsaasUseCase) -> tuple:
        try:
            pix_data = asaas_usecase.get_pix_qr_code(payment_id)
            if not pix_data:
                return {'error': 'Failed to get PIX QR code'}, 400
            return pix_data, 200
        except Exception as e:
            return {'error': str(e)}, 500

    def process_webhook(self, event: dict, db) -> tuple:
        try:
            # 1. Validate event type
            event_type = event.get('event')
            if not event_type:
                return {'error': 'Invalid webhook data: missing event type'}, 400

            # 2. Get payment details
            payment = event.get('payment')
            if not payment:
                return {'error': 'Invalid webhook data: missing payment'}, 400
            payment_id = payment.get('id')
            if not payment_id:
                return {'error': 'Invalid webhook data: missing payment ID'}, 400

            # 3. Get order by payment_id
            orders = db.collection('orders').where('payment_id', '==', payment_id).limit(1).get()
            if not orders or len(orders) == 0:
                return {'error': f'Order not found for payment_id {payment_id}'}, 404
            order = orders[0]
            order_data = order.to_dict()

            # 4. Map Asaas status to Eventues status
            asaas_status = payment.get('status')
            if not asaas_status:
                return {'error': 'Invalid webhook data: missing payment status'}, 400
            status_map = {
                'PENDING': 'PAGAMENTO PENDENTE',
                'RECEIVED': 'CONFIRMADO',
                'CONFIRMED': 'CONFIRMADO',
                'OVERDUE': 'CANCELADO',
                'REFUNDED': 'CANCELADO',
                'PARTIALLY_REFUNDED': 'CANCELADO',
                'CHARGEBACK_REQUESTED': 'CANCELADO',
                'CHARGEBACK_DISPUTE': 'CANCELADO',
                'DELETED': 'CANCELADO',
                'RESTORED': 'CANCELADO',
                'ANTICIPATED': 'CONFIRMADO',
                'RECEIVED_IN_CASH_UNDONE': 'CANCELADO'
            }
            eventues_status = status_map.get(asaas_status, 'PAGAMENTO EM ANÁLISE')

            # 5. Check if status has actually changed
            current_status = order_data.get('status')
            if current_status != eventues_status:
                update_data = {
                    'status': eventues_status,
                    'updated_at': datetime.now(),
                    'payment_details': {
                        'status': asaas_status,
                        'last_event': event_type,
                        'last_update': datetime.now().isoformat()
                    }
                }
                if 'value' in payment:
                    update_data['payment_details']['value'] = float(payment['value'])
                if 'netValue' in payment:
                    update_data['payment_details']['netValue'] = float(payment['netValue'])
                if 'billingType' in payment:
                    update_data['payment_details']['billingType'] = payment['billingType']
                if 'paymentDate' in payment:
                    update_data['payment_details']['paymentDate'] = payment['paymentDate']
                order.reference.update(update_data)

            # 6. Return success response
            return {
                'status': 'success',
                'message': 'Webhook processed successfully',
                'order_id': order.id,
                'new_status': eventues_status
            }, 200
        except Exception as e:
            return {'error': f'Error processing webhook: {str(e)}'}, 500

    def check_payment_status(self, payment_id: str, headers: dict,
                             asaas_usecase: AsaasUseCase, db, verify_token) -> tuple:
        try:
            # Obter o token de autenticação do cabeçalho
            auth_header = headers.get('Authorization', '')
            if not auth_header.startswith('Bearer '):
                raise UnauthorizedError('Token de autenticação inválido')
            id_token = auth_header.split('Bearer ')[1]
            user_id = verify_token(id_token)

            # Buscar o pagamento no banco de dados
            orders = db.collection('orders').where('payment_id', '==', payment_id).limit(1).get()
            if not orders:
                raise NotFoundError('Pagamento não encontrado')
            order = orders[0]
            if order.to_dict()['user_id'] != user_id:
                raise UnauthorizedError('Usuário não autorizado a ver este pagamento')

            # Consultar status na Asaas
            asaas_payment = asaas_usecase.get_payment_status(payment_id)
            status_map = {
                'PENDING': 'PAGAMENTO PENDENTE',
                'RECEIVED': 'CONFIRMADO',
                'CONFIRMED': 'CONFIRMADO',
                'OVERDUE': 'CANCELADO',
                'REFUNDED': 'CANCELADO',
                'PARTIALLY_REFUNDED': 'CANCELADO',
                'CHARGEBACK_REQUESTED': 'CANCELADO',
                'CHARGEBACK_DISPUTE': 'CANCELADO',
                'DELETED': 'CANCELADO',
                'RESTORED': 'CANCELADO',
                'ANTICIPATED': 'CONFIRMADO',
                'RECEIVED_IN_CASH_UNDONE': 'CANCELADO'
            }
            order_status = status_map.get(asaas_payment['status'], 'PAGAMENTO EM ANÁLISE')

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
            }, 200
        except (UnauthorizedError, NotFoundError) as e:
            return {'error': str(e)}, e.status_code
        except Exception:
            return {'error': 'Erro ao verificar status do pagamento'}, 500

    def update_order_tickets(self, order_id: str, tickets: list, db) -> tuple:
        try:
            if not tickets:
                return {'error': 'No tickets data provided'}, 400

            # Get the order
            order_ref = db.collection('orders').document(order_id)
            order_doc = order_ref.get()
            if not order_doc.exists:
                return {'error': 'Order not found'}, 404

            order_data = order_doc.to_dict()
            event_id = order_data.get('event_id')

            def calculate_platform_fee(price):
                if price == 0:
                    return 0
                if price < 20:
                    return 2
                return round((price * 7.99) / 100, 2)

            subtotal = 0
            total_fees = 0
            for ticket in tickets:
                ticket_ref = db.collection('events').document(event_id).collection('tickets').document(ticket['ticket_id'])
                ticket_doc = ticket_ref.get()
                if not ticket_doc.exists:
                    return {'error': f'Ticket {ticket["ticket_id"]} not found'}, 404
                ticket_data = ticket_doc.to_dict()
                ticket_price = ticket_data['valor']
                ticket_quantity = ticket['quantity']
                ticket_subtotal = ticket_price * ticket_quantity
                ticket_fee = calculate_platform_fee(ticket_price) * ticket_quantity
                subtotal += ticket_subtotal
                total_fees += ticket_fee

            total_amount = subtotal + total_fees

            order_ref.update({
                'tickets': tickets,
                'subtotal_amount': subtotal,
                'fee_amount': total_fees,
                'total_amount': total_amount,
                'updated_at': datetime.now()
            })

            return {
                'message': 'Order tickets updated successfully',
                'tickets': tickets,
                'subtotal_amount': subtotal,
                'fee_amount': total_fees,
                'total_amount': total_amount
            }, 200
        except Exception as e:
            return {'error': str(e)}, 500

    def update_order_participants(self, order_id: str, tickets: list, db) -> tuple:
        from datetime import datetime
        import uuid
        try:
            if not tickets:
                return {'error': 'No participant data provided'}, 400

            order_ref = db.collection('orders').document(order_id)
            order_doc = order_ref.get()
            if not order_doc.exists:
                return {'error': 'Order not found'}, 404
            
            # Nova estrutura para garantir QR codes únicos por participante
            restructured_tickets = []
            
            for ticket in tickets:
                # Verifica se temos múltiplos participantes no mesmo ticket
                if 'participants' in ticket and isinstance(ticket['participants'], list) and len(ticket['participants']) > 0:
                    # Se a quantidade for 1, mantém a estrutura original com apenas um qr_code_uuid
                    if ticket.get('quantity', 1) == 1:
                        # Garante que exista um qr_code_uuid
                        if 'qr_code_uuid' not in ticket:
                            ticket['qr_code_uuid'] = str(uuid.uuid4())
                        restructured_tickets.append(ticket)
                    else:
                        # Para quantity > 1, divide em múltiplos tickets, um para cada participante
                        # cada um com seu próprio qr_code_uuid
                        participants = ticket.get('participants', [])
                        for i, participant in enumerate(participants):
                            # Cria um ticket individual para cada participante
                            individual_ticket = ticket.copy()
                            individual_ticket['quantity'] = 1
                            individual_ticket['qr_code_uuid'] = str(uuid.uuid4())
                            individual_ticket['participants'] = [participant]
                            
                            # Ajusta o valor total para refletir apenas 1 ingresso
                            if 'valor_total' in individual_ticket:
                                base_valor = individual_ticket.get('valor', 0)
                                base_taxa = individual_ticket.get('taxa', 0)
                                individual_ticket['valor_total'] = base_valor + base_taxa
                                
                            restructured_tickets.append(individual_ticket)
                else:
                    # Se não houver participantes ainda, mantém a estrutura original
                    restructured_tickets.append(ticket)
                    
            # Atualiza a ordem com a nova estrutura de tickets
            order_ref.update({
                'tickets': restructured_tickets,
                'status': 'PAGAMENTO PENDENTE',
                'updated_at': datetime.now()
            })

            return {'message': 'Participant information updated successfully, QR codes generated'}, 200
        except Exception as e:
            return {'error': str(e)}, 500

    def update_order_user(self, order_id: str, user_id: str, db) -> tuple:
        try:
            if not user_id:
                return {'error': 'user_id is required'}, 400

            order_ref = db.collection('orders').document(order_id)
            order_doc = order_ref.get()
            if not order_doc.exists:
                return {'error': 'Order not found'}, 404

            order_ref.update({
                'user_id': user_id,
                'updated_at': datetime.now()
            })

            return {'message': 'Order user_id updated successfully'}, 200
        except Exception as e:
            return {'error': str(e)}, 500

    def get_order(self, order_id: str, db) -> tuple:
        try:
            order_ref = db.collection('orders').document(order_id)
            order_doc = order_ref.get()
            if not order_doc.exists:
                return {'error': 'Order not found'}, 404

            order_data = order_doc.to_dict()
            # Serializar datas
            if 'created_at' in order_data and hasattr(order_data['created_at'], 'isoformat'):
                order_data['created_at'] = order_data['created_at'].isoformat()
            if 'updated_at' in order_data and hasattr(order_data['updated_at'], 'isoformat'):
                order_data['updated_at'] = order_data['updated_at'].isoformat()
            return {'event_id': order_data.get('event_id'), **order_data}, 200
        except Exception as e:
            return {'error': str(e)}, 500

    def get_event_participants(self, event_id: str, db) -> tuple:
        try:
            orders = db.collection('orders').where('event_id', '==', event_id).where('status', 'in', ['CONFIRMADO', 'CONFIRMED', 'RECEIVED']).stream()
            participants = []
            for order in orders:
                order_data = order.to_dict()
                if 'tickets' in order_data and isinstance(order_data['tickets'], list):
                    for ticket_idx, ticket in enumerate(order_data['tickets']):
                        participant_info = {}
                        if 'participants' in ticket and isinstance(ticket['participants'], list) and len(ticket['participants']) > 0:
                            first_participant = ticket['participants'][0]
                            participant_info['fullName'] = first_participant.get('fullName', 'Nome não informado')
                            participant_info['gender'] = first_participant.get('gender', '')
                            participant_info['birthDate'] = first_participant.get('birthDate', '')
                            standard_fields = ['fullName', 'gender', 'birthDate', 'termsAccepted']
                            categories = {}
                            for key, value in first_participant.items():
                                if key not in standard_fields:
                                    categories[key] = value
                            participant_info['categories'] = categories
                        flat_participant = {
                            'order_id': order.id,
                            'participant_index': ticket_idx,
                            'fullName': participant_info.get('fullName', 'Nome não informado'),
                            'gender': participant_info.get('gender', ''),
                            'birthDate': participant_info.get('birthDate', ''),
                            'categories': participant_info.get('categories', {}),
                            'ticket_name': ticket.get('ticket_name', ''),
                            'ticket_id': ticket.get('ticket_id', ''),
                            'qr_code_uuid': ticket.get('qr_code_uuid', ''),
                            'order_status': order_data.get('status', ''),
                            'created_at': order_data.get('created_at').isoformat() if 'created_at' in order_data and hasattr(order_data['created_at'], 'isoformat') else None,
                            'user_id': order_data.get('user_id', ''),
                            'checkin': ticket.get('checkin', False),
                            'checkin_timestamp': ticket.get('checkin_timestamp', None),
                            'checkin_by': ticket.get('checkin_by', None)
                        }
                        participants.append(flat_participant)
            return {'participants': participants}, 200
        except Exception as e:
            return {'error': str(e)}, 500

    def update_participant_checkin(self, event_id: str, order_id: str,
                                   participant_index: int, checkin_status: bool,
                                   user_id: str, db) -> tuple:
        from datetime import datetime
        try:
            order_ref = db.collection('orders').document(order_id)
            order_doc = order_ref.get()
            if not order_doc.exists:
                return {'error': 'Order not found'}, 404
            order_data = order_doc.to_dict()
            if order_data.get('event_id') != event_id:
                return {'error': 'Order does not belong to this event'}, 400
            if order_data.get('status') not in ['CONFIRMADO', 'CONFIRMED', 'RECEIVED']:
                return {'error': 'Cannot check in participants from unconfirmed orders'}, 400
            if 'tickets' not in order_data or not isinstance(order_data['tickets'], list):
                return {'error': 'No tickets found in this order'}, 400
            if participant_index < 0 or participant_index >= len(order_data['tickets']):
                return {'error': 'Invalid participant index'}, 400
            # Concorrência otimista: buscar snapshot atual
            order_snapshot = order_ref.get()
            current_order_data = order_snapshot.to_dict()
            if len(current_order_data['tickets']) <= participant_index:
                return {'error': 'Participant index out of bounds'}, 400
            current_order_data['tickets'][participant_index]['checkin'] = checkin_status
            current_order_data['tickets'][participant_index]['checkin_timestamp'] = datetime.now().isoformat() if checkin_status else None
            current_order_data['tickets'][participant_index]['checkin_by'] = user_id if checkin_status else None
            order_ref.update({
                'tickets': current_order_data['tickets'],
                'updated_at': datetime.now()
            })
            updated_participant = current_order_data['tickets'][participant_index]
            participant_info = {}
            if 'participants' in updated_participant and isinstance(updated_participant['participants'], list) and len(updated_participant['participants']) > 0:
                first_participant = updated_participant['participants'][0]
                participant_info = {
                    'fullName': first_participant.get('fullName', 'Nome não informado'),
                    'gender': first_participant.get('gender', ''),
                    'birthDate': first_participant.get('birthDate', '')
                }
            flat_participant = {
                'order_id': order_id,
                'participant_index': participant_index,
                'fullName': participant_info.get('fullName', 'Nome não informado'),
                'gender': participant_info.get('gender', ''),
                'ticket_name': updated_participant.get('ticket_name', ''),
                'checkin': updated_participant.get('checkin', False),
                'checkin_timestamp': updated_participant.get('checkin_timestamp', None),
                'checkin_by': updated_participant.get('checkin_by', None)
            }
            return {
                'message': f"Participant check-in {'completed' if checkin_status else 'reverted'} successfully",
                'participant': flat_participant
            }, 200
        except Exception as e:
            return {'error': str(e)}, 500

    def qr_code_checkin(self, event_id: str, qr_code_uuid: str, checkin_status: bool, user_id: str, db) -> tuple:
        from datetime import datetime
        try:
            orders = db.collection('orders').where('event_id', '==', event_id).where('status', 'in', ['CONFIRMADO', 'CONFIRMED', 'RECEIVED']).stream()
            found_order = None
            found_ticket_index = -1
            found_ticket = None
            for order in orders:
                order_data = order.to_dict()
                if 'tickets' in order_data and isinstance(order_data['tickets'], list):
                    for ticket_idx, ticket in enumerate(order_data['tickets']):
                        if ticket.get('qr_code_uuid') == qr_code_uuid:
                            found_order = order
                            found_ticket_index = ticket_idx
                            found_ticket = ticket
                            break
                if found_order:
                    break
            if not found_order or found_ticket_index == -1:
                return {'error': 'QR code não encontrado ou inválido para este evento'}, 404
            order_ref = db.collection('orders').document(found_order.id)
            order_snapshot = order_ref.get()
            current_order_data = order_snapshot.to_dict()
            if len(current_order_data['tickets']) <= found_ticket_index:
                return {'error': 'Participant index out of bounds'}, 400
            current_order_data['tickets'][found_ticket_index]['checkin'] = checkin_status
            current_order_data['tickets'][found_ticket_index]['checkin_timestamp'] = datetime.now().isoformat() if checkin_status else None
            current_order_data['tickets'][found_ticket_index]['checkin_by'] = user_id if checkin_status else None
            order_ref.update({
                'tickets': current_order_data['tickets'],
                'updated_at': datetime.now()
            })
            updated_ticket = current_order_data['tickets'][found_ticket_index]
            participant_info = {}
            if 'participants' in updated_ticket and isinstance(updated_ticket['participants'], list) and len(updated_ticket['participants']) > 0:
                first_participant = updated_ticket['participants'][0]
                participant_info = {
                    'fullName': first_participant.get('fullName', 'Nome não informado'),
                    'gender': first_participant.get('gender', ''),
                    'birthDate': first_participant.get('birthDate', '')
                }
            flat_participant = {
                'order_id': found_order.id,
                'participant_index': found_ticket_index,
                'fullName': participant_info.get('fullName', 'Nome não informado'),
                'gender': participant_info.get('gender', ''),
                'ticket_name': updated_ticket.get('ticket_name', ''),
                'qr_code_uuid': qr_code_uuid,
                'checkin': updated_ticket.get('checkin', False),
                'checkin_timestamp': updated_ticket.get('checkin_timestamp', None),
                'checkin_by': updated_ticket.get('checkin_by', None)
            }
            return {
                'message': f"Check-in {'realizado' if checkin_status else 'revertido'} com sucesso por QR code",
                'participant': flat_participant
            }, 200
        except Exception as e:
            return {'error': str(e)}, 500
            
    def update_order_status(self, order_id: str, status: str, db) -> tuple:
        """
        Updates the status of an order. This is primarily used for free ticket orders
        to mark them as confirmed without going through payment processing.
        
        Args:
            order_id: The ID of the order to update
            status: The new status to set (e.g., 'CONFIRMADO')
            db: Firestore database instance
            
        Returns:
            tuple: (result, status_code)
        """
        from datetime import datetime
        try:
            if not order_id:
                return {'error': 'Order ID is required'}, 400
                
            if not status:
                return {'error': 'Status is required'}, 400
                
            # Get the order document
            order_ref = db.collection('orders').document(order_id)
            order_doc = order_ref.get()
            
            if not order_doc.exists:
                return {'error': 'Order not found'}, 404
                
            # Update the order status
            order_ref.update({
                'status': status,
                'updated_at': datetime.now()
            })
            
            # For free tickets marked as confirmed, also update to indicate it's been processed
            if status == 'CONFIRMADO':
                # Generate QR code UUIDs for tickets if not already present
                order_data = order_doc.to_dict()
                tickets = order_data.get('tickets', [])
                
                import uuid
                updated_tickets = []
                
                for ticket in tickets:
                    # Only generate QR code UUID if not already present
                    if not ticket.get('qr_code_uuid'):
                        ticket['qr_code_uuid'] = str(uuid.uuid4())
                    updated_tickets.append(ticket)
                
                if updated_tickets:
                    order_ref.update({
                        'tickets': updated_tickets
                    })
            
            return {
                'message': f'Order status updated to {status} successfully',
                'order_id': order_id
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
