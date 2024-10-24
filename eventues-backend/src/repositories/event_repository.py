# src/repositories/event_repository.py

from typing import List, Optional
import uuid
from src.utils.firebase import db
from src.models.event_model import EventModel
from src.models.tables import Table
from src.utils.utils import filter_none_values

class EventRepository:
    def __init__(self):
        self.events_collection = db.collection(Table.EVENTS.value)

    def add_event(self, event: EventModel) -> EventModel:
        event.event_id = str(uuid.uuid4())
        self.events_collection.document(event.event_id).set(event.to_dict())
        return event

    def update_event(self, event: EventModel) -> EventModel:
        event_dict = filter_none_values(event.to_dict())
        self.events_collection.document(event.event_id).set(event_dict, merge=True)
        return event

    def find_event_by_id(self, event_id: str) -> Optional[EventModel]:
        event_document = self.events_collection.document(event_id).get()
        if event_document.exists:
            return EventModel.from_dict(event_document.to_dict())
        return None

    def list_events_by_user(self, user_id: str) -> List[EventModel]:
        events = []
        query = self.events_collection.where('user_id', '==', user_id).stream()
        for doc in query:
            events.append(EventModel.from_dict(doc.to_dict()))
        return events

    def delete_event(self, event_id: str) -> bool:
        self.events_collection.document(event_id).delete()
        return True
