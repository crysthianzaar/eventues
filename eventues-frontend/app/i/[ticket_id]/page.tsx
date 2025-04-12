'use client';

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Stack,
} from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebase';
import { getIdToken } from 'firebase/auth';
import axios from 'axios';
import QRCode from 'react-qr-code';
import HomeIcon from '@mui/icons-material/Home';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';

interface TicketDetails {
  order_id: string;
  event_id: string;
  event_type: string;
  event_name: string;
  event_date: string;
  event_location: string | null;
  user_id: string;
  ticket_name: string | null;
  ticket_value: number | null;
  quantity: number | null;
  total_value: number;
  payment_datails: {
    transactionReceiptUrl: string | null;
    custody: string | null;
    postalService: boolean;
    originalDueDate: string;
    pixTransaction: string | null;
    object: string;
    status: string;
    nossoNumero: string | null;
    invoiceNumber: string;
    creditDate: string | null;
    paymentDate: string | null;
    pixQrCode: {
      success: boolean;
      expirationDate: string;
      encodedImage: string;
      payload: string;
    };
    customer: string;
    externalReference: string | null;
    interestValue: number | null;
    clientPaymentDate: string | null;
    billingType: string;
    deleted: boolean;
    description: string;
    anticipated: boolean;
    estimatedCreditDate: string | null;
    id: string;
    discount: {
      value: number;
      type: string;
      limitDate: string | null;
      dueDateLimitDays: number;
    };
    anticipable: boolean;
    bankSlipUrl: string | null;
    value: number;
    escrow: string | null;
    netValue: number;
    paymentLink: string | null;
    interest: {
      value: number;
      type: string;
    };
    refunds: string | null;
    dueDate: string;
    lastBankSlipViewedDate: string | null;
    installmentNumber: string | null;
    lastInvoiceViewedDate: string | null;
    invoiceUrl: string;
    fine: {
      value: number;
      type: string;
    };
    dateCreated: string;
    originalValue: number | null;
  };
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

interface ApiResponse extends TicketDetails { }

export default function TicketPage() {
  const [user] = useAuthState(auth);
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ticketDetails?.event_name,
          text: `Minha inscrição para ${ticketDetails?.event_name}`,
          url: window.location.href,
        });
      } catch (error) {
        // Ignore share errors
      }
    }
  };

  useEffect(() => {
    const fetchTicketDetails = async () => {
      setLoading(true);
      setUnauthorized(false);
      setError(null);

      if (!user) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

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

        if (String(response.data.user_id).trim() !== String(user.uid).trim()) {
          setUnauthorized(true);
          setTicketDetails(null);
        } else {
          setTicketDetails(response.data);
        }
      } catch (err) {
        setError('Falha ao carregar detalhes do ingresso');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [user, params.ticket_id]);

  // Mostrar loading enquanto carrega ou enquanto user não está definido
  if (loading || !user) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 2 
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary">
          Carregando detalhes do ingresso...
        </Typography>
      </Box>
    );
  }

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



  if (unauthorized) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          gap: 2,
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Página Indisponível
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ maxWidth: 400, mb: 2 }}>
          Você não tem permissão para visualizar este ingresso. Apenas o comprador pode acessar estas informações.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/minha_conta')}
        >
          Ir para Minhas Inscrições
        </Button>
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              mb: 3,
              '& .MuiButton-root': {
                flex: { xs: '1', sm: '0 auto' },
                minWidth: { sm: '160px' }
              }
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              startIcon={<HomeIcon />}
              onClick={() => router.push('/minha_conta')}
              fullWidth
            >
              Minhas Inscrições
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              fullWidth
            >
              Imprimir
            </Button>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                fullWidth
              >
                Compartilhar
              </Button>
            )}
          </Stack>
          <Card sx={{ padding: 3, marginBottom: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Typography variant="h4" gutterBottom>
                Detalhes do Ingresso
              </Typography>
              <Chip
                label={ticketDetails.status === 'completed' ? 'Confirmado' : ticketDetails.status}
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
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    '@media print': {
                      pageBreakInside: 'avoid',
                    },
                  }}
                >
                  <QRCode value={ticketDetails.order_id} size={128} />
                  <Typography variant="caption" align="center">
                    Código do Ingresso: {ticketDetails.order_id}
                  </Typography>
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
                    R$ {ticketDetails?.total_value?.toFixed(2) ?? '0.00'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ marginY: 2 }} />

            <Typography variant="h6" gutterBottom>
              Informações do Pagamento
            </Typography>
            <Grid container spacing={2}>
              {ticketDetails.payment_datails && (
                <>
                  {ticketDetails.payment_datails.billingType === 'PIX' && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                            Pagamento via PIX
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {ticketDetails.payment_datails.description}
                          </Typography>

                          <Box sx={{ my: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ticketDetails.payment_datails.value)}
                            </Typography>
                            
                            {ticketDetails.payment_datails.pixQrCode?.expirationDate && (
                              <Typography variant="caption" color="error">
                                Expira em: {new Date(ticketDetails.payment_datails.pixQrCode.expirationDate).toLocaleString('pt-BR')}
                              </Typography>
                            )}
                          </Box>

                          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            {ticketDetails.payment_datails.pixQrCode?.encodedImage && (
                              <img
                                src={`data:image/png;base64,${ticketDetails.payment_datails.pixQrCode.encodedImage}`}
                                alt="PIX QR Code"
                                style={{ maxWidth: 200, marginBottom: 16 }}
                              />
                            )}
                            <Button
                              variant="contained"
                              onClick={() =>
                                ticketDetails.payment_datails.pixQrCode?.payload &&
                                navigator.clipboard.writeText(ticketDetails.payment_datails.pixQrCode.payload)
                              }
                              sx={{ mb: 1, width: '100%', maxWidth: 400 }}
                            >
                              Copiar código PIX
                            </Button>
                            {ticketDetails.payment_datails.invoiceUrl && (
                              <Button
                                variant="outlined"
                                href={ticketDetails.payment_datails.invoiceUrl}
                                target="_blank"
                                sx={{ width: '100%', maxWidth: 400 }}
                              >
                                Ver comprovante
                              </Button>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  )}

                  {ticketDetails.payment_datails.billingType === 'BOLETO' && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Pagamento via Boleto
                          </Typography>
                          {ticketDetails.payment_datails.bankSlipUrl && (
                            <Button
                              variant="contained"
                              href={ticketDetails.payment_datails.bankSlipUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ mt: 1 }}
                            >
                              Visualizar Boleto
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  )}

                  {ticketDetails.payment_datails.billingType === 'CREDIT_CARD' && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Pagamento via Cartão de Crédito
                          </Typography>
                          {ticketDetails.payment_datails.status === 'CONFIRMED' &&
                            ticketDetails.payment_datails.transactionReceiptUrl && (
                              <Button
                                variant="outlined"
                                href={ticketDetails.payment_datails.transactionReceiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ mt: 1 }}
                              >
                                Visualizar Recibo
                              </Button>
                            )}
                        </Box>
                      </Paper>
                    </Grid>
                  )}
                </>
              )}
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
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => (window.location.href = ticketDetails.payment_url)}
                >
                  Finalizar Pagamento
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => router.push('/minha_conta')}
                >
                  Ver Minhas Inscrições
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .MuiCard-root, .MuiCard-root * {
            visibility: visible;
          }
          .MuiCard-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
}
