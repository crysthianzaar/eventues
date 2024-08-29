from pydantic import BaseModel
from datetime import datetime
from backend.src.models.event_model import EventCategory, EventStatus


class EventCreate(BaseModel):
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    location: str
    category: EventCategory
    status: EventStatus = EventStatus.PENDING
    organizer_id: int


class EventResponse(BaseModel):
    id: int
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    location: str
    category: EventCategory
    status: EventStatus
    organizer_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EventSchema(BaseModel):
    id: int
    name: str
    description: str
    start_date: datetime
    end_date: datetime
    location: str
    category: EventCategory
    status: EventStatus
    organizer_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        from_attributes = True
