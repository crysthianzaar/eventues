'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Grid,
  Divider,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebase';
import { getIdToken } from 'firebase/auth';
import axios from 'axios';
import QRCode from 'react-qr-code';

interface TicketDetails {
  order_id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  event_location: string;
  ticket_name: string;
  ticket_value: number;
  quantity: number;
  total_value: number;
  status: string;
  created_at: string;
  payment_url: string;
  participant_info: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
  };
}

interface ApiResponse {
  order_id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  event_location: string;
  ticket_name: string;
  ticket_value: number;
  quantity: number;
  total_value: number;
  status: string;
  created_at: string;
  payment_url: string;
  participant_info: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
  };
}

export default function TicketPage() {
  const [user] = useAuthState(auth);
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!user) return;

      try {
        const token = await getIdToken(user);
        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tickets/${params.ticket_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTicketDetails(response.data);
      } catch (err) {
        setError('Falha ao carregar detalhes do ingresso');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [user, params.ticket_id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !ticketDetails) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography color="error">{error || 'Ingresso não encontrado'}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        padding: { xs: '20px', md: '40px' },
        backgroundColor: '#f5f5f5',
      }}
    >
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Card sx={{ padding: 3, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Typography variant="h4" gutterBottom>
                Detalhes do Ingresso
              </Typography>
              <Chip
                label={ticketDetails.status}
                color={getStatusColor(ticketDetails.status)}
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>

            <Divider sx={{ marginY: 2 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  {ticketDetails.event_name}
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  {ticketDetails.event_location}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Data do Evento:</strong> {formatDate(ticketDetails.event_date)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                  <QRCode value={ticketDetails.order_id} size={128} />
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ marginY: 2 }} />

            <Typography variant="h6" gutterBottom>
              Informações do Pedido
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Protocolo
                  </Typography>
                  <Typography variant="body1">{ticketDetails.order_id}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Data da Compra
                  </Typography>
                  <Typography variant="body1">{formatDate(ticketDetails.created_at)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tipo de Ingresso
                  </Typography>
                  <Typography variant="body1">{ticketDetails.ticket_name}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Quantidade
                  </Typography>
                  <Typography variant="body1">{ticketDetails.quantity}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Valor Total
                  </Typography>
                  <Typography variant="h6" color="primary">
                    R$ {ticketDetails.total_value.toFixed(2)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ marginY: 2 }} />

            <Typography variant="h6" gutterBottom>
              Informações do Participante
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Nome
                  </Typography>
                  <Typography variant="body1">{ticketDetails.participant_info.name}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    E-mail
                  </Typography>
                  <Typography variant="body1">{ticketDetails.participant_info.email}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    CPF
                  </Typography>
                  <Typography variant="body1">{ticketDetails.participant_info.cpf}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Telefone
                  </Typography>
                  <Typography variant="body1">{ticketDetails.participant_info.phone}</Typography>
                </Paper>
              </Grid>
            </Grid>

            {ticketDetails.status === 'pending' && ticketDetails.payment_url && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => window.location.href = ticketDetails.payment_url}
                >
                  Finalizar Pagamento
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
