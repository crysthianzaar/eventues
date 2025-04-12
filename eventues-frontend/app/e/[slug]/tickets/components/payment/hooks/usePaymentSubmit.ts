'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { PaymentFormData, PaymentResult, TicketData } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export function usePaymentSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  const submitPayment = async (
    formData: PaymentFormData,
    user: User,
    eventId: string,
    tickets: TicketData[]
  ) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      setLoading(true);
      setError(null);
      setPaymentResult(null);

      const token = await user.getIdToken();

      // Create customer
      const customerResponse = await fetch(`${API_BASE_URL}/create-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          cpfCnpj: formData.cpfCnpj,
          phone: formData.phone,
          postalCode: formData.postalCode,
        }),
      });

      if (!customerResponse.ok) {
        throw new Error('Falha ao criar cliente');
      }

      const customer = await customerResponse.json();

      // Handle credit card tokenization if needed
      let creditCardToken;
      if (formData.paymentMethod === 'CREDIT_CARD') {
        const [expiryMonth, expiryYear] = (formData.cardExpiry || '').split('/').map(s => s.trim());
        
        if (!expiryMonth || !expiryYear || 
            isNaN(Number(expiryMonth)) || isNaN(Number(expiryYear)) ||
            Number(expiryMonth) < 1 || Number(expiryMonth) > 12) {
          throw new Error('Data de expiração do cartão inválida. Use o formato MM/YY (ex: 12/25)');
        }

        const tokenResponse = await fetch(`${API_BASE_URL}/tokenize-card`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            customer: customer.id,
            creditCard: {
              holderName: formData.cardHolderName,
              number: formData.cardNumber?.replace(/\D/g, ''),
              expiryMonth,
              expiryYear: `20${expiryYear}`,
              ccv: formData.cardCvv,
            },
            creditCardHolderInfo: {
              name: formData.name,
              email: formData.email,
              cpfCnpj: formData.cpfCnpj,
              phone: formData.phone,
              postalCode: formData.postalCode,
              addressNumber: '0',
              addressComplement: '',
              mobilePhone: formData.phone || '',
            },
          }),
        });

        if (!tokenResponse.ok) {
          const responseData = await tokenResponse.json();
          throw new Error(responseData.error || 'Falha ao tokenizar cartão');
        }

        creditCardToken = await tokenResponse.json();
      }

      // Create payment session
      const totalAmount = tickets.reduce((total, ticket) => total + (ticket.price * ticket.quantity), 0);

      const paymentResponse = await fetch(`${API_BASE_URL}/create_payment_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer: customer.id,
          event_id: eventId,
          tickets: tickets.map(ticket => ({
            ticket_id: ticket.id,
            quantity: ticket.quantity
          })),
          user_id: user.uid,
          payment: {
            billingType: formData.paymentMethod,
            value: totalAmount,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            creditCard: creditCardToken ? {
              token: creditCardToken.creditCardToken,
              holderName: formData.cardHolderName,
              expiryMonth: formData.cardExpiry?.split('/')[0],
              expiryYear: formData.cardExpiry?.split('/')[1],
            } : undefined,
            credit_card_holder_info: creditCardToken ? {
              name: formData.name,
              email: formData.email,
              cpfCnpj: formData.cpfCnpj,
              postalCode: formData.postalCode,
              phone: formData.phone,
            } : undefined
          }
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Falha no pagamento');
      }

      const result = await paymentResponse.json();
      
      // For PIX payments, fetch QR code
      if (result.billingType === 'PIX' && result.id) {
        const qrCodeResponse = await fetch(`${API_BASE_URL}/pix-qrcode/${result.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (qrCodeResponse.ok) {
          const qrCodeData = await qrCodeResponse.json();
          result.encodedImage = qrCodeData.encodedImage;
          result.payload = qrCodeData.payload;
          result.expirationDate = qrCodeData.expirationDate;
        }
      }

      setPaymentResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar pagamento';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    paymentResult,
    submitPayment,
    setError,
    setPaymentResult
  };
}
