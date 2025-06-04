// app/meus_ingressos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  Chip,
} from '@mui/material';
import {
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { getIdToken } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Event {
  event_id: string;
  name: string;
  event_status: string;
  imageUrl: string;
  start_date: string;
  order_id: string;
  ticket_id: string;
  total_amount: number;
  status: string;
  payment_id: string;
  payment_url: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface ApiResponse {
  events: Event[];
  pagination: PaginationInfo;
}

function getStatusColor(status: string):
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'default' {
  switch (status?.toUpperCase()) {
    case 'CONFIRMADO':
    case 'PAGO':
    case 'CONCLUÍDO':
    case 'PAID':
      return 'success';
    case 'PAGAMENTO PENDENTE':
    case 'PENDENTE':
    case 'PAYMENT_PENDING':
      return 'warning';
    case 'PAGAMENTO EM ANÁLISE':
    case 'EM ANÁLISE':
    case 'INFO_PENDING':
      return 'info';
    case 'CANCELADO':
      return 'error';
    case 'EXPIRADO':
    case 'DRAFT':
      return 'default';
    default:
      return 'default';
  }
}

const MeusIngressosPage = () => {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 0
  });
  
  // Filtering state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const router = useRouter();

  useEffect(() => {
    if (loadingAuth || errorAuth) {
      return;
    }

    if (!user) {
      router.push('/');
      return;
    }

    const fetchUserEvents = async () => {
      try {
        const token = await getIdToken(user);
        
        // Fetch events with pagination and filtering
        await loadUserEvents(user.uid, token, pagination.page, pagination.page_size, statusFilter);
      } catch (err) {
        setLoadError('Falha ao carregar ingressos.');
      }
    };

    fetchUserEvents();
  }, [user, loadingAuth, errorAuth, router, pagination.page, pagination.page_size, statusFilter]);

  const loadUserEvents = async (userId: string, token: string, page = 1, pageSize = 5, status = 'all') => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${userId}/events`, {
          params: {
            page,
            page_size: pageSize,
            status
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setEvents(response.data.events);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoadError('Erro ao carregar seus ingressos e inscrições.');
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleEventAction = (action: string, event: Event) => {
    switch (action) {
      case 'info':
        // Navigate to event details
        router.push(`/i/${event.ticket_id}`);
        break;
      case 'cancel':
        handleCancelOrder(event.order_id);
        break;
      case 'download':
        handleDownloadTicket(event.order_id);
        break;
      default:
        // Handle other actions
        break;
    }
  };

  const handleDownloadTicket = async (orderId: string) => {
    try {
      setLoading(true);
      const token = await getIdToken(user!);
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/orders/${orderId}/ticket`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );
      
      const blob = new Blob([response.data as BlobPart]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ticket-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setLoading(false);
      
    } catch (error) {
      console.error('Error downloading ticket:', error);
      setLoadError('Não foi possível baixar o ingresso. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setLoading(true);
      
      const token = await getIdToken(user!);
      
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Refresh events after cancellation
      await loadUserEvents(user!.uid, token, pagination.page, pagination.page_size, statusFilter);
      
      setPopupMessage('Pedido cancelado com sucesso!');
      setPopupOpen(true);
      setLoading(false);
      
    } catch (error) {
      console.error('Error canceling order:', error);
      setLoadError('Não foi possível cancelar o pedido. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
        {loadingAuth ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              {/* Page Title */}
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  fontWeight: 'bold',
                  textAlign: { xs: 'center', md: 'left' },
                  color: 'primary.main',
                }}
              >
                Meus Ingressos e Inscrições
              </Typography>

              {/* Events List */}
              {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
                  <CircularProgress />
                  <Typography color="text.secondary">
                    Carregando seus eventos...
                  </Typography>
                </Box>
              ) : events.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {events.map((event) => (
                    <Card
                      key={event.event_id}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15), 0 -2px 0 rgba(255, 255, 255, 0.2) inset, 0 2px 0 rgba(0, 0, 0, 0.1) inset',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        border: '1px dashed #1976d2',
                        position: 'relative',
                        transform: 'perspective(1000px) rotateX(2deg)',
                        transformOrigin: 'center bottom',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'perspective(1000px) rotateX(0deg) translateY(-5px)',
                          boxShadow: '0 20px 30px rgba(25, 118, 210, 0.25), 0 -2px 0 rgba(255, 255, 255, 0.2) inset, 0 2px 0 rgba(0, 0, 0, 0.1) inset',
                        },
                        '&:before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '-10px',
                          height: '20px',
                          width: '20px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '50%',
                          transform: 'translateY(-50%)',
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)',
                          display: { xs: 'none', sm: 'block' },
                          zIndex: 1
                        },
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          right: '-10px',
                          height: '20px',
                          width: '20px',
                          backgroundColor: '#f5f5f5',
                          borderRadius: '50%',
                          transform: 'translateY(-50%)',
                          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)',
                          display: { xs: 'none', sm: 'block' },
                          zIndex: 1
                        }
                      }}
                    >
                      {/* Left side - Event Info */}
                      <Box
                        sx={{
                          width: { xs: '100%', sm: '70%' },
                          p: { xs: 2, sm: 3 },
                          borderRight: { xs: 'none', sm: '1px dashed #1976d2' },
                          borderBottom: { xs: '1px dashed #1976d2', sm: 'none' },
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          backgroundColor: 'rgba(25, 118, 210, 0.03)'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                              color: 'white',
                              fontWeight: 'bold',
                              boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
                            }}
                          >
                            {event.name.charAt(0).toUpperCase()}
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 'bold',
                              fontSize: { xs: '1.1rem', md: '1.3rem' },
                              color: '#1976d2'
                            }}
                          >
                            {event.name}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <strong>Data:</strong> {event.start_date ? new Date(event.start_date).toLocaleDateString('pt-BR') : 'Data não definida'}
                          </Typography>
                          
                          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <strong>Ticket:</strong> {event.ticket_id || 'N/A'}
                          </Typography>
                          
                          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <strong>Valor:</strong> {event.total_amount ? `R$ ${event.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                          </Typography>
                        </Box>
                        
                        <Chip
                          label={event.status}
                          color={getStatusColor(event.status)}
                          variant="filled"
                          size="medium"
                          sx={{ 
                            alignSelf: 'flex-start', 
                            fontWeight: 'bold', 
                            textTransform: 'uppercase',
                            mb: 2
                          }}
                        />
                      </Box>
                      
                      {/* Right side - Actions */}
                      <Box
                        sx={{
                          width: { xs: '100%', sm: '30%' },
                          p: { xs: 2, sm: 3 },
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 2,
                          backgroundColor: 'white'
                        }}
                      >
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<InfoIcon />}
                          onClick={() => handleEventAction('info', event)}
                          sx={{
                            py: 1.5,
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                          }}
                        >
                          Detalhes
                        </Button>
                        
                        {(event.status === 'PAYMENT_PENDING' || event.status === 'INFO_PENDING') && (
                          <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            onClick={() => window.location.href = event.payment_url}
                            sx={{
                              py: 1.5,
                              fontWeight: 'bold',
                              borderRadius: '8px',
                            }}
                          >
                            Continuar Compra
                          </Button>
                        )}
                        
                        {event.status === 'PAID' && (
                          <Button
                            fullWidth
                            variant="outlined"
                            color="success"
                            onClick={() => handleDownloadTicket(event.order_id)}
                            sx={{
                              py: 1.5,
                              fontWeight: 'bold',
                              borderRadius: '8px',
                            }}
                          >
                            Download Ingresso
                          </Button>
                        )}
                        
                        {event.status === 'DRAFT' && (
                          <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            onClick={() => handleCancelOrder(event.order_id)}
                            sx={{
                              py: 1.5,
                              fontWeight: 'bold',
                              borderRadius: '8px',
                            }}
                          >
                            Cancelar
                          </Button>
                        )}
                      </Box>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography
                  sx={{
                    textAlign: 'center',
                    py: 4,
                  }}
                >
                  Nenhum evento encontrado.
                </Typography>
              )}
              {/* Pagination Controls */}
              {pagination.total_pages > 1 && (
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Mostrando {((pagination.page - 1) * pagination.page_size) + 1} a {Math.min(pagination.page * pagination.page_size, pagination.total)} de {pagination.total} resultados
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                      disabled={pagination.page === 1}
                      sx={{ minWidth: '40px', mr: 1 }}
                    >
                      &lt;
                    </Button>
                    
                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={pagination.page === page ? "contained" : "outlined"}
                        size="small"
                        onClick={() => handlePageChange(page)}
                        sx={{ minWidth: '40px', mx: 0.5 }}
                      >
                        {page}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handlePageChange(Math.min(pagination.total_pages, pagination.page + 1))}
                      disabled={pagination.page === pagination.total_pages}
                      sx={{ minWidth: '40px', ml: 1 }}
                    >
                      &gt;
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
            
            {/* Error Notification */}
            {loadError && (
              <Snackbar
                open={!!loadError}
                autoHideDuration={4000}
                onClose={() => setLoadError(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              >
                <Alert onClose={() => setLoadError(null)} severity="error">
                  {loadError}
                </Alert>
              </Snackbar>
            )}

            {/* Popup Message */}
            <Snackbar
              open={popupOpen}
              autoHideDuration={6000}
              onClose={() => setPopupOpen(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert onClose={() => setPopupOpen(false)} severity="success">
                {popupMessage}
              </Alert>
            </Snackbar>
          </>
        )}
      </Card>
    </Box>
  );
};

export default MeusIngressosPage;