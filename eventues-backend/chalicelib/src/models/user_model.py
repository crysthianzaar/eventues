from dataclasses import dataclass
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone

@dataclass
class UserModel:
    id: str
    email: EmailStr
    name: str = None
    birth_date: datetime = None
    cpf: str = None
    phone_number: str = None
    is_active: bool = True
    created_at: datetime = datetime.now(timezone.utc)
    updated_at: datetime = datetime.now(timezone.utc)

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data.get('id'),
            email=data.get('email'),
            name=data.get('name'),
            birth_date=data.get('birth_date'),
            cpf=data.get('cpf'),
            phone_number=data.get('phone_number'),
            is_active=data.get('is_active', True),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at', datetime.now(timezone.utc))
        )

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'birth_date': self.birth_date.isoformat() if isinstance(self.birth_date, datetime) else self.birth_date,
            'cpf': self.cpf,
            'phone_number': self.phone_number,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            'updated_at': self.updated_at.isoformat() if isinstance(self.updated_at, datetime) else self.updated_at
        }