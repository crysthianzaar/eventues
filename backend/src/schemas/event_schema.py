from datetime import datetime, time
from pydantic import BaseModel
from typing import Optional

class EventSchema(BaseModel):
    id: int
    user_id: str
    name: str
    category: str
    start_date: datetime
    start_time: time
    end_date: datetime
    end_time: time
    event_type: str
    event_category: str
    state: str
    city: str
    organization_name: str
    organization_contact: str
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
