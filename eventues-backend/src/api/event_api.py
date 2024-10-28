# api/event_api.py

import base64
import json
from chalice import Blueprint, Response, CORSConfig
from src.usecases.event_usecase import EventUseCase
from src.utils.firebase import verify_token, storage, db

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['Authorization', 'Content-Type'],
    max_age=600
)

event_api = Blueprint(__name__)
use_case = EventUseCase()

@event_api.route('/events', methods=['POST'], cors=cors_config)
def create_event():
    request = event_api.current_request
    event_data = request.json_body
    try:
        new_event = use_case.create_event(event_data)
        return Response(
            body=new_event.to_dict(),
            status_code=201,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=400,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/list_events', methods=['GET'], cors=cors_config)
def list_events():
    request = event_api.current_request
    auth_header = request.headers.get('Authorization', '')

    if not auth_header.startswith('Bearer '):
        return Response(
            body=json.dumps({"error": "Token de autenticação ausente ou inválido."}),
            status_code=401,
            headers={'Content-Type': 'application/json'}
        )
    
    token = auth_header.replace('Bearer ', '')
    
    try:
        user_id = verify_token(token)
    except ValueError as ve:
        return Response(
            body=json.dumps({"error": str(ve)}),
            status_code=401,
            headers={'Content-Type': 'application/json'}
        )
    
    try:
        events = use_case.get_events_by_user(user_id)
        events_dict = [event.to_dict() for event in events]
        return Response(
            body=json.dumps(events_dict),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": "Erro ao carregar eventos."}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/{event_id}', methods=['GET'], cors=cors_config)
def get_event_detail(event_id):
    try:
        event = use_case.get_event_by_id(event_id)
        
        if not event:
            raise ValueError("Evento não encontrado.")

        return Response(
            body=event,
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )

    except Exception as e:
        return Response(
            body=json.dumps({"error": "Erro ao carregar detalhes do evento."}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )


@event_api.route('/organizer_detail/{event_id}/upload_document_file', methods=['POST'], cors=cors_config)
def upload_files(event_id):
    try:
        request = event_api.current_request
        data = request.json_body
        document_file = use_case.upload_event_file(event_id, data)
        return Response(
            body=document_file,
            status_code=201,
            headers={'Content-Type': 'application/json'}
        )
    
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )


@event_api.route('/organizer_detail/{event_id}/get_document_files', methods=['GET'], cors=cors_config)
def get_files(event_id):
    try:
        event_ref = db.collection('events').document(event_id)
        documents = event_ref.collection('documents').stream()

        files = [doc.to_dict() for doc in documents]
        return Response(
            body=json.dumps(files),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/organizer_detail/{event_id}/delete_document_file', methods=['POST'], cors=cors_config)
def delete_file(event_id):
    request = event_api.current_request
    data = request.json_body
    try:
        use_case.delete_event_file(event_id, data)
        return Response(
            body=json.dumps({"message": "Arquivo deletado com sucesso."}),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )