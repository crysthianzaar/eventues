# src/usecases/event_usecase.py

import base64
from src.repositories.event_repository import EventRepository
from src.models.event_model import EventModel
from typing import Optional, List


class EventUseCase:
    def __init__(self):
        self.event_repository = EventRepository()

    def create_event(self, event_data: dict) -> EventModel:
        event = EventModel.from_dict(event_data)
        return self.event_repository.add_event(event)

    def get_event(self, event_id: str) -> Optional[EventModel]:
        return self.event_repository.find_event_by_id(event_id)

    def get_events_by_user(self, user_id: str) -> List[EventModel]:
        return self.event_repository.get_events_by_user(user_id)

    def get_event_by_id(self, event_id: str) -> dict:
        event = self.event_repository.get_event_by_id(event_id)
        stepper = {
            "inf_basic": True,
            "event_details": self.get_organizer_event_details(event),
            "ticket_and_values": True,
            "category": True,
            "form": True,
            "event_ready": True
        }
        event_dict = event.to_dict()
        event_dict["stepper"] = stepper
        return event_dict

    def get_organizer_event_details(self, event: EventModel) -> dict:
        return all([
            event.name, event.category, event.start_date, event.start_time, 
            event.end_date, event.end_time, event.event_type, event.event_category, 
            event.state, event.city, event.address, event.organization_name, event.organization_contact
        ])

    def upload_event_file(self, event_id: str, payload: dict) -> dict:
        file_data = payload.get('file')
        file_name = payload.get('title')

        if ',' in file_data:
            header, base64_string = file_data.split(',', 1)
            content_type = header.split(';')[0].split(':')[1] if ':' in header else 'application/octet-stream'
        else:
            base64_string = file_data
            content_type = 'application/octet-stream'

        decoded_file = base64.b64decode(base64_string)
        firebase_file_path = f'events/{event_id}/{file_name}'

        document_data = self.event_repository.upload_event_file(event_id, decoded_file, firebase_file_path, content_type, file_name)

        return document_data

    def delete_event_file(self, event_id: str, payload: dict) -> None:
        firebase_path = payload.get('firebase_path')
        if not firebase_path:
            return {"error": "Caminho do arquivo não fornecido."}
        return self.event_repository.delete_event_file(event_id, firebase_path)