import uuid
from src.repositories.user_repository import UserRepository
from src.models.user_model import UserModel

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

    def get_user_by_email(self, email: str):
        return self.user_repository.get_user_by_email(email)

    def authenticate_or_create_user(self, user_data: dict) -> dict:
        existing_user = self.user_repository.get_user_by_email(user_data['email'])

        if existing_user:
            return {"message": "Usuário autenticado", "status": "OK"}

        self.create_user(user_data['uuid'], user_data['email'])
        return {"message": "Usuário cadastrado", "status": "OK"}
