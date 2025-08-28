import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from chalicelib.src.config.environment import env_config

# Get Firebase configuration for current environment
firebase_config = env_config.get_firebase_config()

# Initialize Firebase with environment-specific configuration
cred = credentials.Certificate(firebase_config['credentials'])
firebase_admin.initialize_app(cred, {
    'storageBucket': firebase_config['storage_bucket']
})

# Conexão com Firestore e Storage
db = firestore.client()
bucket = storage.bucket()

# Função para verificar tokens de autenticação do Firebase
def verify_token(token: str) -> str:
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]
    except firebase_admin.auth.InvalidIdTokenError:
        raise ValueError("Token de autenticação inválido.")
    except firebase_admin.auth.ExpiredIdTokenError:
        raise ValueError("Token de autenticação expirado.")
    except Exception as e:
        raise ValueError(f"Erro na verificação do token: {str(e)}")
