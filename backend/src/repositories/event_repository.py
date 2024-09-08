
from uuid import uuid4
from src.models.event_model import EventModel


class EventRepository:
    def __init__(self, session):
        self.session = session

    def create_event(self, event_data):
        event_data['event_id'] = uuid4()
        event_data['event_status'] = 'rascunho'
        new_event = EventModel(**event_data)
        self.session.add(new_event)
        self.session.commit()
        return new_event

    def get_events_by_user(self, user_id: str):
        return self.session.query(EventModel).filter_by(user_id=user_id).all()

    def get_event_by_id(self, event_id):
        return self.session.query(EventModel).filter_by(event_id=event_id).first()
