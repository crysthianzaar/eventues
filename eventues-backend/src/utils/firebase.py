import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv # type: ignore

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

cred = credentials.Certificate(os.getenv('FIREBASE_CREDENTIALS'))
firebase_admin.initialize_app(cred)
db = firestore.client()
