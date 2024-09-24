from chalice import Blueprint, CORSConfig
from src.core.config import SessionLocal
from src.repositories.event_repository import EventRepository
from src.services.event_service import EventService
from chalice import Response
import json

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['Authorization', 'Content-Type'],
    max_age=600
)

event_bp = Blueprint(__name__)


@event_bp.route('/events', methods=['POST'], cors=cors_config)
def create_event():
    db = SessionLocal()
    event_data = event_bp.current_request.json_body
    event_service = EventService(EventRepository(db))
    new_event = event_service.create_event(event_data)

    return Response(
        body=new_event.to_dict(),
        status_code=201,
        headers={'Content-Type': 'application/json'}
    )

@event_bp.route('/list_events', methods=['GET'], cors=cors_config)
def list_events():
    db = SessionLocal()
    user_id = event_bp.current_request.query_params.get('user_id')
    
    if not user_id:
        return Response(
            body=json.dumps({"error": "User ID is required"}),
            status_code=400,
            headers={'Content-Type': 'application/json'}
        )
    
    event_service = EventService(EventRepository(db))
    events = event_service.get_events_by_user(user_id)

    return Response(
        body=json.dumps([event.to_dict() for event in events]),
        status_code=200,
        headers={'Content-Type': 'application/json'}
    )

@event_bp.route('/organizer_detail/{event_id}', methods=['GET'], cors=cors_config)
def get_event_detail(event_id):
    db = SessionLocal()
    event_service = EventService(EventRepository(db))
    event_detail = event_service.get_event_by_id(event_id)

    if not event_detail:
        return Response(
            body=json.dumps({"error": "Evento não encontrado."}),
            status_code=404,
            headers={'Content-Type': 'application/json'}
        )

    return Response(
        body=json.dumps(event_detail),
        status_code=200,
        headers={'Content-Type': 'application/json'}
    )

@event_bp.route('/organizer_detail/{event_id}/upload_document_file', methods=['POST'], cors=cors_config)
def upload_files(event_id):
    db = SessionLocal()
    event_service = EventService(EventRepository(db))
    event_files = event_service.upload_event_file(
        event_id, event_bp.current_request.json_body)
    return event_files

@event_bp.route('/organizer_detail/{event_id}/get_document_files', methods=['GET'], cors=cors_config)
def get_files(event_id):
    db = SessionLocal()
    event_service = EventService(EventRepository(db))
    
    try:
        event_files = event_service.get_event_documents(event_id)
        return event_files
    except Exception as e:
        return {"error": f"Erro ao obter arquivos: {str(e)}"}, 500

@event_bp.route('/organizer_detail/{event_id}/delete_document_file', methods=['POST'], cors=cors_config)
def delete_file(event_id):
    db = SessionLocal()
    event_service = EventService(EventRepository(db))
    payload = event_bp.current_request.json_body
    
    try:
        s3_key = payload.get('s3_key')
        if not s3_key:
            return {"error": "Chave do arquivo não fornecida"}, 400

        event_service.delete_event_file(event_id, s3_key)
        return {"message": "Arquivo deletado com sucesso."}, 200
    except Exception as e:
        return {"error": f"Erro ao deletar arquivo: {str(e)}"}, 500

@event_bp.route('/organizer_detail/{event_id}/details', methods=['PATCH'], cors=cors_config)
def update_event_details(event_id):
    db = SessionLocal()
    event_service = EventService(EventRepository(db))
    event_data = event_bp.current_request.json_body
    
    try:
        updated_event = event_service.update_event_details(event_id, event_data)
        return {"message": "Detalhes do evento atualizados com sucesso."}, 200
    except Exception as e:
        return {"error": f"Erro ao atualizar evento: {str(e)}"}, 500

@event_bp.route('/organizer_detail/{event_id}/policy', methods=['PATCH'], cors=cors_config)
def create_or_update_policy(event_id):
    db = SessionLocal()
    event_service = EventService(EventRepository(db))
    policy_data = event_bp.current_request.json_body
    
    try:
        event_service.create_or_update_policy(event_id, policy_data)
        return {"message": "Política do evento atualizada com sucesso."}, 200
    except Exception as e:
        db.rollback()
        return {"error": f"Erro ao atualizar política do evento: {str(e)}"}, 500

@event_bp.route('/organizer_detail/{event_id}/get_policy', methods=['GET'], cors=cors_config)
def get_event_policy(event_id):
    db = SessionLocal()
    event_service = EventService(EventRepository(db))
    
    try:
        policy = event_service.get_event_policy(event_id)
        return policy.to_dict() if policy else {}
    except Exception as e:
        return {"error": f"Erro ao obter política: {str(e)}"}, 500


@event_bp.route('/organizer_detail/{event_id}/categories', methods=['POST'], cors=cors_config)
def create_event(event_id):
    db = SessionLocal()
    event_data = event_bp.current_request.json_body
    event_service = EventService(EventRepository(db))
    try:
        new_event = event_service.create_category_and_values(event_id, event_data)
        return Response(
            body=new_event,
            status_code=201,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        db.rollback()
        return Response(
            body={"error": f"Erro ao criar evento: {str(e)}"},
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )


@event_bp.route('/organizer_detail/{event_id}/get_categories', methods=['GET'], cors=cors_config)
def get_categories(event_id):
    db = SessionLocal()
    event_service = EventService(EventRepository(db))
    try:
        categories = event_service.get_category_and_values_by_event_id(event_id)
        return categories
    except Exception as e:
        return {"error": f"Erro ao obter categorias: {str(e)}"}, 500