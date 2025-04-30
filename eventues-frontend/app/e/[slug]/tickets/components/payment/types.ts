export interface TicketData {
  id: string;
  name: string;
  price: number;
  quantity: number;
  taxa?: number;
  valor_total?: number;
}

export interface PaymentTicket {
  ticketId: string;
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
  customerId?: string;
  addressNumber?: string;
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
  event_slug?: string;
}

export interface CustomerData {
  name: string;
  email: string;
  cpf: string;
  phone: string;
}
