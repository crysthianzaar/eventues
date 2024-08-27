from chalice import Blueprint
from src.schemas.user_schema import UserSchema
from src.services.user_service import UserService
from src.repositories.user_repository import UserRepository
from src.core.config import SessionLocal

user_bp = Blueprint(__name__)


@user_bp.route('/users', methods=['POST'])
def create_user():
    db = SessionLocal()
    user_data = user_bp.current_request.json_body
    user_repository = UserRepository(db)
    user_service = UserService(user_repository)

    user = user_service.create_user(
        username=user_data['username'],
        email=user_data['email'],
        password=user_data.get('password'),
        google_id=user_data.get('google_id'),
        profile_picture=user_data.get('profile_picture')
    )
    return user


@user_bp.route('/users/{user_id}', methods=['GET'])
def get_user(user_id):
    db = SessionLocal()
    user_repository = UserRepository(db)
    user = user_repository.get_user_by_id(user_id)

    if user:
        return UserSchema.model_validate(user).model_dump(mode="json")
    return {"error": "User not found"}, 404



@user_bp.route('/users/login', methods=['POST'])
def login_user():
    db = SessionLocal()
    user_data = user_bp.current_request.json_body
    user_repository = UserRepository(db)
    user_service = UserService(user_repository)

    user = user_service.authenticate_user(
        email=user_data['email'],
        password=user_data.get('password'),
        google_id=user_data.get('google_id')
    )
    if not user:
        return {"error": "Invalid credentials"}, 401
    return user
