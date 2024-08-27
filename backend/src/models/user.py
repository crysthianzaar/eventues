from sqlalchemy import Column, Integer, String, Boolean, Enum
from .base import Base
import enum


class UserRole(enum.Enum):
    ADMIN = "admin"
    ORGANIZER = "organizer"
    PARTICIPANT = "participant"


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    role = Column(Enum(UserRole), default=UserRole.PARTICIPANT)
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    profile_picture = Column(String(255), nullable=True)
    access_token = Column(String(255), nullable=True)
    refresh_token = Column(String(255), nullable=True)
