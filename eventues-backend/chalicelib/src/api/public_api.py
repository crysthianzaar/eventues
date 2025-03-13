import base64
import json
from firebase_admin import firestore
from cachetools import TTLCache, cached
from chalice import Blueprint, Response, CORSConfig
from chalicelib.src.models.ingresso import Ingresso
from chalicelib.src.utils.formatters import generate_slug

public_api = Blueprint(__name__)
db = firestore.client()

# Cache configuration
events_cache = TTLCache(maxsize=100, ttl=300)  # 5 minutes cache

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['*'],
    max_age=600
)

def encode_cursor(last_doc):
    """Encode the last document into a cursor string"""
    if not last_doc:
        return None
    cursor_data = {
        'id': last_doc.id,
        'name': last_doc.get('name'),
        'start_date': last_doc.get('start_date')
    }
    return base64.b64encode(json.dumps(cursor_data).encode()).decode()

def decode_cursor(cursor_str):
    """Decode cursor string back into document data"""
    if not cursor_str:
        return None
    try:
        cursor_data = json.loads(base64.b64decode(cursor_str))
        return cursor_data
    except:
        return None

# Rota movida para event_api.py para manter consistência com a implementação existente

@public_api.route('/events/slug/{slug}', methods=['GET'], cors=cors_config)
def get_public_event_by_slug(slug):
    try:
        # Buscar evento pelo slug
        events_ref = db.collection('events')
        query = events_ref.filter("slug", "==", slug)
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
