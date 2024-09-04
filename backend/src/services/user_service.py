import uuid
from src.repositories.user_repository import UserRepository
from src.models.user_model import UserModel
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:

    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def create_user(self, uuid_str: str, email: str):
        try:
            user_uuid = uuid.UUID(uuid_str)
        except ValueError:
            raise ValueError("UUID inválido fornecido.")

        user = UserModel(email=email, uuid=user_uuid)
        return self.user_repository.create_user(user)
