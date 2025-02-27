import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from dotenv import load_dotenv  # type: ignore

# Carregar variáveis de ambiente locais (apenas para desenvolvimento)
load_dotenv()

# Obter credenciais do Firebase da variável de ambiente
FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS_JSON")

if not FIREBASE_CREDENTIALS_JSON:
    raise ValueError("FIREBASE_CREDENTIALS_JSON não definida na AWS.")

# Corrigir formatação do `private_key` (substituir `\\n` por `\n`)
firebase_credentials_dict = json.loads(FIREBASE_CREDENTIALS_JSON)
firebase_credentials_dict["private_key"] = firebase_credentials_dict["private_key"].replace("\\n", "\n")

# Inicializa Firebase diretamente com o JSON corrigido
cred = credentials.Certificate(firebase_credentials_dict)
firebase_admin.initialize_app(cred, {
    'storageBucket': 'eventues-auth.appspot.com'
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
