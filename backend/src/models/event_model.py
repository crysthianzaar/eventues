from datetime import datetime, time
from sqlalchemy import Column, DateTime, Float, Integer, String, Text, Time, ForeignKey
from src.models.base import Base

class EventModel(Base):
    __tablename__ = 'events'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.uuid'), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(255), nullable=False)
    start_date = Column(DateTime, nullable=False)
    start_time = Column(Time, nullable=False)
    end_date = Column(DateTime, nullable=False)
    end_time = Column(Time, nullable=False)
    event_type = Column(String(50), nullable=False)
    event_category = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    organization_name = Column(String(255), nullable=False) 
    organization_contact = Column(String(255), nullable=False)
