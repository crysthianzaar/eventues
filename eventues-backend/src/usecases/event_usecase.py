# src/usecases/event_usecase.py

from src.repositories.event_repository import EventRepository
from src.models.event_model import EventModel
from typing import Optional, List

class EventUseCase:
    def __init__(self):
        self.event_repository = EventRepository()

    def create_event(self, event_data: dict) -> EventModel:
        event = EventModel.from_dict(event_data)
        return self.event_repository.add_event(event)

    def update_event(self, event_data: dict) -> Optional[EventModel]:
        event = EventModel.from_dict(event_data)
        return self.event_repository.update_event(event)

    def get_event(self, event_id: str) -> Optional[EventModel]:
        return self.event_repository.find_event_by_id(event_id)

    def list_events_by_user(self, user_id: str) -> List[EventModel]:
        return self.event_repository.list_events_by_user(user_id)

    def delete_event(self, event_id: str) -> bool:
        return self.event_repository.delete_event(event_id)
