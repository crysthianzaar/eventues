from chalice import Blueprint, Response, CORSConfig
from src.schemas.user_schema import UserCreate
from src.services.user_service import UserService
from src.repositories.user_repository import UserRepository
from src.core.config import SessionLocal
import json

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['Authorization', 'Content-Type'],
    max_age=600
)

user_bp = Blueprint(__name__)


@user_bp.route('/auth', methods=['POST'], cors=cors_config)
def create_user():
    db = SessionLocal()
    user_data = user_bp.current_request.json_body
    user_repository = UserRepository(db)
    user_service = UserService(user_repository)

    user = user_service.create_user(
        uuid_str=user_data.get('uuid'),
        email=user_data['email']
    )

    return Response(
        body=json.dumps(UserCreate.model_validate(user).model_dump(mode="json")),
        status_code=201,
        headers={'Content-Type': 'application/json'}
    )
