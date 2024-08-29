from pydantic import BaseModel
from src.models.user_model import UserRole


class UserCreate(BaseModel):
    username: str
    email: str
    password: str = None
    google_id: str = None
    profile_picture: str = None
    role: UserRole = UserRole.PARTICIPANT


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: UserRole
    is_active: bool
    profile_picture: str = None

    class Config:
        from_attributes = True


class UserSchema(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    role: UserRole
    profile_picture: str = None

    class Config:
        from_attributes = True
