import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Dialog,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../../../firebase';

interface PaymentComponentProps {
  eventId: string;
  ticketId: string;
  quantity: number;
  customerData: {
    name: string;
    email: string;
    cpf: string;
  };
  ticketData: {
    price: number;
    name: string;
  };
  onPaymentSuccess: (orderId: string) => void;
  onPaymentError: (error: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://obc5v0hl83.execute-api.sa-east-1.amazonaws.com';

const formatPrice = (price: number) => {
  return `R$ ${price.toFixed(2)}`;
};

export default function PaymentComponent({
  eventId,
  ticketId,
  quantity,
  customerData,
  ticketData,
  onPaymentSuccess,
  onPaymentError
}: PaymentComponentProps) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'boleto' | 'credit_card' | 'debit_card'>('pix');
  const [error, setError] = useState<string | null>(null);
  const [user] = useAuthState(auth);

  const handleSubmit = async () => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      setLoading(true);
      setError(null);

      const token = await user.getIdToken();

      const response = await fetch(`${API_BASE_URL}/create_payment_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          event_id: eventId,
          ticket_id: ticketId,
          quantity: quantity,
          ticket_name: ticketData.name,
          ticket_price: ticketData.price,
          name: customerData.name,
          email: customerData.email,
          cpf: customerData.cpf,
          user_id: user.uid,
          success_url: null,
          payment: {
            method: paymentMethod,
            billing_type: paymentMethod === 'credit_card' ? 'CREDIT_CARD' : 
                         paymentMethod === 'debit_card' ? 'DEBIT_CARD' :
                         paymentMethod === 'pix' ? 'PIX' : 'BOLETO'
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pagamento');
      }

      // Redireciona para a URL de checkout do ASAAS
      const paymentUrl = data.payment_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error('URL de pagamento não encontrada');
      }

    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar pagamento';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
          Resumo do Pedido
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>{ticketData.name}</Typography>
            <Typography>{formatPrice(ticketData.price)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Quantidade</Typography>
            <Typography>{quantity}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{formatPrice(ticketData.price * quantity)}</Typography>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? undefined : <PaymentIcon />}
          sx={{ minWidth: 200 }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            `Pagar ${formatPrice(ticketData.price * quantity)}`
          )}
        </Button>
      </Box>
    </Box>
  );
}
