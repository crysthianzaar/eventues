// pages/minha_conta/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  Grid,
  CardContent,
  CardActions,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { getIdToken } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import LoadingOverlay from '../components/LoadingOverlay';

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

interface UserInfo {
  name: string;
  email: string;
  birth_date: string; // Data formatada
  phone_number: string;
  cpf: string;
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
      return 'success';
    case 'PAGAMENTO PENDENTE':
    case 'PENDENTE':
      return 'warning';
    case 'PAGAMENTO EM ANÁLISE':
    case 'EM ANÁLISE':
      return 'info';
    case 'CANCELADO':
      return 'error';
    case 'EXPIRADO':
      return 'default';
    default:
      return 'default';
  }
}

const MinhaContaPage = () => {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    cpf: '',
    email: '',
    birth_date: '-',
    phone_number: '-',
  });
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

    const fetchUserInfo = async () => {
      try {
        const token = await getIdToken(user);
        
        // Fetch user data
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${user.uid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { name, email, birth_date, phone_number, cpf } = response.data as UserInfo;

        setUserInfo({
          name: name || 'Usuário',
          cpf: cpf || '-',
          email: email || '-',
          birth_date: birth_date || '-',
          phone_number: phone_number || '-',
        });
        
        // Fetch events with pagination and filtering
        await fetchUserEvents(user.uid, token, pagination.page, pagination.page_size, statusFilter);
      } catch (err) {
        setLoadError('Falha ao carregar informações da conta.');
      }
    };

    fetchUserInfo();
  }, [user, loadingAuth, errorAuth, router, pagination.page, pagination.page_size, statusFilter]);

  const fetchUserEvents = async (userId: string, token: string, page = 1, pageSize = 5, status = 'all') => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${userId}/events`, {
          params: {
            page,
            page_size: pageSize,
            status,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update both events and pagination information
      setEvents(response.data.events);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      setLoadError('Falha ao carregar eventos.');
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleEditProfile = () => {
    router.push('/configurar_perfil');
  };

  const handleEventAction = (action: string, event: Event) => {
    switch (action) {
      case 'info':
        router.push(`/i/${event.order_id}`);
        break;
      case 'resend':
        // Redirecionar para a URL de pagamento se ainda estiver pendente
        if (event.event_status === 'Inscrito' && event.payment_url) {
          window.location.href = event.payment_url;
        } else {
          setPopupMessage('Não é possível reenviar confirmação para este pedido.');
          setPopupOpen(true);
        }
        break;
      case 'cancel':
        const { canCancel, message } = canCancelRegistration(event);
        if (canCancel) {
          cancelRegistration(event.order_id);
        } else {
          setPopupMessage(message || 'Não é possível cancelar a inscrição.');
          setPopupOpen(true);
        }
        break;
      default:
        break;
    }
  };

  const handleDownloadTicket = async (orderId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = await getIdToken(user);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tickets/${orderId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob' // Important for handling file downloads
        }
      );
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ingresso-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setLoading(false);
    } catch (err) {
      console.error('Error downloading ticket:', err);
      setPopupMessage('Falha ao baixar o ingresso. Tente novamente mais tarde.');
      setPopupOpen(true);
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = await getIdToken(user);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the event status locally
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.order_id === orderId ? { ...event, status: 'CANCELLED' } : event
          )
        );
        
        setPopupMessage('Pedido cancelado com sucesso.');
        setPopupOpen(true);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error cancelling order:', err);
      setPopupMessage('Falha ao cancelar o pedido. Tente novamente mais tarde.');
      setPopupOpen(true);
      setLoading(false);
    }
  };

  const canCancelRegistration = (event: Event): { canCancel: boolean; message?: string } => {
    const today = new Date();
    const eventDate = new Date(event.start_date);

    // Verificar se o evento já foi concluído
    if (event.event_status === 'Concluído' || event.event_status === 'Cancelado') {
      return { canCancel: false, message: 'Não é possível cancelar, o pedido já foi finalizado.' };
    }

    // Calcular dias restantes até a data do evento
    const timeDiffEvent = eventDate.getTime() - today.getTime();
    const daysUntilEvent = Math.ceil(timeDiffEvent / (1000 * 3600 * 24));

    if (daysUntilEvent < 3) {
      return { canCancel: false, message: 'Não é possível cancelar, faltam menos de 3 dias para o evento.' };
    }
    // Cancelamento permitido
    return { canCancel: true };
  };

  const cancelRegistration = async (orderId: string) => {
    if (!user) return;

    try {
      const token = await getIdToken(user);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setPopupMessage('Inscrição cancelada com sucesso.');
        setPopupOpen(true);
        // Atualizar a lista de eventos
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.order_id === orderId ? { ...event, event_status: 'Cancelado' } : event
          )
        );
      } else {
        setPopupMessage('Falha ao cancelar a inscrição.');
        setPopupOpen(true);
      }
    } catch (err) {
      setPopupMessage('Erro ao cancelar a inscrição.');
      setPopupOpen(true);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: { xs: 'flex-start', md: 'center' },
        padding: { xs: '0', md: '40px' },
        backgroundImage: { xs: 'none', md: 'url("/banner_template.png")' },
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: { xs: '#f5f5f5', md: 'transparent' },
      }}
    >
      <Card
        sx={{
          maxWidth: '800px',
          width: '100%',
          padding: { xs: '15px', md: '40px' },
          boxShadow: { xs: 'none', md: '0 4px 12px rgba(0, 0, 0, 0.15)' },
          borderRadius: { xs: 0, md: '16px' },
          backgroundColor: '#ffffff',
          position: 'relative',
          minHeight: { xs: '100vh', md: 'auto' },
        }}
      >
        {loadingAuth ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : errorAuth || loadError ? (
          <Typography color="error" sx={{ textAlign: 'center' }}>
            {errorAuth?.message || loadError}
          </Typography>
        ) : (
          <>
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: { xs: '20px', md: '40px' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 0 },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  color: '#2c2c2c',
                }}
              >
                Minha Conta
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditProfile}
                sx={{
                  width: { xs: '100%', md: 'auto' },
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                }}
              >
                EDITAR PERFIL
              </Button>
            </Box>

            {/* User Info */}
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'center', md: 'flex-start' },
                marginBottom: { xs: '30px', md: '50px' },
                flexDirection: { xs: 'column', md: 'row' },
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Avatar
                src={user?.photoURL || ''}
                alt="Foto de perfil"
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  marginRight: { md: '40px', xs: '0' },
                  marginBottom: { xs: '15px', md: '0' },
                  bgcolor: '#e0e0e0',
                  fontSize: '2.5rem',
                }}
              >
                {userInfo.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1, width: { xs: '100%', md: 'auto' } }}>
                <Typography
                  variant="h6"
                  sx={{
                    marginBottom: '16px',
                    fontSize: { xs: '1.25rem', md: '1.5rem' },
                    fontWeight: '500',
                    color: '#2c2c2c',
                  }}
                >
                  {userInfo.name}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Typography variant="body1" sx={{ color: 'text.secondary', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: '4px', md: '8px' } }}>
                    <strong style={{ color: '#2c2c2c' }}>E-mail:</strong> {userInfo.email}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: '4px', md: '8px' } }}>
                    <strong style={{ color: '#2c2c2c' }}>Data de Nascimento:</strong> {new Date(new Date(userInfo.birth_date).setDate(new Date(userInfo.birth_date).getDate() + 1)).toLocaleDateString('pt-BR')}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: '4px', md: '8px' } }}>
                    <strong style={{ color: '#2c2c2c' }}>Telefone:</strong> {userInfo.phone_number}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: '4px', md: '8px' } }}>
                    <strong style={{ color: '#2c2c2c' }}>CPF:</strong> {userInfo.cpf}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Popup Message */}
            <Snackbar
              open={popupOpen}
              autoHideDuration={6000}
              onClose={() => setPopupOpen(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
              <Alert onClose={() => setPopupOpen(false)} severity="warning">
                {popupMessage}
              </Alert>
            </Snackbar>
          </>
        )}
      </Card>
    </Box>
  );
};

export default MinhaContaPage;
