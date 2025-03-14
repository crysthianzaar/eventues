from typing import List, Dict, Any, Optional
from chalicelib.src.models.form_model import EventForm, FormField
from chalicelib.src.utils.firebase import db
from datetime import datetime

class FormRepository:
    def __init__(self):
        self.db = db

    def create_event_form(self, event_id: str, form_fields: List[Dict[str, Any]]) -> EventForm:
        """
        Create a new form for an event
        """
        fields = [FormField.from_dict(field) for field in form_fields]
        
        # Sort fields by order
        fields.sort(key=lambda x: x.order)
        
        event_form = EventForm(
            event_id=event_id,
            fields=fields
        )
        
        # Save to Firestore
        form_ref = self.db.collection('events').document(event_id).collection('forms').document('registration')
        form_ref.set(event_form.to_dict())
        
        return event_form

    def get_event_form(self, event_id: str) -> Optional[EventForm]:
        """
        Get the form for an event
        """
        form_ref = self.db.collection('events').document(event_id).collection('forms').document('registration')
        form_doc = form_ref.get()
        
        if not form_doc.exists:
            return None
        
        form_data = form_doc.to_dict()
        return EventForm.from_dict(form_data)

    def update_event_form(self, event_id: str, form_fields: List[Dict[str, Any]]) -> EventForm:
        """
        Update an existing form for an event
        """
        fields = [FormField.from_dict(field) for field in form_fields]
        
        # Sort fields by order
        fields.sort(key=lambda x: x.order)
        
        # Get existing form or create new one
        form_ref = self.db.collection('events').document(event_id).collection('forms').document('registration')
        form_doc = form_ref.get()
        
        if form_doc.exists:
            form_data = form_doc.to_dict()
            event_form = EventForm.from_dict(form_data)
            event_form.fields = fields
            event_form.updated_at = datetime.now().isoformat()
        else:
            event_form = EventForm(
                event_id=event_id,
                fields=fields
            )
        
        # Save to Firestore
        form_ref.set(event_form.to_dict())
        
        return event_form

    def delete_event_form(self, event_id: str) -> bool:
        """
        Delete the form for an event
        """
        form_ref = self.db.collection('events').document(event_id).collection('forms').document('registration')
        form_doc = form_ref.get()
        
        if not form_doc.exists:
            return False
        
        form_ref.delete()
        return True
