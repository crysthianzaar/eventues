from typing import List, Optional, Dict, Any
import uuid
from google.cloud.firestore_v1 import FieldFilter
from datetime import datetime

from chalicelib.src.utils.firebase import db
from chalicelib.src.models.coupon_model import CouponModel
from chalicelib.src.models.tables import Table


class CouponRepository:
    """Repositório para gerenciar cupons de desconto no Firestore."""

    def __init__(self):
        self.events_collection = db.collection(Table.EVENTS.value)

    def add_coupon(self, coupon: CouponModel) -> CouponModel:
        """
        Adiciona um novo cupom ao evento.
        
        Args:
            coupon: O modelo do cupom a ser adicionado.
            
        Returns:
            O cupom adicionado com o ID atualizado.
        """
        if not coupon.coupon_id:
            coupon.coupon_id = str(uuid.uuid4())
            
        # Verifica se já existe um cupom com o mesmo código para o evento
        existing_coupon = self.find_coupon_by_code(coupon.event_id, coupon.code)
        if existing_coupon:
            raise ValueError(f"Já existe um cupom com o código '{coupon.code}' para este evento.")
        
        coupon.created_at = datetime.now().isoformat()
        coupon.updated_at = coupon.created_at
        
        # Salva o cupom como uma subcoleção do evento
        coupon_ref = (self.events_collection
                      .document(coupon.event_id)
                      .collection('coupons')
                      .document(coupon.coupon_id))
        
        coupon_ref.set(coupon.to_dict())
        return coupon

    def update_coupon(self, coupon: CouponModel) -> CouponModel:
        """
        Atualiza um cupom existente.
        
        Args:
            coupon: O modelo do cupom com as informações atualizadas.
            
        Returns:
            O cupom atualizado.
        """
        # Verifica se o cupom existe
        existing_coupon = self.find_coupon_by_id(coupon.event_id, coupon.coupon_id)
        if not existing_coupon:
            raise ValueError(f"Cupom com ID '{coupon.coupon_id}' não encontrado.")
        
        # Verifica se está alterando o código para um já existente
        if coupon.code != existing_coupon.code:
            code_exists = self.find_coupon_by_code(coupon.event_id, coupon.code)
            if code_exists:
                raise ValueError(f"Já existe um cupom com o código '{coupon.code}' para este evento.")
        
        coupon.updated_at = datetime.now().isoformat()
        
        # Atualiza o cupom
        coupon_ref = (self.events_collection
                      .document(coupon.event_id)
                      .collection('coupons')
                      .document(coupon.coupon_id))
        
        coupon_ref.update(coupon.to_dict())
        return coupon

    def delete_coupon(self, event_id: str, coupon_id: str) -> bool:
        """
        Remove um cupom.
        
        Args:
            event_id: ID do evento.
            coupon_id: ID do cupom a ser removido.
            
        Returns:
            True se o cupom foi removido, False caso contrário.
        """
        coupon_ref = (self.events_collection
                     .document(event_id)
                     .collection('coupons')
                     .document(coupon_id))
        
        coupon = coupon_ref.get()
        if not coupon.exists:
            return False
        
        coupon_ref.delete()
        return True

    def find_coupon_by_id(self, event_id: str, coupon_id: str) -> Optional[CouponModel]:
        """
        Busca um cupom pelo ID.
        
        Args:
            event_id: ID do evento.
            coupon_id: ID do cupom.
            
        Returns:
            O modelo do cupom se encontrado, None caso contrário.
        """
        coupon_ref = (self.events_collection
                     .document(event_id)
                     .collection('coupons')
                     .document(coupon_id))
        
        coupon = coupon_ref.get()
        if not coupon.exists:
            return None
        
        return CouponModel.from_dict(coupon.to_dict())

    def find_coupon_by_code(self, event_id: str, code: str) -> Optional[CouponModel]:
        """
        Busca um cupom pelo código.
        
        Args:
            event_id: ID do evento.
            code: Código do cupom.
            
        Returns:
            O modelo do cupom se encontrado, None caso contrário.
        """
        coupons_ref = (self.events_collection
                      .document(event_id)
                      .collection('coupons'))
        
        filter_ = FieldFilter("code", "==", code.upper())
        query = coupons_ref.where(filter=filter_).limit(1)
        
        results = list(query.stream())
        if not results:
            return None
        
        return CouponModel.from_dict(results[0].to_dict())

    def get_coupons_by_event(self, event_id: str) -> List[CouponModel]:
        """
        Busca todos os cupons de um evento.
        
        Args:
            event_id: ID do evento.
            
        Returns:
            Lista de modelos de cupons.
        """
        coupons_ref = (self.events_collection
                      .document(event_id)
                      .collection('coupons'))
        
        query = coupons_ref.order_by("created_at", direction="DESCENDING")
        results = list(query.stream())
        
        return [CouponModel.from_dict(doc.to_dict()) for doc in results]
    
    def increment_coupon_usage(self, event_id: str, coupon_id: str) -> bool:
        """
        Incrementa o contador de usos de um cupom.
        
        Args:
            event_id: ID do evento.
            coupon_id: ID do cupom.
            
        Returns:
            True se o contador foi incrementado, False caso contrário.
        """
        coupon = self.find_coupon_by_id(event_id, coupon_id)
        if not coupon:
            return False
        
        # Usa uma transação para garantir a atomicidade da operação
        transaction = db.transaction()
        coupon_ref = (self.events_collection
                     .document(event_id)
                     .collection('coupons')
                     .document(coupon_id))
        
        @db.transactional
        def update_counter(transaction, coupon_ref):
            coupon_snapshot = coupon_ref.get(transaction=transaction)
            if not coupon_snapshot.exists:
                return False
            
            coupon_data = coupon_snapshot.to_dict()
            current_count = coupon_data.get('uses_count', 0)
            
            transaction.update(coupon_ref, {
                'uses_count': current_count + 1,
                'updated_at': datetime.now().isoformat()
            })
            
            return True
        
        return update_counter(transaction, coupon_ref)
