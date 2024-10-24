# api/user_api.py
from chalice import Blueprint, Response, CORSConfig
from src.usecases.user_usecase import UserUseCase

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['Authorization', 'Content-Type'],
    max_age=600
)

user_api = Blueprint(__name__)
use_case = UserUseCase()

@user_api.route('/auth', methods=['POST'], cors=cors_config)
def authenticate_or_create_user():
    request = user_api.current_request
    user_data = request.json_body
    response_data = use_case.authenticate_or_create_user(user_data)
    return Response(
        body=response_data,
        status_code=201,
        headers={'Content-Type': 'application/json'}
    )

@user_api.route('/users/{user_id}', methods=['GET'])
def get_user(user_id):
    user = use_case.get_user(user_id)
    if user:
        return user.dict()
    else:
        return {'message': 'User not found'}, 404
