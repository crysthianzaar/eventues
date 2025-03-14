from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime

@dataclass
class FormField:
    id: str
    label: str
    type: str  # 'text', 'date', 'select', 'checkbox'
    required: bool
    options: Optional[List[str]] = None
    order: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "label": self.label,
            "type": self.type,
            "required": self.required,
            "options": self.options,
            "order": self.order
        }
    
    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'FormField':
        return FormField(
            id=data.get("id", ""),
            label=data.get("label", ""),
            type=data.get("type", "text"),
            required=data.get("required", False),
            options=data.get("options", []),
            order=data.get("order", 0)
        )

@dataclass
class EventForm:
    event_id: str
    fields: List[FormField] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "fields": [field.to_dict() for field in self.fields],
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'EventForm':
        return EventForm(
            event_id=data.get("event_id", ""),
            fields=[FormField.from_dict(field) for field in data.get("fields", [])],
            created_at=data.get("created_at", datetime.now().isoformat()),
            updated_at=data.get("updated_at", datetime.now().isoformat())
        )
