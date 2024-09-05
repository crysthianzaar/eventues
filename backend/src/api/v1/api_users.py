from chalice import Blueprint, Response, CORSConfig
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

    response_data = user_service.authenticate_or_create_user(user_data)

    return Response(
        body=json.dumps(response_data),
        status_code=201,
        headers={'Content-Type': 'application/json'}
    )