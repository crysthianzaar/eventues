# src/repositories/event_repository.py
from google.cloud.firestore_v1 import FieldFilter
from typing import List, Optional
import uuid
from src.utils.firebase import db
from src.models.event_model import EventModel, EventStatus
from src.models.tables import Table
from src.utils.utils import filter_none_values
from src.utils.firebase import storage, db

class EventRepository:
    def __init__(self):
        self.events_collection = db.collection(Table.EVENTS.value)

    def add_event(self, event: EventModel) -> EventModel:
        event.event_id = str(uuid.uuid4())
        event.event_status = EventStatus.RASCUNHO.value
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

    def get_events_by_user(self, user_id: str) -> List[EventModel]:
        events = []
        filter_ = FieldFilter('user_id', '==', user_id)
        query = self.events_collection.where(filter=filter_).stream()
        for doc in query:
            events.append(EventModel.from_dict(doc.to_dict()))
        return events

    def get_event_by_id(self, event_id: str) -> Optional[EventModel]:
        doc_ref = self.events_collection.document(event_id)
        doc = doc_ref.get()
        if doc.exists:
            return EventModel.from_dict(doc.to_dict())
        return None

    def upload_event_file(self, event_id: str, file_data: bytes, file_path: str, content_type: str, file_name: str) -> dict:
        bucket = storage.bucket()  
        blob = bucket.blob(file_path)
        blob.upload_from_string(file_data, content_type=content_type)
        file_url = blob.public_url
        blob.make_public()
        
        document_data = {
            'file_name': file_name,
            'firebase_path': file_path,
            'url': file_url
        }
        
        event_ref = db.collection('events').document(event_id)
        event_ref.collection('documents').add(document_data)
        
        return document_data
    
    def delete_event_file(self, event_id: str, firebase_path: str) -> None:
        bucket = storage.bucket()  
        blob = bucket.blob(firebase_path)
        blob.delete()

        event_ref = db.collection('events').document(event_id)
        documents = event_ref.collection('documents').where('firebase_path', '==', firebase_path).stream()
        for doc in documents:
            doc.reference.delete()
