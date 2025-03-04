# src/models/event_model.py

from dataclasses import dataclass, field
from enum import Enum
from pydantic import BaseModel, Field as PydanticField
from datetime import datetime, time
from typing import Optional


class EventStatus(Enum):
    RASCUNHO = 'Rascunho'
    PUBLICADO = 'Publicado'
    CANCELADO = 'Cancelado'

@dataclass
class EventModel:
    event_id: str
    user_id: str
    name: str
    category: str
    start_date: datetime
    end_date: datetime
    event_type: str
    event_category: str
    state: str
    city: str
    address: str
    organization_name: str
    organization_contact: str
    address_complement: Optional[str] = None
    address_detail: Optional[str] = None
    event_status: Optional[str] = None
    event_description: Optional[str] = None
    created_at: datetime = field(default_factory=lambda: datetime.now(datetime.utcnow().tzinfo))
    updated_at: datetime = field(default_factory=lambda: datetime.now(datetime.utcnow().tzinfo))

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            event_id=data.get('event_id'),
            user_id=data.get('user_id'),
            name=data.get('name'),
            category=data.get('category'),
            start_date=datetime.fromisoformat(data.get('start_date')),
            end_date=datetime.fromisoformat(data.get('end_date')),
            event_type=data.get('event_type'),
            event_category=data.get('event_category'),
            state=data.get('state'),
            city=data.get('city'),
            address=data.get('address'),
            address_complement=data.get('address_complement'),
            address_detail=data.get('address_detail'),
            organization_name=data.get('organization_name'),
            organization_contact=data.get('organization_contact'),
            event_status=data.get('event_status'),
            event_description=data.get('event_description'),
            created_at=datetime.fromisoformat(data.get('created_at')) if data.get('created_at') else datetime.now(datetime.utcnow().astimezone().tzinfo),
            updated_at=datetime.fromisoformat(data.get('updated_at')) if data.get('updated_at') else datetime.now(datetime.utcnow().astimezone().tzinfo)
        )

    def to_dict(self):
        return {
            'event_id': self.event_id,
            'user_id': self.user_id,
            'name': self.name,
            'category': self.category,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'event_type': self.event_type,
            'event_category': self.event_category,
            'state': self.state,
            'city': self.city,
            'address': self.address,
            'address_complement': self.address_complement,
            'address_detail': self.address_detail,
            'organization_name': self.organization_name,
            'organization_contact': self.organization_contact,
            'event_status': self.event_status,
            'event_description': self.event_description,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
