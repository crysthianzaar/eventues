from sqlalchemy.orm import Session
from src.models.user import User, UserRole


class UserRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_user_by_id(self, user_id: int):
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, email: str):
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_google_id(self, google_id: str):
        return self.db.query(User).filter(User.google_id == google_id).first()

    def create_user(self, user: User):
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user(self, user: User):
        self.db.commit()
        return user

    def delete_user(self, user: User):
        self.db.delete(user)
        self.db.commit()

    def get_users_by_role(self, role: UserRole):
        return self.db.query(User).filter(User.role == role).all()
