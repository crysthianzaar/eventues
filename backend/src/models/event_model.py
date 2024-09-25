# src/models/models.py

from dataclasses import asdict, dataclass
from enum import Enum as PyEnum
import uuid
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Table,
    Text,
    Time,
    Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, time
from src.models.base import Base


class PriceType(PyEnum):
    STANDARD = "standard"
    BATCH = "batch"


class AppliesTo(PyEnum):
    GLOBAL = "global"
    CATEGORIA = "categoria"
    SUBCATEGORIA = "subcategoria"


class BatchType(PyEnum):
    TEMPORAL = "temporal"
    QUANTITY = "quantity"


# ### Tabelas de Associação ###

price_configuration_categories = Table(
    'price_configuration_categories',
    Base.metadata,
    Column('price_configuration_id', String(36), ForeignKey('price_configurations.id'), primary_key=True),
    Column('category_id', String(36), ForeignKey('categories.id'), primary_key=True)
)

price_configuration_subcategories = Table(
    'price_configuration_subcategories',
    Base.metadata,
    Column('price_configuration_id', String(36), ForeignKey('price_configurations.id'), primary_key=True),
    Column('subcategory_id', String(36), ForeignKey('subcategories.id'), primary_key=True)
)


# ### Modelos ###

@dataclass
class EventModel(Base):
    __tablename__ = 'events'

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    event_id: str = Column(String(36), nullable=False)
    user_id: str = Column(String(36), ForeignKey('users.uuid'), nullable=False)
    name: str = Column(String(255), nullable=False)
    category: str = Column(String(255), nullable=False)
    start_date: datetime = Column(DateTime, nullable=False)
    start_time: time = Column(Time, nullable=True)
    end_date: datetime = Column(DateTime, nullable=False)
    end_time: time = Column(Time, nullable=True)
    event_type: str = Column(String(50), nullable=False)
    event_category: str = Column(String(100), nullable=False)
    state: str = Column(String(100), nullable=False)
    city: str = Column(String(100), nullable=False)
    address: str = Column(String(255), nullable=False)
    address_complement: str = Column(String(255))
    address_detail: str = Column(String(255))
    organization_name: str = Column(String(255), nullable=False) 
    organization_contact: str = Column(String(255), nullable=False)
    event_status: str = Column(String(255))
    event_description: str = Column(Text, nullable=True)

    def to_dict(self):
        """Converts the EventModel instance to a dictionary with serializable types."""
        event_dict = asdict(self)
        event_dict['start_date'] = self.start_date.isoformat() if isinstance(self.start_date, datetime) else self.start_date
        event_dict['end_date'] = self.end_date.isoformat() if isinstance(self.end_date, datetime) else self.end_date
        event_dict['start_time'] = self.start_time.strftime('%H:%M:%S') if isinstance(self.start_time, time) else self.start_time
        event_dict['end_time'] = self.end_time.strftime('%H:%M:%S') if isinstance(self.end_time, time) else self.end_time
        return event_dict

@dataclass
class EventDocuments(Base):
    __tablename__ = 'event_documents'

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    document_id: uuid.UUID = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    event_id: str = Column(String(36), ForeignKey('events.event_id'), nullable=False)
    file_name: str = Column(String(255), nullable=False)
    url: str = Column(String(255), nullable=False)
    s3_key: str = Column(String(255), nullable=False)

    event = relationship("EventModel", back_populates="documents")

    def to_dict(self):
        document_dict = asdict(self)
        document_dict['document_id'] = str(self.document_id)
        document_dict['event_id'] = str(self.event_id)
        return document_dict

@dataclass
class EventPolicy(Base):
    __tablename__ = 'event_policies'

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    policy_id: uuid.UUID = Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True, nullable=False)
    event_id: str = Column(String(36), ForeignKey('events.event_id'), nullable=False)
    event_visibility: bool = Column(Boolean, nullable=False, default=False)
    participant_list_visibility: str = Column(String(50), nullable=False, default='organizador')
    cpf_validation: bool = Column(Boolean, nullable=False, default=False)
    allow_third_party_registration: bool = Column(Boolean, nullable=False, default=False)
    has_age_limit: bool = Column(Boolean, nullable=False, default=False)
    age_min: int = Column(Integer, nullable=True)
    age_max: int = Column(Integer, nullable=True)
    allow_transfer: bool = Column(Boolean, nullable=False, default=False)

    event = relationship("EventModel", back_populates="policies")

    def to_dict(self):
        policy_dict = asdict(self)
        policy_dict['policy_id'] = str(self.policy_id)
        policy_dict['event_id'] = str(self.event_id)
        return policy_dict

    def from_dict(cls, policy_dict):
        """Creates an EventPolicy instance from a dictionary."""
        return cls(
            policy_id=uuid.UUID(policy_dict.get('policy_id')),
            event_id=policy_dict.get('event_id'),
            event_visibility=policy_dict.get('event_visibility', False),
            participant_list_visibility=policy_dict.get('participant_list_visibility', 'organizador'),
            cpf_validation=policy_dict.get('cpf_validation', False),
            allow_third_party_registration=policy_dict.get('allow_third_party_registration', False),
            has_age_limit=policy_dict.get('has_age_limit', False),
            age_min=policy_dict.get('age_min'),
            age_max=policy_dict.get('age_max'),
            allow_transfer=policy_dict.get('allow_transfer', False)
        )

EventModel.policies = relationship("EventPolicy", order_by=EventPolicy.id, back_populates="event")
EventModel.documents = relationship("EventDocuments", order_by=EventDocuments.id, back_populates="event")


@dataclass
class Category(Base):
    __tablename__ = 'categories'

    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id: str = Column(String(36), ForeignKey('events.event_id'), nullable=False)  # Campo de associação
    name: str = Column(String(255), nullable=False, unique=True)
    description: Optional[str] = Column(Text, nullable=True)

    def to_dict(self):
        """Converte a instância de Category para um dicionário."""
        return {
            "id": self.id,
            "event_id": self.event_id,
            "name": self.name,
            "description": self.description,
        }


@dataclass
class Subcategory(Base):
    __tablename__ = 'subcategories'

    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: str = Column(String(255), nullable=False)
    description: Optional[str] = Column(Text, nullable=True)
    category_id: str = Column(String(36), ForeignKey('categories.id'), nullable=False)

    def to_dict(self):
        """Converte a instância de Subcategory para um dicionário."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category_id": self.category_id
        }


@dataclass
class PriceConfiguration(Base):
    __tablename__ = 'price_configurations'

    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id: str = Column(String(36), ForeignKey('events.event_id'), nullable=False)  # Campo de associação
    name: str = Column(String(255), nullable=False)
    type: PriceType = Column(Enum(PriceType), nullable=False)
    applies_to: AppliesTo = Column(Enum(AppliesTo), nullable=False)
    price: Optional[float] = Column(Float, nullable=True)

    def to_dict(self):
        """Converte a instância de PriceConfiguration para um dicionário com tipos serializáveis."""
        return {
            "id": self.id,
            "event_id": self.event_id,
            "name": self.name,
            "type": self.type.value,
            "applies_to": self.applies_to.value,
            "price": self.price,
        }


@dataclass
class BatchConfig(Base):
    __tablename__ = 'batch_configs'

    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: str = Column(String(255), nullable=False)
    type: BatchType = Column(Enum(BatchType), nullable=False)
    start_date: Optional[Date] = Column(Date, nullable=True)
    end_date: Optional[Date] = Column(Date, nullable=True)
    start_quantity: Optional[int] = Column(Integer, nullable=True)
    end_quantity: Optional[int] = Column(Integer, nullable=True)
    price: float = Column(Float, nullable=False)
    price_configuration_id: str = Column(String(36), ForeignKey('price_configurations.id'), nullable=False)

    def to_dict(self):
        """Converte a instância de BatchConfig para um dicionário."""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type.value,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "start_quantity": self.start_quantity,
            "end_quantity": self.end_quantity,
            "price": self.price,
            "price_configuration_id": self.price_configuration_id
        }
