export interface TicketData {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentFormData {
  name: string;
  email: string;
  cpfCnpj: string;
  paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  phone: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardHolderName: string;
  cardFocus: 'number' | 'name' | 'expiry' | 'cvc' | '';
  cardType: string;
  postalCode: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  value: number;
  payment_url?: string;
  invoiceUrl?: string;
  transactionReceiptUrl?: string;
  billingType: string;
  bankSlipUrl?: string;
  pixQrCode?: {
    encodedImage: string;
    payload: string;
    expirationDate: string;
  };
  encodedImage?: string;
  payload?: string;
  expirationDate?: string;
}

export interface CustomerData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
}
