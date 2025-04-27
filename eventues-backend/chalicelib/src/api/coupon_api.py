import json
from chalice import Blueprint, Response, CORSConfig
from chalicelib.src.usecases.coupon_usecase import CouponUseCase
from chalicelib.src.utils.firebase import verify_token
from chalicelib.src.utils.json_encoder import firestore_json_dumps

# Configuração CORS
cors_config = CORSConfig(
    allow_origin='*',
    allow_headers=['*'],
    max_age=600
)

coupon_api = Blueprint(__name__)
coupon_api.cors = cors_config
use_case = CouponUseCase()

@coupon_api.route('/events/{event_id}/coupons', methods=['POST'], cors=cors_config)
def create_coupon(event_id):
    """Endpoint para criar um novo cupom."""
    try:
        request = coupon_api.current_request
        data = request.json_body
        data['event_id'] = event_id
        
        result, status_code = use_case.create_coupon(data)
        
        return Response(
            body=firestore_json_dumps(result),
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({"error": str(e), "success": False}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@coupon_api.route('/events/{event_id}/coupons/{coupon_id}', methods=['PUT'], cors=cors_config)
def update_coupon(event_id, coupon_id):
    """Endpoint para atualizar um cupom existente."""
    try:
        request = coupon_api.current_request
        data = request.json_body
        data['event_id'] = event_id
        data['coupon_id'] = coupon_id
        
        result, status_code = use_case.update_coupon(data)
        
        return Response(
            body=firestore_json_dumps(result),
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({"error": str(e), "success": False}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@coupon_api.route('/events/{event_id}/coupons/{coupon_id}', methods=['DELETE'], cors=cors_config)
def delete_coupon(event_id, coupon_id):
    """Endpoint para remover um cupom."""
    try:
        result, status_code = use_case.delete_coupon(event_id, coupon_id)
        
        return Response(
            body=firestore_json_dumps(result),
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({"error": str(e), "success": False}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@coupon_api.route('/events/{event_id}/coupons/{coupon_id}', methods=['GET'], cors=cors_config)
def get_coupon(event_id, coupon_id):
    """Endpoint para buscar um cupom específico."""
    try:
        result, status_code = use_case.get_coupon_by_id(event_id, coupon_id)
        
        return Response(
            body=firestore_json_dumps(result),
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({"error": str(e), "success": False}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@coupon_api.route('/events/{event_id}/coupons', methods=['GET'], cors=cors_config)
def get_coupons(event_id):
    """Endpoint para listar todos os cupons de um evento."""
    try:
        result, status_code = use_case.get_coupons_by_event(event_id)
        
        return Response(
            body=firestore_json_dumps(result),
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({"error": str(e), "success": False}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@coupon_api.route('/validate-coupon', methods=['POST'], cors=cors_config)
def validate_coupon():
    """Endpoint para validar um cupom (sem autenticação)."""
    try:
        request = coupon_api.current_request
        data = request.json_body
        
        result, status_code = use_case.validate_coupon(data)
        
        return Response(
            body=firestore_json_dumps(result),
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=json.dumps({"error": str(e), "success": False, "valid": False}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )

@coupon_api.route('/apply-coupon', methods=['POST'], cors=cors_config)
def apply_coupon():
    """Endpoint para aplicar um cupom a um pedido."""
    try:
        request = coupon_api.current_request
        data = request.json_body
        
        result, status_code = use_case.apply_coupon(data)
        
        return Response(
            body=firestore_json_dumps(result),
            status_code=status_code,
            headers={'Content-Type': 'application/json'}
        )
    except Exception as e:
        return Response(
            body=firestore_json_dumps({"error": str(e), "success": False}),
            status_code=500,
            headers={'Content-Type': 'application/json'}
        )
