# repositories/user_repository.py
from chalicelib.src.utils.firebase import db
from chalicelib.src.models.user_model import UserModel
from chalicelib.src.models.tables import Table
from chalicelib.src.utils.utils import filter_none_values

class UserRepository:
    def __init__(self):
        self.users_collection = db.collection(Table.USERS.value)

    def add_user(self, user: UserModel) -> UserModel:
        self.users_collection.document(user.id).set(user.to_dict())
        return user

    def update_user(self, user: UserModel) -> UserModel:
        user_dict = filter_none_values(user.to_dict())
        self.users_collection.document(user.id).set(user_dict, merge=True)
        return user

    def find_user_by_id(self, user_id: str) -> UserModel:
        user_document = self.users_collection.document(user_id).get()
        if user_document.exists:
            return UserModel.from_dict(user_document.to_dict())
        return None
