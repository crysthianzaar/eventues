from firebase_admin import firestore
from datetime import datetime

class AnalyticsRepository:
    def __init__(self, db):
        self.db = db
        self.collection = 'event_analytics'
    
    def increment_page_view(self, event_id):
        """
        Incrementa o contador de visualizações para um evento específico.
        
        Args:
            event_id (str): ID do evento
            
        Returns:
            int: Número total de visualizações após o incremento
        """
        analytics_ref = self.db.collection(self.collection).document(event_id)
        
        # Tentar obter o documento atual
        analytics_doc = analytics_ref.get()
        
        # Utilizar transação para garantir consistência
        transaction = self.db.transaction()
        
        @firestore.transactional
        def update_in_transaction(transaction, doc_ref, doc_snapshot):
            # Se o documento não existir, criar com visualizações = 1
            if not doc_snapshot.exists:
                transaction.set(doc_ref, {
                    'event_id': event_id,
                    'visualizacoes': 1,
                    'created_at': datetime.now(),
                    'updated_at': datetime.now()
                })
                return 1
            
            # Caso contrário, incrementar o contador
            current_data = doc_snapshot.to_dict()
            new_count = current_data.get('visualizacoes', 0) + 1
            
            transaction.update(doc_ref, {
                'visualizacoes': new_count,
                'updated_at': datetime.now()
            })
            
            return new_count
        
        # Executar a transação
        total_views = update_in_transaction(transaction, analytics_ref, analytics_doc)
        return total_views
    
    def get_page_views(self, event_id):
        """
        Obtém o número total de visualizações para um evento.
        
        Args:
            event_id (str): ID do evento
            
        Returns:
            int: Número total de visualizações
        """
        analytics_ref = self.db.collection(self.collection).document(event_id)
        analytics_doc = analytics_ref.get()
        
        if not analytics_doc.exists:
            return 0
        
        return analytics_doc.to_dict().get('visualizacoes', 0)
