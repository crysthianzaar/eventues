'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://obc5v0hl83.execute-api.sa-east-1.amazonaws.com';

interface PaymentDetails {
  payment_id: string;
  status: string;
  value: number;
  billingType: string;
  event_id: string;
  event_slug: string;
  description: string;
  created_at: string;
  paid_at?: string;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatPrice = (price: number) => {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { color: string; label: string; icon: JSX.Element }> = {
    CONFIRMED: {
      color: 'success.main',
      label: 'Pagamento Confirmado',
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
    },
    PENDING: {
      color: 'warning.main',
      label: 'Aguardando Pagamento',
      icon: <PendingIcon sx={{ fontSize: 40 }} />,
    },
    FAILED: {
      color: 'error.main',
      label: 'Pagamento Falhou',
      icon: <ErrorIcon sx={{ fontSize: 40 }} />,
    },
  };

  return statusMap[status] || {
    color: 'text.secondary',
    label: 'Status Desconhecido',
    icon: <ErrorIcon sx={{ fontSize: 40 }} />,
  };
};

export default function PaymentStatusPage() {
  const params = useParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/payment/${params.payment_id}`);
        if (!response.ok) {
          throw new Error('Falha ao carregar detalhes do pagamento');
        }
        const data = await response.json();
        setPaymentDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    if (params.payment_id) {
      fetchPaymentDetails();
    }
  }, [params.payment_id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!paymentDetails) {
    return (
      <Box p={3}>
        <Alert severity="error">Detalhes do pagamento não encontrados</Alert>
      </Box>
    );
  }

  const statusInfo = getStatusInfo(paymentDetails.status);

  return (
    <Box p={3} maxWidth={800} mx="auto">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Box sx={{ color: statusInfo.color }}>{statusInfo.icon}</Box>
          <Typography variant="h4" ml={2} color={statusInfo.color}>
            {statusInfo.label}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Detalhes do Pagamento
          </Typography>
          <Typography>Valor: {formatPrice(paymentDetails.value)}</Typography>
          <Typography>Método: {paymentDetails.billingType}</Typography>
          <Typography>Data da Compra: {formatDate(paymentDetails.created_at)}</Typography>
          {paymentDetails.paid_at && (
            <Typography>Data do Pagamento: {formatDate(paymentDetails.paid_at)}</Typography>
          )}
        </Box>

        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Detalhes do Pedido
          </Typography>
          <Typography>{paymentDetails.description}</Typography>
        </Box>

        <Box mt={4} display="flex" gap={2}>
          <Button
            variant="contained"
            color="primary"
            href={`/e/${paymentDetails.event_slug}/tickets`}
          >
            Voltar para Ingressos
          </Button>
          {paymentDetails.status === 'CONFIRMED' && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => window.print()}
            >
              Imprimir Comprovante
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
