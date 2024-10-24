from dataclasses import dataclass
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone

@dataclass
class UserModel:
    id: str
    email: EmailStr
    is_active: bool = True
    created_at: datetime = datetime.now(timezone.utc)
    updated_at: datetime = datetime.now(timezone.utc)

    @classmethod
    def from_dict(cls, data: dict):
        return cls(
            id=data.get('id'),
            email=data.get('email'),
            is_active=data.get('is_active', True),
            created_at=data.get('created_at', datetime.now(timezone.utc)),
            updated_at=data.get('updated_at', datetime.now(timezone.utc))
        )

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'is_active': self.is_active,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
