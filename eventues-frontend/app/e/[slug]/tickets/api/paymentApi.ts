import { User } from 'firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export interface PaymentStatus {
  status: string;
  value: number;
  billingType: string;
  invoiceUrl?: string;
  paymentDate?: string;
}

export async function checkPaymentStatus(paymentId: string, user: User): Promise<PaymentStatus> {
  const token = await user.getIdToken();
  const response = await fetch(`${API_BASE_URL}/check-payment-status/${paymentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Falha ao verificar status do pagamento');
  }

  return response.json();
}
