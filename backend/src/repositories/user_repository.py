from sqlalchemy.orm import Session
from src.models.user_model import UserModel


class UserRepository:

    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user: UserModel):
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
