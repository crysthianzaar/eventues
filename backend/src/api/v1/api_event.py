from chalice import Blueprint
from backend.src.core.config import SessionLocal
from backend.src.repositories.event_repository import EventRepository
from backend.src.services.event_service import EventService
from chalice import Response
import json

event_bp = Blueprint(__name__)


@event_bp.route('/events', methods=['POST'])
def create_event():
    db = SessionLocal()
    request = event_bp.current_request
    event_data = request.json_body
    event_service = EventService(EventRepository(db))
    new_event = event_service.create_event(event_data)

    return Response(
        body=json.dumps(new_event),
        status_code=201,
        headers={'Content-Type': 'application/json'}
    )
