import base64
import json
from chalice import Blueprint, Response, CORSConfig
from chalicelib.src.models.ingresso import Ingresso
from chalicelib.src.utils.formatters import generate_slug
from chalicelib.src.utils.firebase import db

public_api = Blueprint(__name__)

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