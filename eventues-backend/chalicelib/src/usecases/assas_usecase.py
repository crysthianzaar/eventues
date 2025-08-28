import json
from typing import Any, Dict, Tuple
import requests
from chalicelib.src.config.environment import env_config


class AsaasUseCase:
    def __init__(self):
        # Get Asaas configuration for current environment
        asaas_config = env_config.get_asaas_config()
        self.api_key = asaas_config['api_key']
        self.api_url = asaas_config['api_url']
        
        self.headers = {
            'Content-Type': 'application/json',
            'access_token': self.api_key
        }

    def create_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(
            f'{self.api_url}/customers',
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
            f'{self.api_url}/creditCard/tokenize',
            json=tokenization_data,
            headers=self.headers
        )
        print("[DEBUG] Asaas API Response:", response.status_code)
        if not response.ok:
            print("[ERROR] Tokenization failed:", response.text)
        return response.json()

    def create_payment(self, payment_data: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        """
        Create a payment using the Asaas API
        
        Args:
            payment_data: Dictionary with payment details, including installment info if applicable
        
        Returns:
            Tuple containing (response_json, status_code)
        """
        # Print debug info for installments if present
        if payment_data.get('installmentCount') and payment_data.get('installmentCount') > 1:
            print(f"[DEBUG] Creating payment with installments: {payment_data.get('installmentCount')}x")
            print(f"[DEBUG] Total value: {payment_data.get('value')}")
            print(f"[DEBUG] Installment value: {payment_data.get('installmentValue')}")
            
        response = requests.post(
            f'{self.api_url}/payments',
            json=payment_data,
            headers=self.headers
        )
        
        # Log error if payment creation failed
        if not response.ok:
            print(f"[ERROR] Payment creation failed: {response.status_code} - {response.text}")
            
        return response.json(), response.status_code

    def get_pix_qr_code(self, payment_id: str) -> Dict[str, Any]:
        response = requests.get(
            f'{self.api_url}/payments/{payment_id}/pixQrCode',
            headers=self.headers
        )
        return response.json() if response.ok else None

    def get_payment_status(self, payment_id: str) -> Dict[str, Any]:
        response = requests.get(
            f'{self.api_url}/payments/{payment_id}',
            headers=self.headers
        )
        return response.json() if response.ok else None
        
    def simulate_installments(self, value: float, max_installments: int = 12) -> Tuple[Dict[str, Any], int]:
        """
        Simula as opções de parcelamento disponíveis para um determinado valor.
        Utiliza a fórmula da Tabela Price para calcular juros compostos conforme taxas da Asaas.
        
        Args:
            value: Valor total a ser parcelado
            max_installments: Número máximo de parcelas (máximo: 12)
            
        Returns:
            Um tuple contendo (json_response, status_code)
        """
        print(f"[DEBUG] Simulando parcelamento para valor: {value}, parcelas máximas: {max_installments}")
        
        # Garante que o valor máximo de parcelas é 12 (limite da Asaas)
        max_installments = min(max_installments, 12)
        
        # Se o valor for muito baixo (<R$10), retorna apenas a opção à vista
        if value < 10:
            return {
                'installments': [
                    {
                        'installmentNumber': 1,
                        'value': value,
                        'totalValue': value,
                        'installmentValue': value,
                        'dueDate': None,  # A data seria preenchida pelo sistema
                        'interest': 0,
                        'interestValue': 0
                    }
                ]
            }, 200
        
        try:
            # Taxa fixa por operação 
            fixed_fee = 0.49  # R$ 0,49 por operação conforme Asaas
            
            installments = []
            
            # Calcular cada opção de parcelamento utilizando a Tabela Price
            for parcelas in range(1, max_installments + 1):
                # Definir taxa de juros conforme quantidade de parcelas
                if parcelas == 1:
                    monthly_rate = 0.0  # Sem juros para pagamento à vista
                elif 2 <= parcelas <= 6:
                    monthly_rate = 0.0349  # 3,49% ao mês para 2-6 parcelas
                elif 7 <= parcelas <= 12:
                    monthly_rate = 0.0399  # 3,99% ao mês para 7-12 parcelas
                
                # Cálculo via Tabela Price
                if parcelas == 1:
                    # Para pagamento à vista, não aplicar juros
                    installment_value = value + fixed_fee
                    total_value = installment_value
                    interest_value = 0
                else:
                    # Fórmula Price: parcela = VP * [i * (1+i)^n] / [(1+i)^n - 1]
                    factor = (monthly_rate * (1 + monthly_rate) ** parcelas) / ((1 + monthly_rate) ** parcelas - 1)
                    installment_value = value * factor
                    total_value = (installment_value * parcelas) + fixed_fee
                    interest_value = total_value - value - fixed_fee
                
                # Arredondar valores para 2 casas decimais
                installment_value_rounded = round(total_value / parcelas, 2)
                total_value_rounded = round(installment_value_rounded * parcelas, 2)
                interest_value_rounded = round(interest_value, 2)
                interest_rate_percent = round(monthly_rate * 100, 2)
                
                installments.append({
                    'installmentNumber': parcelas,
                    'value': value,
                    'totalValue': total_value_rounded,
                    'installmentValue': installment_value_rounded,
                    'dueDate': None,
                    'interest': interest_rate_percent,
                    'interestValue': interest_value_rounded,
                    'fixedFee': fixed_fee
                })
            
            print(f"[DEBUG] Geradas {len(installments)} opções de parcelamento usando Tabela Price")
            return {'installments': installments}, 200
                
        except Exception as e:
            print(f"[ERROR] Erro ao simular parcelamento: {str(e)}")
            # Em caso de exceção, retorna uma opção à vista
            return {
                'installments': [
                    {
                        'installmentNumber': 1,
                        'value': value,
                        'totalValue': value,
                        'installmentValue': value,
                        'dueDate': None,
                        'interest': 0,
                        'interestValue': 0
                    }
                ]
            }, 200
