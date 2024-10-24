# api/event_api.py

from chalice import Blueprint, Response, CORSConfig
from src.usecases.event_usecase import EventUseCase
from src.models.event_model import EventModel

from typing import List

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

@event_api.route('/events/{event_id}', methods=['GET'], cors=cors_config)
def get_event(event_id):
    event = use_case.get_event(event_id)
    if event:
        return event.to_dict()
    else:
        return Response(
            body={'message': 'Event not found'},
            status_code=404,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/events/{event_id}/update', methods=['PATCH'], cors=cors_config)
def update_event(event_id):
    request = event_api.current_request
    event_data = request.json_body
    event_data['event_id'] = event_id  # Assegura que o ID está correto
    try:
        updated_event = use_case.update_event(event_data)
        if updated_event:
            return Response(
                body=updated_event.to_dict(),
                status_code=200,
                headers={'Content-Type': 'application/json'}
            )
        else:
            return Response(
                body={'message': 'Event not found'},
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
    except Exception as e:
        return Response(
            body={'error': str(e)},
            status_code=400,
            headers={'Content-Type': 'application/json'}
        )

@event_api.route('/events', methods=['GET'], cors=cors_config)
def list_events():
    request = event_api.current_request
    user_id = request.query_params.get('user_id')
    if not user_id:
        return Response(
            body={'error': 'user_id query parameter is required'},
            status_code=400,
            headers={'Content-Type': 'application/json'}
        )
    events = use_case.list_events_by_user(user_id)
    events_list = [event.to_dict() for event in events]
    return Response(
        body=events_list,
        status_code=200,
        headers={'Content-Type': 'application/json'}
    )

@event_api.route('/events/{event_id}', methods=['DELETE'], cors=cors_config)
def delete_event(event_id):
    success = use_case.delete_event(event_id)
    if success:
        return Response(
            body={'message': 'Event deleted successfully'},
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    else:
        return Response(
            body={'message': 'Event not found'},
            status_code=404,
            headers={'Content-Type': 'application/json'}
        )
