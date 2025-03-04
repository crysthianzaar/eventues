from chalice import Blueprint, Response, CORSConfig
import json
from ..models.ingresso import Ingresso
from ..utils.formatters import generate_slug
from firebase_admin import firestore

public_api = Blueprint(__name__)
db = firestore.client()

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['*'],
    max_age=600
)

@public_api.route('/events/{slug}', methods=['GET'], cors=cors_config)
def get_public_event(slug):
    try:
        # Buscar evento pelo slug
        events_ref = db.collection('events')
        query = events_ref.where(filter=firestore.FieldFilter('slug', '==', slug)).limit(1)
        events = query.get()

        if not events:
            return Response(
                body=json.dumps({"error": "Evento não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )

        event = events[0]
        event_data = event.to_dict()
        event_data['event_id'] = event.id

        # Buscar ingressos disponíveis
        tickets_ref = event.reference.collection('tickets')
        tickets = tickets_ref.get()

        available_tickets = []
        for ticket in tickets:
            ticket_data = ticket.to_dict()
            
            # Calcular ingressos disponíveis
            total = int(ticket_data.get('totalIngressos', 0))
            vendidos_ref = ticket.reference.collection('vendidos').get()
            vendidos = len(vendidos_ref)
            
            ticket_data['id'] = ticket.id
            ticket_data['ingressosDisponiveis'] = str(total - vendidos)
            
            # Só incluir ingressos que estão visíveis
            if ticket_data.get('visibilidade') == 'publico':
                available_tickets.append(ticket_data)

        event_data['tickets'] = available_tickets

        return Response(
            body=json.dumps(event_data),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        print(f"Erro ao buscar evento público: {str(e)}")
        return Response(
            body=json.dumps({"error": "Erro ao buscar evento"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@public_api.route('/events/{event_id}/tickets/{ticket_id}/reserve', methods=['POST'], cors=cors_config)
def reserve_ticket(event_id, ticket_id):
    try:
        request = public_api.current_request
        data = request.json_body
        quantity = int(data.get('quantity', 1))

        # Validar evento e ingresso
        event_ref = db.collection('events').document(event_id)
        event = event_ref.get()
        if not event.exists:
            return Response(
                body=json.dumps({"error": "Evento não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )

        ticket_ref = event_ref.collection('tickets').document(ticket_id)
        ticket = ticket_ref.get()
        if not ticket.exists:
            return Response(
                body=json.dumps({"error": "Ingresso não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )

        ticket_data = ticket.to_dict()
        
        # Verificar disponibilidade
        total = int(ticket_data.get('totalIngressos', 0))
        vendidos_ref = ticket_ref.collection('vendidos').get()
        vendidos = len(vendidos_ref)
        
        if vendidos + quantity > total:
            return Response(
                body=json.dumps({"error": "Quantidade indisponível"}),
                status_code=400,
                headers={'Content-Type': 'application/json'}
            )

        # Criar reserva
        reservation_ref = ticket_ref.collection('reservas').document()
        reservation_data = {
            'quantity': quantity,
            'status': 'pending',
            'created_at': firestore.SERVER_TIMESTAMP,
            'expires_at': firestore.SERVER_TIMESTAMP + 900,  # 15 minutos
            **data
        }
        reservation_ref.set(reservation_data)

        response_data = {
            'reservation_id': reservation_ref.id,
            'expires_in': 900,  # 15 minutos em segundos
            **reservation_data
        }

        return Response(
            body=json.dumps(response_data),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        print(f"Erro ao reservar ingresso: {str(e)}")
        return Response(
            body=json.dumps({"error": "Erro ao reservar ingresso"}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
