# repositories/user_repository.py
from src.utils.firebase import db
from src.models.user_model import UserModel
from src.models.tables import Table

class UserRepository:
    def __init__(self):
        self.users_collection = db.collection(Table.USERS.value)

    def add_user(self, user: UserModel) -> UserModel:
        self.users_collection.document(user.id).set(user.to_dict())
        return user

    def find_user_by_id(self, user_id: str) -> UserModel:
        user_document = self.users_collection.document(user_id).get()
        if user_document.exists:
            return UserModel.from_dict(user_document.to_dict())
        return None