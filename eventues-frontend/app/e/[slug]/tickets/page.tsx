'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  useTheme,
} from '@mui/material';
import { useParams } from 'next/navigation';
import { getEventBySlug } from '@/app/apis/api';
import { Event } from '@/app/apis/api';
import TicketOptions from '../components/TicketOptions';
import PersonalInfoForm from '../components/PersonalInfoForm';

interface FormData {
  [key: string]: any;
}

interface SelectedTicket {
  id: string;
  name: string;
  description: string;
  price: number;
  totalIngressos: number;
  type: string;
  status: string;
}

const steps = ['Selecionar Ingresso', 'Informações Pessoais', 'Pagamento'];

export default function TicketsPage() {
  const theme = useTheme();
  const params = useParams();
  const { slug } = params;

  const [activeStep, setActiveStep] = useState(0);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SelectedTicket | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState<FormData>({});

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventData = await getEventBySlug(slug as string);
        setEvent(eventData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Erro ao carregar evento');
        setLoading(false);
      }
    };

    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  const handleNext = () => {
    if (activeStep === 0 && !selectedTicket) {
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !event) {
    return (
      <Box p={2}>
        <Alert severity="error">{error || 'Evento não encontrado'}</Alert>
      </Box>
    );
  }

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <TicketOptions
            eventSlug={slug as string}
            onSelectTicket={(ticket) => {
              setSelectedTicket({
                id: ticket.id.toString(),
                name: ticket.nome,
                description: ticket.descricao || '',
                price: ticket.tipo === 'Lotes' 
                  ? ticket.lotes?.[0]?.valor || ticket.valor 
                  : ticket.valor,
                totalIngressos: ticket.totalIngressos,
                type: ticket.tipo,
                status: ticket.totalIngressos > 0 ? 'active' : 'inactive'
              });
              handleNext();
            }}
          />
        );
      case 1:
        return (
          <Box>
            {selectedTicket && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ingresso Selecionado
                  </Typography>
                  <Typography>{selectedTicket.name}</Typography>
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <Typography sx={{ mx: 2 }}>{quantity}</Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 10}
                    >
                      +
                    </Button>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6">
                    Total: R$ {(selectedTicket.price * quantity).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <PersonalInfoForm
              eventId={event.event_id}
              onFormDataChange={(data) => setFormData(data)}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            {selectedTicket && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resumo do Pedido
                  </Typography>
                  <Typography>
                    {quantity}x {selectedTicket.name}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Total: R$ {(selectedTicket.price * quantity).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Stepper activeStep={activeStep}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 4, mb: 2 }}>
          {getStepContent(activeStep)}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Voltar
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" color="primary">
              Finalizar Compra
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleNext}
              disabled={activeStep === 0 && !selectedTicket}
            >
              Próximo
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}
