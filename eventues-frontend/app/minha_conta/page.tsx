// pages/minha_conta/page.tsx
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
  Grid,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
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
  start_date: string; // Data formatada
  dateObj: Date; // Data do evento como objeto Date
  registrationDate: Date; // Data de inscrição como objeto Date
  location: string;
}

interface UserInfo {
  name: string;
  email: string;
  birth_date: string; // Data formatada
  phone_number: string;
}

const MinhaContaPage = () => {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    birth_date: '-', // Inicializado com '-'
    phone_number: '-', // Inicializado com '-'
  });
  const [events, setEvents] = useState<Event[]>([]); // Lista de eventos
  const [loadError, setLoadError] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user) {
        try {
          const token = await getIdToken(user);
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${user.uid}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

            const { name, email, birth_date, phone_number } = response.data as UserInfo;

          setUserInfo({
            name: name || 'Atleta',
            email: email || '-',
            birth_date: birth_date || '-',
            phone_number: phone_number || '-',
          });

          // Temporariamente mantendo os eventos como dados mockados
          setEvents([
            {
              event_id: '1',
              name: 'Evento de Ciclismo',
              event_status: 'Concluído',
              imageUrl:
                'https://cdn.ticketsports.com.br/ticketagora/images/thumb/483WWR31GJPW13HS9PEVE18NGD17U0CVUJ1NMRTOUOGKFBUW4H.png',
              start_date: '15 de Outubro de 2024',
              dateObj: new Date('2024-10-15'),
              registrationDate: new Date('2024-10-05'),
              location: 'São Paulo, SP',
            },
            {
              event_id: '2',
              name: 'Corrida 10K',
              event_status: 'Inscrito',
              imageUrl:
                'https://cdn.ticketsports.com.br/ticketagora/images/7R80BOJT9CNC85MFPNY1I8HZD8PVWQNL2CWLU9O2IE811M3WJM.png',
              start_date: '22 de Outubro de 2024',
              dateObj: new Date('2024-10-22'),
              registrationDate: new Date('2024-10-01'),
              location: 'Rio de Janeiro, RJ',
            },
            // Você pode adicionar mais eventos mockados conforme necessário
          ]);

          // Caso o endpoint de eventos esteja pronto no futuro, descomente a linha abaixo
          // fetchUserEvents(user.uid, token);
        } catch (err) {
          setLoadError('Falha ao carregar informações da conta.');
        }
      }
    };

    // Função para buscar eventos do usuário via backend (temporariamente comentada)
    /*
    const fetchUserEvents = async (userId: string, token: string) => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/users/${userId}/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEvents((response.data as { events: Event[] }).events);
      } catch (err) {
        setLoadError('Falha ao carregar eventos.');
      }
    };
    */

    fetchUserInfo();
  }, [user]);

  const handleEditProfile = () => {
    router.push('/configurar_perfil');
  };

  const canCancelRegistration = (event: Event): { canCancel: boolean; message?: string } => {
    const today = new Date();

    // Verificar se o evento já foi concluído
    if (event.event_status === 'Concluído') {
      return { canCancel: false, message: 'Não é possível cancelar, o evento já foi realizado.' };
    }

    // Calcular dias restantes até a data do evento
    const timeDiffEvent = event.dateObj.getTime() - today.getTime();
    const daysUntilEvent = Math.ceil(timeDiffEvent / (1000 * 3600 * 24));

    if (daysUntilEvent < 3) {
      return { canCancel: false, message: 'Não é possível cancelar, faltam menos de 3 dias para o evento.' };
    }

    // Calcular dias desde a data de inscrição
    const timeDiffRegistration = today.getTime() - event.registrationDate.getTime();
    const daysSinceRegistration = Math.ceil(timeDiffRegistration / (1000 * 3600 * 24));

    if (daysSinceRegistration > 7) {
      return { canCancel: false, message: 'Não é possível cancelar, a inscrição foi realizada há mais de 7 dias.' };
    }

    // Cancelamento permitido
    return { canCancel: true };
  };

  const handleEventAction = (action: string, event: Event) => {
    switch (action) {
      case 'info':
        router.push(`/evento/${event.event_id}`);
        break;
      case 'resend':
        // Lógica para reenviar confirmação
        alert('Confirmação reenviada!');
        break;
      case 'view':
        // Lógica para visualizar protocolo
        alert('Protocolo exibido!');
        break;
      case 'cancel':
        const { canCancel, message } = canCancelRegistration(event);
        if (canCancel) {
          // Lógica para cancelar inscrição
          // Implementar a lógica real de cancelamento via API
          cancelRegistration(event.event_id);
        } else {
          // Exibir popup com a mensagem
          setPopupMessage(message || 'Não é possível cancelar a inscrição.');
          setPopupOpen(true);
        }
        break;
      default:
        break;
    }
  };

  const cancelRegistration = async (eventId: string) => {
    try {
      const token = await getIdToken(user!);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/events/${eventId}/cancel`,
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
            event.event_id === eventId ? { ...event, event_status: 'Cancelado' } : event
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
        alignItems: 'center',
        padding: { xs: '20px', md: '40px' },
        backgroundImage: 'url("/cycling.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Card
        sx={{
          maxWidth: '800px',
          width: '100%',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          position: 'relative',
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
                alignItems: 'center',
                marginBottom: '30px',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Minha Conta
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditProfile}
              >
                Editar Perfil
              </Button>
            </Box>

            {/* User Info */}
            <Box
              sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
              flexDirection: { xs: 'column', md: 'row' },
              }}
            >
              <Avatar
              src={user?.photoURL || ''}
              alt="Foto de perfil"
              sx={{
                width: 120,
                height: 120,
                marginRight: { md: '30px', xs: '0' },
                marginBottom: { xs: '20px', md: '0' },
              }}
              />
              <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ marginBottom: '10px' }}>
                {userInfo.name}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                <strong>E-mail:</strong> {userInfo.email}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                <strong>Data de Nascimento:</strong> {new Date(new Date(userInfo.birth_date).setDate(new Date(userInfo.birth_date).getDate() + 1)).toLocaleDateString('pt-BR')}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                <strong>Telefone:</strong> {userInfo.phone_number}
              </Typography>
              </Box>
            </Box>

            {/* Events List */}
            <Typography variant="h6" sx={{ marginBottom: '20px', fontWeight: 'bold' }}>
              Meus Eventos
            </Typography>
            {events.length > 0 ? (
              <Grid container spacing={3}>
                {events.map((event) => (
                  <Grid item xs={12} sm={6} key={event.event_id}>
                    <Card
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        height: '100%',
                        position: 'relative',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={event.imageUrl}
                        alt={event.name}
                        sx={{ height: 180 }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {event.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Data:</strong> {event.start_date}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Local:</strong> {event.location}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            marginTop: '10px',
                            color:
                              event.event_status === 'Concluído' ? 'green' : 'orange',
                          }}
                        >
                          <strong>Status:</strong> {event.event_status}
                        </Typography>
                      </CardContent>
                      <CardActions
                        sx={{
                          justifyContent: 'flex-start',
                          paddingBottom: '16px',
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <Button
                          startIcon={<InfoIcon />}
                          onClick={() => handleEventAction('info', event)}
                        >
                          Informações
                        </Button>
                        <Button
                          startIcon={<RefreshIcon />}
                          onClick={() => handleEventAction('resend', event)}
                        >
                          Reenviar Confirmação
                        </Button>
                        <Button
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleEventAction('view', event)}
                        >
                          Visualizar Protocolo
                        </Button>
                        <Button
                          startIcon={<CancelIcon />}
                          color="error"
                          onClick={() => handleEventAction('cancel', event)}
                        >
                          Cancelar Pedido
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>Nenhum evento encontrado.</Typography>
            )}

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
