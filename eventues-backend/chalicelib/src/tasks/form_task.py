from typing import List, Dict, Any, Optional
from chalicelib.src.repositories.form_repository import FormRepository
from chalicelib.src.models.form_model import EventForm, FormField

class FormTask:
    def __init__(self):
        self.repository = FormRepository()
    
    def create_event_form(self, event_id: str, form_fields: List[Dict[str, Any]]) -> EventForm:
        """
        Create a new form for an event
        """
        # Add order to fields if not present
        for i, field in enumerate(form_fields):
            if 'order' not in field:
                field['order'] = i
        
        return self.repository.create_event_form(event_id, form_fields)
    
    def get_event_form(self, event_id: str) -> Optional[EventForm]:
        """
        Get the form for an event
        """
        return self.repository.get_event_form(event_id)
    
    def update_event_form(self, event_id: str, form_fields: List[Dict[str, Any]]) -> EventForm:
        """
        Update an existing form for an event
        """
        # Add order to fields if not present
        for i, field in enumerate(form_fields):
            if 'order' not in field:
                field['order'] = i
        
        return self.repository.update_event_form(event_id, form_fields)
    
    def delete_event_form(self, event_id: str) -> bool:
        """
        Delete the form for an event
        """
        return self.repository.delete_event_form(event_id)
    
    def get_default_form_fields(self) -> List[Dict[str, Any]]:
        """
        Get the default form fields for an event
        """
        return [
            {"id": "fullName", "label": "Nome Completo", "type": "text", "required": True, "order": 0},
            {"id": "cpf", "label": "CPF", "type": "text", "required": True, "order": 1},
            {"id": "birthDate", "label": "Data de Nascimento", "type": "date", "required": True, "order": 1},
            {"id": "gender", "label": "Gênero", "type": "select", "required": True, 
             "options": ["Masculino", "Feminino", "Outro", "Prefiro não informar"], "order": 2},
            {"id": "city", "label": "Cidade", "type": "text", "required": False, "order": 3},
            {"id": "state", "label": "Estado", "type": "text", "required": False, "order": 4},
            {"id": "address", "label": "Endereço", "type": "text", "required": False, "order": 5},
            {"id": "email", "label": "Email", "type": "text", "required": True, "order": 6},
            {"id": "phone", "label": "Telefone", "type": "text", "required": True, "order": 7},
            {"id": "emergencyContact", "label": "Contato de Emergência", "type": "text", "required": True, "order": 8},
            {"id": "shirtSize", "label": "Tamanho da Camiseta", "type": "select", "required": False, 
             "options": ["PP", "P", "M", "G", "GG", "XG"], "order": 9},
            {"id": "medicalInfo", "label": "Informações Médicas", "type": "text", "required": False, "order": 10},
            {"id": "team", "label": "Equipe", "type": "text", "required": False, "order": 11},
            {"id": "termsAccepted", "label": "Aceito os Termos e Condições", "type": "checkbox", "required": True, "order": 12}
        ]
