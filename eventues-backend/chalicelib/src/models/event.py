from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class Event(BaseModel):
    id: str
    name: str
    event_type: str
    start_date: datetime
    end_date: datetime
    start_time: str
    end_time: str
    city: str
    state: str
    address: str
    event_description: str
    organization_name: str
    banner_image_url: Optional[str]
    slug: str
    status: str = "active"
    created_at: datetime
    updated_at: datetime

class EventResponse(BaseModel):
    events: List[Event]
    next_cursor: Optional[str]
