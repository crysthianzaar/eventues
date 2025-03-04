# src/repositories/event_repository.py
from google.cloud.firestore_v1 import FieldFilter
from typing import List, Optional
import uuid
from chalicelib.src.models.ingresso import Ingresso
from chalicelib.src.utils.firebase import db
from chalicelib.src.models.event_model import EventModel, EventStatus
from chalicelib.src.models.tables import Table
from chalicelib.src.utils.utils import filter_none_values
from chalicelib.src.utils.firebase import storage, db

class EventRepository:
    def __init__(self):
        self.events_collection = db.collection(Table.EVENTS.value)

    def add_event(self, event: EventModel) -> EventModel:
        event.event_id = str(uuid.uuid4())
        event.event_status = EventStatus.RASCUNHO.value
        self.events_collection.document(event.event_id).set(event.to_dict())
        return event

    def add_ticket(self, event_id: str, ticket: Ingresso) -> Ingresso:
        event_ref = db.collection('events').document(event_id)
        ticket_id = str(uuid.uuid4())
        new_ticket = ticket.to_dict()
        new_ticket['id'] = ticket_id
        # Remove a lista de lotes do documento principal
        lotes = new_ticket.pop('lotes', [])
        event_ref.collection('tickets').document(ticket_id).set(new_ticket)
        
        if lotes is not None:
            for lote in lotes:
                lote_id = str(uuid.uuid4())
                lote['ticket_id'] = ticket_id  # Associação explícita
                event_ref.collection('tickets').document(ticket_id).collection('lotes').document(lote_id).set(lote)
        
        return ticket

    def update_event(self, event: EventModel) -> EventModel:
        event_dict = filter_none_values(event.to_dict())
        self.events_collection.document(event.event_id).set(event_dict, merge=True)
        return event_dict

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

    def get_public_events(self, cursor: Optional[str] = None, limit: int = 10) -> tuple[List[EventModel], Optional[str]]:
        # Base query: get published events ordered by creation date
        query = self.events_collection.where(
            filter=FieldFilter('event_status', '==', EventStatus.PUBLICADO.value)
        ).order_by('created_at', direction='DESCENDING')

        try:
            # Apply cursor pagination if provided
            if cursor:
                cursor_doc = self.events_collection.document(cursor).get()
                if cursor_doc.exists:
                    query = query.start_after(cursor_doc)

            # Get documents
            docs = list(query.limit(limit + 1).stream())
            
            # Process results
            events = []
            next_cursor = None
            
            # Check if we have more results
            has_more = len(docs) > limit
            
            # Process only up to the limit
            for doc in docs[:limit]:
                event_data = doc.to_dict()
                if event_data:  # Ensure we have valid data
                    # Get banner from documents subcollection
                    documents = list(doc.reference.collection('documents').stream())
                    for document in documents:
                        doc_data = document.to_dict()
                        if doc_data.get('file_name', '').lower().startswith('banner'):
                            event_data['banner_url'] = doc_data.get('url')
                            break
                    
                    events.append(EventModel.from_dict(event_data))
            
            # Set the next cursor if we have more results
            if has_more and events:
                next_cursor = docs[limit - 1].id
            
            return events, next_cursor
            
        except Exception as e:
            print(f"Error fetching public events: {str(e)}")
            return [], None
