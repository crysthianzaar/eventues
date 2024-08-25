# backend/app/api/v1/users.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user_schema import UserCreate
from app.services.user_service import create_user
from core.database import get_db

router = APIRouter()


@router.post("/users/")
def create_new_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db=db, user=user)
