import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
import os
from dotenv import load_dotenv # type: ignore

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

cred = credentials.Certificate(os.getenv('FIREBASE_CREDENTIALS'))
firebase_admin.initialize_app(cred, {
    'storageBucket': 'eventues-auth.appspot.com'
})
db = firestore.client()
bucket = storage.bucket()

def verify_token(token: str) -> str:
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except firebase_admin.auth.InvalidIdTokenError:
        raise ValueError("Token de autenticação inválido.")
    except firebase_admin.auth.ExpiredIdTokenError:
        raise ValueError("Token de autenticação expirado.")
    except Exception as e:
        raise ValueError(f"Erro na verificação do token: {str(e)}")