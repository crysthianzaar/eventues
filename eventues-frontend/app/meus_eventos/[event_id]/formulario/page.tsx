'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, CircularProgress, Alert } from '@mui/material';
import FormEditor from '../../../components/FormEditor';
import { useParams } from 'next/navigation';
import { getEventBySlug } from '../../../apis/api';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../../firebase';
import BackButton from '../../../components/BackButton';

export default function EventFormPage() {
  const { event_id } = useParams();
  const [user, loading] = useAuthState(auth);
  const [event, setEvent] = useState<any>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (loading || !user) return;
      
      try {
        setLoadingEvent(true);
        const eventData = await getEventBySlug(event_id as string);
        
        // Verificar se o usuário é o organizador do evento
        if (eventData.user_id !== user.uid) {
          setError('Você não tem permissão para editar este evento');
          return;
        }
        
        setEvent(eventData);
      } catch (err) {
        console.error('Erro ao carregar evento:', err);
        setError('Erro ao carregar informações do evento');
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [event_id, user, loading]);

  if (loading || loadingEvent) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !event) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <BackButton href={`/meus_eventos/${event_id}`} />
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">{error || 'Evento não encontrado'}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <BackButton href={`/meus_eventos/${event_id}`} />
      
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Configurar Formulário de Inscrição
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Evento: {event.name}
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="body1" paragraph>
            Personalize os campos do formulário de inscrição para seu evento. Arraste os campos para reordenar, adicione novos campos ou edite os existentes.
          </Typography>
          
          <FormEditor eventId={event.event_id} />
        </Box>
      </Paper>
    </Container>
  );
}
