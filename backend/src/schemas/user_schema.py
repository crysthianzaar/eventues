from pydantic import BaseModel
from uuid import UUID


class UserCreate(BaseModel):
    email: str
    uuid: UUID
    
    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    profile_picture: str = None

    class Config:
        from_attributes = True

