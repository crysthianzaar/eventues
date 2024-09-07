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