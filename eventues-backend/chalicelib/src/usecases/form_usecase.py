from typing import List, Dict, Any, Optional
from chalicelib.src.tasks.form_task import FormTask
from chalicelib.src.models.form_model import EventForm

class FormUseCase:
    def __init__(self):
        self.task = FormTask()
    
    def create_event_form(self, event_id: str, form_fields: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create a new form for an event
        If form_fields is None, use default fields
        """
        if form_fields is None:
            form_fields = self.task.get_default_form_fields()
        
        event_form = self.task.create_event_form(event_id, form_fields)
        return event_form.to_dict()
    
    def get_event_form(self, event_id: str) -> Dict[str, Any]:
        """
        Get the form for an event
        If no form exists, create one with default fields
        """
        event_form = self.task.get_event_form(event_id)
        
        if not event_form:
            # Create a default form
            event_form = self.task.create_event_form(event_id, self.task.get_default_form_fields())
        
        return event_form.to_dict()
    
    def update_event_form(self, event_id: str, form_fields: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Update an existing form for an event
        """
        event_form = self.task.update_event_form(event_id, form_fields)
        return event_form.to_dict()
    
    def delete_event_form(self, event_id: str) -> bool:
        """
        Delete the form for an event
        """
        return self.task.delete_event_form(event_id)
