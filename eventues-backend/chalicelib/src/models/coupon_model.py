from enum import Enum
from datetime import datetime
from typing import Optional, Dict, Any, List


class CouponType(Enum):
    PERCENTAGE = "percentage"  # Desconto percentual (ex: 10%)
    FIXED = "fixed"  # Valor fixo (ex: R$ 20,00)


class CouponModel:
    """Modelo para cupons de desconto."""

    def __init__(
        self,
        coupon_id: str = None,
        event_id: str = None,
        code: str = None,
        discount_value: float = 0.0,
        discount_type: str = CouponType.PERCENTAGE.value,
        min_purchase: float = 0.0,
        max_discount: Optional[float] = None,
        max_uses: int = None,
        uses_count: int = 0,
        start_date: str = None,
        end_date: str = None,
        active: bool = True,
        created_at: str = None,
        updated_at: str = None,
    ):
        self.coupon_id = coupon_id
        self.event_id = event_id
        self.code = code
        self.discount_value = discount_value
        self.discount_type = discount_type
        self.min_purchase = min_purchase
        self.max_discount = max_discount
        self.max_uses = max_uses
        self.uses_count = uses_count
        self.start_date = start_date
        self.end_date = end_date
        self.active = active
        self.created_at = created_at or datetime.now().isoformat()
        self.updated_at = updated_at or datetime.now().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        """Converte o objeto para um dicionário."""
        return {
            "coupon_id": self.coupon_id,
            "event_id": self.event_id,
            "code": self.code,
            "discount_value": self.discount_value,
            "discount_type": self.discount_type,
            "min_purchase": self.min_purchase,
            "max_discount": self.max_discount,
            "max_uses": self.max_uses,
            "uses_count": self.uses_count,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "active": self.active,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "CouponModel":
        """Cria um objeto a partir de um dicionário."""
        return cls(
            coupon_id=data.get("coupon_id"),
            event_id=data.get("event_id"),
            code=data.get("code"),
            discount_value=data.get("discount_value", 0.0),
            discount_type=data.get("discount_type", CouponType.PERCENTAGE.value),
            min_purchase=data.get("min_purchase", 0.0),
            max_discount=data.get("max_discount"),
            max_uses=data.get("max_uses"),
            uses_count=data.get("uses_count", 0),
            start_date=data.get("start_date"),
            end_date=data.get("end_date"),
            active=data.get("active", True),
            created_at=data.get("created_at"),
            updated_at=data.get("updated_at"),
        )
        
    def is_valid(self, purchase_amount: float) -> Dict[str, Any]:
        """
        Verifica se o cupom é válido para uso com base em suas restrições.
        
        Args:
            purchase_amount: Valor da compra para validar contra valor mínimo
            
        Returns:
            Dict com status e mensagem de erro, se houver.
        """
        # Use naive datetime (without timezone info) for consistent comparisons
        now = datetime.now()
        
        if not self.active:
            return {"valid": False, "message": "Este cupom está inativo."}
        
        if self.start_date:
            # Convert ISO string to datetime and ensure it's naive
            start_date = datetime.fromisoformat(self.start_date.replace('Z', '+00:00'))
            # Remove timezone info if present
            if start_date.tzinfo is not None:
                start_date = start_date.replace(tzinfo=None)
            if start_date > now:
                return {"valid": False, "message": "Este cupom ainda não está válido."}
        
        if self.end_date:
            # Convert ISO string to datetime and ensure it's naive
            end_date = datetime.fromisoformat(self.end_date.replace('Z', '+00:00'))
            # Remove timezone info if present
            if end_date.tzinfo is not None:
                end_date = end_date.replace(tzinfo=None)
            if end_date < now:
                return {"valid": False, "message": "Este cupom expirou."}
        
        if self.max_uses and self.uses_count >= self.max_uses:
            return {"valid": False, "message": "Este cupom atingiu o limite máximo de usos."}
        
        if purchase_amount < self.min_purchase:
            return {
                "valid": False, 
                "message": f"O valor mínimo para este cupom é R$ {self.min_purchase:.2f}."
            }
        
        return {"valid": True, "message": ""}
    
    def calculate_discount(self, purchase_amount: float) -> float:
        """
        Calcula o valor do desconto com base no tipo e valor do cupom.
        
        Args:
            purchase_amount: O valor total da compra.
            
        Returns:
            O valor do desconto a ser aplicado.
        """
        if self.discount_type == CouponType.PERCENTAGE.value:
            discount = purchase_amount * (self.discount_value / 100)
            
            # Se houver um valor máximo de desconto, aplica-o
            if self.max_discount is not None and discount > self.max_discount:
                return self.max_discount
            
            return discount
        
        elif self.discount_type == CouponType.FIXED.value:
            # Para desconto de valor fixo, o desconto não pode ser maior que o valor da compra
            return min(self.discount_value, purchase_amount)
        
        return 0.0
