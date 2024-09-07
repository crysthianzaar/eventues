from dataclasses import asdict, dataclass
from sqlalchemy import Column, DateTime, Integer, String, Time, ForeignKey
from datetime import datetime, time
from src.models.base import Base

@dataclass
class EventModel(Base):
    __tablename__ = 'events'

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    event_id: str = Column(String(36), nullable=False)
    user_id: str = Column(String(36), ForeignKey('users.uuid'), nullable=False)
    name: str = Column(String(255), nullable=False)
    category: str = Column(String(255), nullable=False)
    start_date: datetime = Column(DateTime, nullable=False)
    start_time: time = Column(Time, nullable=False)
    end_date: datetime = Column(DateTime, nullable=False)
    end_time: time = Column(Time, nullable=False)
    event_type: str = Column(String(50), nullable=False)
    event_category: str = Column(String(100), nullable=False)
    state: str = Column(String(100), nullable=False)
    city: str = Column(String(100), nullable=False)
    organization_name: str = Column(String(255), nullable=False) 
    organization_contact: str = Column(String(255), nullable=False)

    def to_dict(self):
        """Converts the EventModel instance to a dictionary with serializable types."""
        event_dict = asdict(self)
        event_dict['start_date'] = self.start_date.isoformat() if isinstance(self.start_date, datetime) else self.start_date
        event_dict['end_date'] = self.end_date.isoformat() if isinstance(self.end_date, datetime) else self.end_date
        event_dict['start_time'] = self.start_time.strftime('%H:%M:%S') if isinstance(self.start_time, time) else self.start_time
        event_dict['end_time'] = self.end_time.strftime('%H:%M:%S') if isinstance(self.end_time, time) else self.end_time
        return event_dict
