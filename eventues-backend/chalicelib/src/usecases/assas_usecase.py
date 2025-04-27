import json
from typing import Any, Dict, Tuple
import requests


ASAAS_API_KEY = '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6Ojk1ZTUwZTlkLTUyYmQtNGMyYy05MjViLTUwNjQzMWUxODZlZTo6JGFhY2hfMjZkMTY3NjQtMDA3NC00ZTg2LTk1MzItMzVjMjc2ZjNlNmRj'
ASAAS_API_URL = 'https://sandbox.asaas.com/api/v3'

class AsaasUseCase:
    def __init__(self):
        self.headers = {
            'Content-Type': 'application/json',
            'access_token': ASAAS_API_KEY
        }

    def create_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(
            f'{ASAAS_API_URL}/customers',
            json=customer_data,
            headers=self.headers
        )
        return response.json()

    def tokenize_card(self, tokenization_data: Dict[str, Any]) -> Dict[str, Any]:
        print("[DEBUG] Tokenizing card with data:", json.dumps(tokenization_data, indent=2))
        if 'creditCard' in tokenization_data:
            card_data = tokenization_data['creditCard']
            if 'expirationMonth' in card_data:
                card_data['expiryMonth'] = card_data.pop('expirationMonth')
            if 'expirationYear' in card_data:
                card_data['expiryYear'] = card_data.pop('expirationYear')

        response = requests.post(
            f'{ASAAS_API_URL}/creditCard/tokenize',
            json=tokenization_data,
            headers=self.headers
        )
        print("[DEBUG] Asaas API Response:", response.status_code)
        if not response.ok:
            print("[ERROR] Tokenization failed:", response.text)
        return response.json()

    def create_payment(self, payment_data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        response = requests.post(
            f'{ASAAS_API_URL}/payments',
            json=payment_data,
            headers=self.headers
        )
        return response.json(), response.status_code

    def get_pix_qr_code(self, payment_id: str) -> Dict[str, Any]:
        response = requests.get(
            f'{ASAAS_API_URL}/payments/{payment_id}/pixQrCode',
            headers=self.headers
        )
        return response.json() if response.ok else None

    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        response = requests.get(
            f'{ASAAS_API_URL}/payments/{payment_id}',
            headers=self.headers
        )
        return response.json() if response.ok else None
