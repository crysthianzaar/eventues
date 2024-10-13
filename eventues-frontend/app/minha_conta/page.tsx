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
import { auth } from '../../firebase'; // Ajuste o caminho conforme necessário
import { useRouter } from 'next/navigation';

interface Event {
  id: number;
  name: string;
  status: string;
  imageUrl: string;
  date: string; // Data formatada
  dateObj: Date; // Data do evento como objeto Date
  registrationDate: Date; // Data de inscrição como objeto Date
  location: string;
}

const MinhaContaPage = () => {
  const [user, loading, error] = useAuthState(auth);
  const [userInfo, setUserInfo] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    birthDate: '-', // Inicializado com '-'
    phoneNumber: '-', // Inicializado com '-'
    userType: 'Participante', // Tipo de usuário de exemplo
  });
  const [events, setEvents] = useState<Event[]>([]); // Lista de eventos
  const [loadError, setLoadError] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Carregar informações do usuário do Firebase ou do backend
      setUserInfo({
        displayName: user.displayName || 'Usuário',
        email: user.email || '-',
        photoURL: user.photoURL || '/default-profile.png',
        birthDate: '1990-01-01', // Data de nascimento pode vir de um banco de dados
        phoneNumber: '(27) 99999-9999', // Telefone pode vir de um banco de dados
        userType: 'Participante', // Tipo de usuário pode vir de um banco de dados
      });

      // Simular carregamento de eventos (pode vir de uma API)
      setEvents([
        {
          id: 1,
          name: 'Evento de Ciclismo',
          status: 'Concluído',
          imageUrl:
            'https://cdn.ticketsports.com.br/ticketagora/images/thumb/483WWR31GJPW13HS9PEVE18NGD17U0CVUJ1NMRTOUOGKFBUW4H.png',
          date: '15 de Outubro de 2024',
          dateObj: new Date('2024-10-15'),
          registrationDate: new Date('2024-10-05'),
          location: 'São Paulo, SP',
        },
        {
          id: 2,
          name: 'Corrida 10K',
          status: 'Inscrito',
          imageUrl:
            'https://cdn.ticketsports.com.br/ticketagora/images/7R80BOJT9CNC85MFPNY1I8HZD8PVWQNL2CWLU9O2IE811M3WJM.png',
          date: '22 de Outubro de 2024',
          dateObj: new Date('2024-10-22'),
          registrationDate: new Date('2024-10-01'),
          location: 'Rio de Janeiro, RJ',
        },
        // Você pode adicionar mais eventos conforme necessário
      ]);
    }
  }, [user]);

  const handleEditProfile = () => {
    router.push('/configurar_perfil');
  };

  const canCancelRegistration = (event: Event): { canCancel: boolean; message?: string } => {
    const today = new Date();

    // Verificar se o evento já foi concluído
    if (event.status === 'Concluído') {
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
    // Lidar com diferentes ações baseadas no parâmetro 'action'
    switch (action) {
      case 'info':
        router.push(`/evento/${event.id}`);
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
          // Aqui você deve implementar a lógica real de cancelamento
          alert('Inscrição cancelada com sucesso.');
          // Opcional: Atualizar o estado dos eventos ou fazer uma chamada para a API
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: { xs: '20px', md: '40px' },
        backgroundImage: 'url("/cycling.jpg")', // Imagem de fundo
        backgroundSize: 'cover', // Cobrir toda a área
        backgroundPosition: 'center', // Centralizar a imagem
        backgroundRepeat: 'no-repeat', // Não repetir a imagem
      }}
    >
      <Card
        sx={{
          maxWidth: '800px',
          width: '100%',
          padding: '30px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)', // Sombra mais forte
          borderRadius: '12px',
          backgroundColor: '#ffffff', // Fundo branco sólido para legibilidade
          position: 'relative',
        }}
      >
        {loading ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error || loadError ? (
          <Typography color="error" sx={{ textAlign: 'center' }}>
            {error?.message || loadError}
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
                src={userInfo.photoURL}
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
                  {userInfo.displayName}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  <strong>E-mail:</strong> {userInfo.email}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  <strong>Data de Nascimento:</strong> {userInfo.birthDate}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  <strong>Telefone:</strong> {userInfo.phoneNumber}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  <strong>Tipo de Usuário:</strong> {userInfo.userType}
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
                  <Grid item xs={12} sm={6} key={event.id}>
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
                          <strong>Data:</strong> {event.date}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Local:</strong> {event.location}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            marginTop: '10px',
                            color:
                              event.status === 'Concluído' ? 'green' : 'orange',
                          }}
                        >
                          <strong>Status:</strong> {event.status}
                        </Typography>
                      </CardContent>
                      <CardActions
                        sx={{
                          justifyContent: 'flex-start', // Alinhar na esquerda
                          paddingBottom: '16px',
                          flexWrap: 'wrap',
                          gap: '8px', // Espaçamento entre os botões
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
                  Falha ao carregar informações.
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
