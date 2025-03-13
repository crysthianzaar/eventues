'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  styled,
  alpha,
  Fade,
  Zoom,
  Tabs,
  Tab
} from '@mui/material';
import { useParams } from 'next/navigation';
import { getEventBySlug, getEventTickets, Event, Ingresso } from '@/app/apis/api';
import TicketOptions from './components/TicketOptions';
import PersonalInfoForm from './components/PersonalInfoForm';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import { motion } from 'framer-motion';

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '30%',
    height: '30%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
    zIndex: 0,
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  padding: `${theme.spacing(1.2)} ${theme.spacing(3)}`,
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
  }
}));

const StyledStepper = styled(Stepper)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiStepLabel-root': {
    '& .MuiStepIcon-root': {
      width: 36,
      height: 36,
      '&.Mui-active': {
        color: theme.palette.primary.main,
      },
      '&.Mui-completed': {
        color: theme.palette.success.main,
      }
    },
    '& .MuiStepLabel-label': {
      marginTop: theme.spacing(0.5),
      fontWeight: 500,
      '&.Mui-active': {
        color: theme.palette.text.primary,
        fontWeight: 600,
      }
    }
  }
}));

const EventHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -16,
    left: 0,
    width: '100%',
    height: 1,
    backgroundColor: alpha(theme.palette.divider, 0.7),
  }
}));

const NavigationButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(4),
  gap: theme.spacing(2),
}));

// Define steps
const steps = [
  { label: 'Selecionar Ingressos', icon: <ConfirmationNumberIcon /> },
  { label: 'Informações Pessoais', icon: <PersonIcon /> },
  { label: 'Pagamento', icon: <PaymentIcon /> }
];

// Define form data type
type FormData = {
  nome: string;
  dataNascimento: string;
  genero: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  email: string;
  telefone: string;
  contatoEmergencia: string;
  tamanhoCamiseta?: string;
  infoMedicas?: string;
  equipe?: string;
  termos: boolean;
};

export default function TicketsPage() {
  const params = useParams();
  const theme = useTheme();
  const slug = params?.slug as string;
  
  const [activeStep, setActiveStep] = useState(0);
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ingresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, { ticket: Ingresso, quantity: number }>>({});
  const [formData, setFormData] = useState<FormData[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [activeParticipant, setActiveParticipant] = useState(0);
  const ticketsPerPurchase = 2; // Define o número de ingressos por compra

  // Fetch event data
  useEffect(() => {
    if (!slug) return;

    const fetchEventData = async () => {
      setLoading(true);
      try {
        const eventData = await getEventBySlug(slug);
        setEvent(eventData);
        
        const ticketsData = await getEventTickets(eventData.event_id);
        setTickets(ticketsData);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Não foi possível carregar os dados do evento. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [slug]);

  // Handle ticket selection
  const handleSelectTicket = (ticket: Ingresso, quantity: number) => {
    setSelectedQuantities(prev => ({
      ...prev,
      [ticket.id]: quantity
    }));
    
    if (quantity > 0) {
      setSelectedTickets(prev => ({
        ...prev,
        [ticket.id]: { ticket, quantity }
      }));
    } else {
      const newSelectedTickets = { ...selectedTickets };
      delete newSelectedTickets[ticket.id];
      setSelectedTickets(newSelectedTickets);
    }
  };

  // Handle form data change
  const handleFormDataChange = (data: FormData, index: number) => {
    setFormData(prev => {
      const newFormData = [...prev];
      newFormData[index] = data;
      return newFormData;
    });
  };

  // Calculate total tickets selected
  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((acc, { quantity }) => acc + quantity, 0);
  };

  // Initialize form data based on selected tickets
  useEffect(() => {
    const totalTickets = getTotalTickets();
    
    // Initialize form data array with the correct number of entries
    if (totalTickets > 0 && formData.length !== totalTickets) {
      const newFormData: FormData[] = [];
      
      // Keep existing form data if available
      for (let i = 0; i < totalTickets; i++) {
        newFormData[i] = formData[i] || {
          nome: '',
          dataNascimento: '',
          genero: '',
          cidade: '',
          estado: '',
          endereco: '',
          email: '',
          telefone: '',
          contatoEmergencia: '',
          tamanhoCamiseta: '',
          infoMedicas: '',
          equipe: '',
          termos: false
        };
      }
      
      setFormData(newFormData);
    }
  }, [selectedTickets]);

  // Função para obter o nome do ingresso para um participante específico
  const getTicketNameForParticipant = (participantIndex: number) => {
    let remainingIndex = participantIndex;
    for (const [_, { ticket, quantity }] of Object.entries(selectedTickets)) {
      if (remainingIndex < quantity) {
        return ticket.nome;
      }
      remainingIndex -= quantity;
    }
    return 'Ingresso';
  };

  // Função para obter a cor do ingresso para um participante específico
  const getTicketColorForParticipant = (participantIndex: number) => {
    let remainingIndex = participantIndex;
    for (const [ticketId, { quantity }] of Object.entries(selectedTickets)) {
      if (remainingIndex < quantity) {
        // Gerar uma cor baseada no ID do ticket para diferenciar visualmente
        const ticketHash = ticketId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = ticketHash % 360;
        return `hsl(${hue}, 70%, 65%)`;
      }
      remainingIndex -= quantity;
    }
    return '';
  };

  // Função para gerar rótulos para as abas de participantes
  const generateParticipantLabels = () => {
    const labels: string[] = [];
    let participantCounter: Record<string, number> = {};
    
    let participantIndex = 0;
    for (const [ticketId, { ticket, quantity }] of Object.entries(selectedTickets)) {
      for (let i = 0; i < quantity; i++) {
        // Incrementar o contador para este tipo de ingresso
        participantCounter[ticket.nome] = (participantCounter[ticket.nome] || 0) + 1;
        
        // Criar rótulo com nome do ingresso e número do participante
        labels[participantIndex] = `${ticket.nome} ${participantCounter[ticket.nome]}`;
        participantIndex++;
      }
    }
    
    return labels;
  };

  // Função para lidar com a mudança de participante ativo
  const handleParticipantChange = (index: number) => {
    setActiveParticipant(index);
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === 0 && getTotalTickets() === 0) {
      return; // Don't proceed if no tickets selected
    }
    
    if (activeStep === 1) {
      // Validate all forms before proceeding
      const allFormsValid = formData.every(data => {
        return data.nome && 
               data.dataNascimento && 
               data.genero && 
               data.email && 
               data.telefone && 
               data.contatoEmergencia && 
               data.termos;
      });
      
      if (!allFormsValid) {
        setError('Por favor, preencha todos os campos obrigatórios em todos os formulários.');
        return;
      }
    }
    
    setActiveStep(prevStep => prevStep + 1);
    setError(null);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
    setError(null);
  };

  // Render loading state
  if (loading) {
    return (
      <StyledContainer maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </StyledContainer>
    );
  }

  // Render error state
  if (error && !event) {
    return (
      <StyledContainer maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4, borderRadius: 2 }}>
          {error}
        </Alert>
      </StyledContainer>
    );
  }

  // Render content based on active step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <TicketOptions 
                tickets={tickets} 
                onSelectTicket={handleSelectTicket} 
                selectedQuantities={selectedQuantities}
                loading={loading}
              />
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in={true} timeout={500}>
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              {formData.length > 0 && (
                <PersonalInfoForm
                  eventId={event?.event_id || ''}
                  onFormDataChange={(data) => handleFormDataChange(data, activeParticipant)}
                  formIndex={activeParticipant}
                  initialData={formData[activeParticipant]}
                  ticketName={getTicketNameForParticipant(activeParticipant)}
                  ticketColor={getTicketColorForParticipant(activeParticipant)}
                  onParticipantChange={handleParticipantChange}
                  totalParticipants={formData.length}
                  participantLabels={generateParticipantLabels()}
                />
              )}
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={true} timeout={500}>
            <Box>
              <StyledPaper>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Pagamento
                </Typography>
                <Typography variant="body1" paragraph>
                  Esta é a etapa de pagamento. Aqui você poderá escolher a forma de pagamento e finalizar sua compra.
                </Typography>
                {/* Placeholder for payment component */}
                <Box sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  bgcolor: alpha(theme.palette.primary.light, 0.1),
                  borderRadius: 2,
                  mt: 2
                }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Componente de Pagamento
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    (Em desenvolvimento)
                  </Typography>
                </Box>
              </StyledPaper>
            </Box>
          </Fade>
        );
      default:
        return null;
    }
  };

  return (
    <StyledContainer maxWidth="lg">
      <Zoom in={true} timeout={500}>
        <StyledPaper>
          <EventHeader>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
              {event?.name || 'Evento'}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {event?.start_date ? new Date(event.start_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }) : 'Data a definir'}
            </Typography>
          </EventHeader>

          <StyledStepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  StepIconProps={{ 
                    icon: index < activeStep ? <CheckCircleIcon /> : (index === activeStep ? step.icon : index + 1) 
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </StyledStepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {renderStepContent()}

          <NavigationButtons>
            <StyledButton
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBackIcon />}
            >
              Voltar
            </StyledButton>
            
            <StyledButton
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && getTotalTickets() === 0) ||
                activeStep === steps.length - 1
              }
              endIcon={activeStep === steps.length - 1 ? <CheckCircleIcon /> : <ArrowForwardIcon />}
            >
              {activeStep === steps.length - 1 ? 'Finalizar' : 'Continuar'}
            </StyledButton>
          </NavigationButtons>
        </StyledPaper>
      </Zoom>
    </StyledContainer>
  );
}
