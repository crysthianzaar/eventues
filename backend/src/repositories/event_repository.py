
from uuid import uuid4
from src.models.event_model import EventDocuments, EventModel


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

    def get_event_documents(self, event_id):
        return self.session.query(EventDocuments).filter_by(event_id=event_id).all()

    def create_event_document(self, event_id, document_data):
        document = {}
        document['document_id'] = uuid4()
        document['event_id'] = event_id
        document['s3_key'] = document_data['s3_key'].split('/')[-1]
        document['file_name'] = document_data['file_name'].split('/')[-1]
        document['url'] = document_data['url']
        new_document = EventDocuments(**document)
        self.session.add(new_document)
        self.session.commit()
        return new_document

    def delete_event_document(self, event_id, s3_key):
        document = self.session.query(EventDocuments).filter_by(event_id=event_id, s3_key=s3_key).first()
        self.session.delete(document)
        self.session.commit()
        return document