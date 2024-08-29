from src.repositories.user_repository import UserRepository
from src.models.user_model import UserModel, UserRole
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class UserService:

    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def get_user(self, user_id: int):
        return self.user_repository.get_user_by_id(user_id)

    def create_user(self, username: str, email: str, password: str = None,
                    role: UserRole = UserRole.PARTICIPANT,
                    google_id: str = None, profile_picture: str = None):
        hashed_password = pwd_context.hash(password) if password else None
        user = UserModel(username=username, email=email,
                         hashed_password=hashed_password, role=role,
                         google_id=google_id, profile_picture=profile_picture)
        return self.user_repository.create_user(user)

    def authenticate_user(self, email: str,
                          password: str = None, google_id: str = None):
        if google_id:
            user = self.user_repository.get_user_by_google_id(google_id)
            if user:
                return user

        user = self.user_repository.get_user_by_email(email)
        if not user:
            return None
        if password and not pwd_context.verify(password, user.hashed_password):
            return None
        return user

    def get_users_by_role(self, role: UserRole):
        return self.user_repository.get_users_by_role(role)
