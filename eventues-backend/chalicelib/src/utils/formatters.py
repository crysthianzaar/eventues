import re
from unidecode import unidecode
from firebase_admin import firestore

db = firestore.client()

def generate_slug(name: str, event_id: str = None) -> str:
    """
    Gera um slug único para o evento baseado no nome.
    Se já existir um slug igual, adiciona um número incremental no final.
    """
    # Converte para minúsculas e remove acentos
    base_slug = unidecode(name.lower())
    
    # Remove caracteres especiais e substitui espaços por hífen
    base_slug = re.sub(r'[^a-z0-9\s-]', '', base_slug)
    base_slug = re.sub(r'[-\s]+', '-', base_slug).strip('-')
    
    # Verifica se o slug já existe
    events_ref = db.collection('events')
    
    # Se estiver atualizando um evento existente, exclui ele da busca
    if event_id:
        query = events_ref.where(filter=firestore.FieldFilter('slug', '==', base_slug))
        docs = query.get()
        
        # Verifica se algum outro evento (exceto o atual) já usa este slug
        exists = any(doc.id != event_id and doc.exists for doc in docs)
    else:
        query = events_ref.where(filter=firestore.FieldFilter('slug', '==', base_slug))
        exists = len(query.get()) > 0
    
    if not exists:
        return base_slug
    
    # Se já existe, adiciona um número no final
    counter = 1
    while True:
        new_slug = f"{base_slug}-{counter}"
        
        if event_id:
            query = events_ref.where(filter=firestore.FieldFilter('slug', '==', new_slug))
            docs = query.get()
            exists = any(doc.id != event_id and doc.exists for doc in docs)
        else:
            query = events_ref.where(filter=firestore.FieldFilter('slug', '==', new_slug))
            exists = len(query.get()) > 0
            
        if not exists:
            return new_slug
        counter += 1
