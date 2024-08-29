
from backend.src.models.event_model import EventModel


class EventRepository:
    def __init__(self, session):
        self.session = session

    def create_event(self, event_data):
        new_event = EventModel(**event_data)
        self.session.add(new_event)
        self.session.commit()
        return new_event
