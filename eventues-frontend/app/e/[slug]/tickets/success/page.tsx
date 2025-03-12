'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const theme = useTheme();
  const params = useParams();
  const searchParams = useSearchParams();
  const { slug } = params;
  const orderId = searchParams.get('order');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (response.ok) {
          setOrder(data);
        } else {
          setError(data.error || 'Erro ao carregar pedido');
        }
      } catch (error) {
        setError('Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h4" gutterBottom>
          Pedido Realizado!
        </Typography>
        
        <Typography color="text.secondary" paragraph>
          Seu pedido foi realizado com sucesso. Você receberá um email com os detalhes da compra.
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Número do Pedido
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            {orderId}
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Link href={`/e/${slug}`} passHref>
            <Button variant="outlined" sx={{ mr: 2 }}>
              Voltar para o Evento
            </Button>
          </Link>
          <Link href="/meus-ingressos" passHref>
            <Button variant="contained">
              Meus Ingressos
            </Button>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
}
