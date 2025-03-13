# api/user_api.py
from chalice import Blueprint, Response, CORSConfig
from chalicelib.src.usecases.user_usecase import UserUseCase
from cachetools import TTLCache, cached
import json

cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['*'],
    max_age=600
)

user_api = Blueprint(__name__)
use_case = UserUseCase()

# Cache configuration
user_cache = TTLCache(maxsize=100, ttl=300)  # 5 minutes cache

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

@user_api.route('/users/{user_id}', methods=['GET'], cors=cors_config)
@cached(user_cache)
def get_user(user_id):
    try:
        user = use_case.get_user(user_id)
        if not user:
            return Response(
                body=json.dumps({"error": "Usuário não encontrado"}),
                status_code=404,
                headers={'Content-Type': 'application/json'}
            )
        return Response(
            body=json.dumps(user),
            status_code=200,
            headers={
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300'  # 5 minutes cache
            }
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@user_api.route('/users/{user_id}/update', methods=['PATCH'], cors=cors_config)
def update_user(user_id):
    request = user_api.current_request
    user_data = request.json_body
    user_data['id'] = user_id
    user = use_case.update_user(user_data)
    response_data = user.to_dict()
    return Response(
        body=response_data,
        status_code=200,
        headers={'Content-Type': 'application/json'}
    )

@user_api.route('/users/{user_id}', methods=['PUT'], cors=cors_config)
def update_user_put(user_id):
    try:
        request = user_api.current_request
        user_data = request.json_body
        
        # Invalidate user cache on update
        if user_id in user_cache:
            del user_cache[user_id]
            
        updated_user = use_case.update_user(user_id, user_data)
        return Response(
            body=json.dumps(updated_user),
            status_code=200,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e)}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
