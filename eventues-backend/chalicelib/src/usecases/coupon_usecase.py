from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from chalicelib.src.models.coupon_model import CouponModel, CouponType
from chalicelib.src.repositories.coupon_repository import CouponRepository


class CouponUseCase:
    """Caso de uso para gerenciar cupons de desconto."""

    def __init__(self):
        self.repository = CouponRepository()

    def create_coupon(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria um novo cupom.
        
        Args:
            data: Dados do cupom a ser criado.
            
        Returns:
            Dicionário com dados do cupom criado ou mensagem de erro.
        """
        try:
            # Validação básica
            required_fields = ["event_id", "code", "discount_value", "discount_type"]
            for field in required_fields:
                if field not in data:
                    return {
                        "error": f"Campo obrigatório ausente: {field}",
                        "success": False
                    }, 400
            
            # Converter o código para maiúsculo para evitar duplicidades por case sensitivity
            data["code"] = data["code"].upper()
            
            # Criar o modelo do cupom
            coupon = CouponModel(
                event_id=data["event_id"],
                code=data["code"],
                discount_value=float(data["discount_value"]),
                discount_type=data["discount_type"],
                min_purchase=float(data.get("min_purchase", 0)),
                max_discount=float(data["max_discount"]) if data.get("max_discount") else None,
                max_uses=int(data["max_uses"]) if data.get("max_uses") else None,
                start_date=data.get("start_date"),
                end_date=data.get("end_date"),
                active=data.get("active", True)
            )
            
            # Adicionar o cupom
            created_coupon = self.repository.add_coupon(coupon)
            
            return {
                "coupon": created_coupon.to_dict(),
                "success": True,
                "message": "Cupom criado com sucesso!"
            }, 201
            
        except ValueError as e:
            return {
                "error": str(e),
                "success": False
            }, 400
        except Exception as e:
            return {
                "error": f"Erro ao criar cupom: {str(e)}",
                "success": False
            }, 500

    def update_coupon(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Atualiza um cupom existente.
        
        Args:
            data: Dados do cupom a ser atualizado.
            
        Returns:
            Dicionário com dados do cupom atualizado ou mensagem de erro.
        """
        try:
            # Validação básica
            required_fields = ["event_id", "coupon_id", "code", "discount_value", "discount_type"]
            for field in required_fields:
                if field not in data:
                    return {
                        "error": f"Campo obrigatório ausente: {field}",
                        "success": False
                    }, 400
            
            # Verificar se o cupom existe
            existing_coupon = self.repository.find_coupon_by_id(data["event_id"], data["coupon_id"])
            if not existing_coupon:
                return {
                    "error": "Cupom não encontrado.",
                    "success": False
                }, 404
            
            # Converter o código para maiúsculo
            data["code"] = data["code"].upper()
            
            # Atualizar o modelo do cupom
            coupon = CouponModel(
                coupon_id=data["coupon_id"],
                event_id=data["event_id"],
                code=data["code"],
                discount_value=float(data["discount_value"]),
                discount_type=data["discount_type"],
                min_purchase=float(data.get("min_purchase", 0)),
                max_discount=float(data["max_discount"]) if data.get("max_discount") else None,
                max_uses=int(data["max_uses"]) if data.get("max_uses") else None,
                uses_count=existing_coupon.uses_count,
                start_date=data.get("start_date"),
                end_date=data.get("end_date"),
                active=data.get("active", True),
                created_at=existing_coupon.created_at
            )
            
            # Atualizar o cupom
            updated_coupon = self.repository.update_coupon(coupon)
            
            return {
                "coupon": updated_coupon.to_dict(),
                "success": True,
                "message": "Cupom atualizado com sucesso!"
            }, 200
            
        except ValueError as e:
            return {
                "error": str(e),
                "success": False
            }, 400
        except Exception as e:
            return {
                "error": f"Erro ao atualizar cupom: {str(e)}",
                "success": False
            }, 500

    def delete_coupon(self, event_id: str, coupon_id: str) -> Dict[str, Any]:
        """
        Remove um cupom.
        
        Args:
            event_id: ID do evento.
            coupon_id: ID do cupom a ser removido.
            
        Returns:
            Dicionário com status da operação.
        """
        try:
            result = self.repository.delete_coupon(event_id, coupon_id)
            if not result:
                return {
                    "error": "Cupom não encontrado.",
                    "success": False
                }, 404
            
            return {
                "success": True,
                "message": "Cupom removido com sucesso!"
            }, 200
            
        except Exception as e:
            return {
                "error": f"Erro ao remover cupom: {str(e)}",
                "success": False
            }, 500

    def get_coupon_by_id(self, event_id: str, coupon_id: str) -> Dict[str, Any]:
        """
        Busca um cupom pelo ID.
        
        Args:
            event_id: ID do evento.
            coupon_id: ID do cupom.
            
        Returns:
            Dicionário com dados do cupom ou mensagem de erro.
        """
        try:
            coupon = self.repository.find_coupon_by_id(event_id, coupon_id)
            if not coupon:
                return {
                    "error": "Cupom não encontrado.",
                    "success": False
                }, 404
            
            return {
                "coupon": coupon.to_dict(),
                "success": True
            }, 200
            
        except Exception as e:
            return {
                "error": f"Erro ao buscar cupom: {str(e)}",
                "success": False
            }, 500

    def get_coupons_by_event(self, event_id: str) -> Dict[str, Any]:
        """
        Busca todos os cupons de um evento.
        
        Args:
            event_id: ID do evento.
            
        Returns:
            Dicionário com lista de cupons ou mensagem de erro.
        """
        try:
            coupons = self.repository.get_coupons_by_event(event_id)
            
            return {
                "coupons": [coupon.to_dict() for coupon in coupons],
                "success": True
            }, 200
            
        except Exception as e:
            return {
                "error": f"Erro ao buscar cupons: {str(e)}",
                "success": False
            }, 500

    def validate_coupon(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Valida um cupom para uso.
        
        Args:
            data: Dados para validação do cupom (código, evento, valor da compra).
            
        Returns:
            Dicionário com resultado da validação e desconto calculado.
        """
        try:
            # Validação básica
            required_fields = ["event_id", "code", "purchase_amount"]
            for field in required_fields:
                if field not in data:
                    return {
                        "error": f"Campo obrigatório ausente: {field}",
                        "success": False
                    }, 400
            
            event_id = data["event_id"]
            code = data["code"].upper()
            purchase_amount = float(data["purchase_amount"])
            
            # Buscar o cupom
            coupon = self.repository.find_coupon_by_code(event_id, code)
            if not coupon:
                return {
                    "error": "Cupom não encontrado.",
                    "success": False,
                    "valid": False
                }, 404
            
            # Validar o cupom
            validation = coupon.is_valid(purchase_amount)
            if not validation["valid"]:
                return {
                    "error": validation["message"],
                    "success": True,
                    "valid": False,
                    "coupon": coupon.to_dict()
                }, 200
            
            # Calcular o desconto
            discount = coupon.calculate_discount(purchase_amount)
            final_amount = purchase_amount - discount
            
            # Formatar response para incluir detalhes sobre o desconto
            discount_info = {
                "type": coupon.discount_type,
                "value": coupon.discount_value,
                "applied_discount": discount,
                "original_amount": purchase_amount,
                "final_amount": final_amount
            }
            
            return {
                "success": True,
                "valid": True,
                "coupon": coupon.to_dict(),
                "discount": discount_info,
                "message": "Cupom válido aplicado com sucesso!"
            }, 200
            
        except Exception as e:
            return {
                "error": f"Erro ao validar cupom: {str(e)}",
                "success": False,
                "valid": False
            }, 500
    
    def apply_coupon(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Aplica um cupom a um pedido e incrementa o contador de usos.
        
        Args:
            data: Dados para aplicação do cupom (código, evento, ordem, valor).
            
        Returns:
            Dicionário com resultado da aplicação.
        """
        try:
            # Validação básica
            required_fields = ["event_id", "code", "purchase_amount", "order_id"]
            for field in required_fields:
                if field not in data:
                    return {
                        "error": f"Campo obrigatório ausente: {field}",
                        "success": False
                    }, 400
            
            event_id = data["event_id"]
            code = data["code"].upper()
            purchase_amount = float(data["purchase_amount"])
            order_id = data["order_id"]
            
            # Validar o cupom primeiro
            validation_result, status_code = self.validate_coupon({
                "event_id": event_id,
                "code": code,
                "purchase_amount": purchase_amount
            })
            
            if not validation_result.get("valid", False):
                return validation_result, status_code
            
            # Se o cupom for válido, incrementar o contador de usos
            coupon = self.repository.find_coupon_by_code(event_id, code)
            if not coupon:
                return {
                    "error": "Cupom não encontrado.",
                    "success": False
                }, 404
            
            self.repository.increment_coupon_usage(event_id, coupon.coupon_id)
            
            # Retornar o resultado da validação junto com a confirmação de uso
            validation_result["coupon_applied"] = True
            validation_result["message"] = "Cupom aplicado com sucesso!"
            return validation_result, 200
            
        except Exception as e:
            return {
                "error": f"Erro ao aplicar cupom: {str(e)}",
                "success": False
            }, 500
