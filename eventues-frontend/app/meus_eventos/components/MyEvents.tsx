// app/meus_eventos/components/MyEvents.tsx
"use client";

import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Button, Card, CardContent, CardActions, CardMedia, Grid, 
  Avatar, Chip, IconButton, useMediaQuery, Stack, Alert, Snackbar, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Tooltip,
  Stepper, Step, StepLabel, ButtonGroup, MenuItem, InputAdornment, Checkbox, FormControlLabel,
  AlertTitle
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import EventIcon from "@mui/icons-material/Event";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DateRangeIcon from "@mui/icons-material/DateRange";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Corrigido erro de importação
import { useAuthState } from "react-firebase-hooks/auth"; // Hook para autenticação
import { fetchMyEvents } from "../api/api"; // Função para chamar seu backend
import { auth } from "../../../firebase";
import LoadingOverlay from "../../components/LoadingOverlay";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://obc5v0hl83.execute-api.sa-east-1.amazonaws.com';

interface Event {
  id: number;
  event_id: string;
  name: string;
  category: string;
  start_date: string;
  end_date: string;
  city: string;
  state: string;
  event_status: string;
}

const colors = {
  primary: "#1976d2",
  secondary: "#5A67D8",
  green: "#48BB78",
  red: "#F56565",
  grayDark: "#2D3748",
  grayLight: "#CBD5E0",
  yellow: "#F6AD55",
  background: "#F7FAFC",
  white: "#FFFFFF",
  backgroundCardExpanded: "#EBF4FF",
};

enum EventFilterType {
  UPCOMING = "Próximos",
  PAST = "Passados",
  UNPUBLISHED = "Não publicados"
}

// Interfaces para os componentes de conteúdo
interface SectionProps {
  events: Event[];
  onCardClick: (event_id: string) => void;
  onNotify: (message: string, severity: "success" | "error" | "info" | "warning") => void;
}

// Componente para exibir eventos próximos
const UpcomingEvents: React.FC<SectionProps> = ({ events, onCardClick }) => {
  const filteredEvents = events.filter(
    event => new Date(event.end_date) >= new Date() && event.event_status !== "Rascunho"
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
        Eventos Próximos
      </Typography>
      
      {filteredEvents.length > 0 ? (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card
                sx={{
                  backgroundColor: colors.white,
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  },
                }}
                onClick={() => onCardClick(event.event_id)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: colors.primary, fontWeight: "bold", fontSize: "1.1rem" }}
                    >
                      {event.name}
                    </Typography>
                    <Box
                      sx={{
                        padding: "4px 12px",
                        borderRadius: "16px",
                        backgroundColor: colors.green,
                        color: "#FFF",
                        fontWeight: "medium",
                        fontSize: "0.75rem",
                      }}
                    >
                      {event.event_status}
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.grayDark, mt: 1, display: "flex", alignItems: "center" }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: "0.9rem", mr: 0.5 }} />
                    {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.grayDark, mt: 0.5 }}
                  >
                    {event.city}, {event.state}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CalendarTodayIcon sx={{ fontSize: 40, color: colors.grayLight, mb: 1 }} />
          <Typography variant="body1" color="textSecondary">
            Você não tem eventos próximos.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Componente para exibir eventos passados
const PastEvents: React.FC<SectionProps> = ({ events, onCardClick }) => {
  const filteredEvents = events.filter(
    event => new Date(event.end_date) < new Date() && event.event_status !== "Rascunho"
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
        Eventos Passados
      </Typography>
      
      {filteredEvents.length > 0 ? (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card
                sx={{
                  backgroundColor: colors.white,
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  },
                }}
                onClick={() => onCardClick(event.event_id)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: colors.primary, fontWeight: "bold", fontSize: "1.1rem" }}
                    >
                      {event.name}
                    </Typography>
                    <Box
                      sx={{
                        padding: "4px 12px",
                        borderRadius: "16px",
                        backgroundColor: colors.red,
                        color: "#FFF",
                        fontWeight: "medium",
                        fontSize: "0.75rem",
                      }}
                    >
                      Encerrado
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.grayDark, mt: 1, display: "flex", alignItems: "center" }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: "0.9rem", mr: 0.5 }} />
                    {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.grayDark, mt: 0.5 }}
                  >
                    {event.city}, {event.state}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <HistoryIcon sx={{ fontSize: 40, color: colors.grayLight, mb: 1 }} />
          <Typography variant="body1" color="textSecondary">
            Você não tem eventos passados.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Componente para exibir rascunhos
const DraftEvents: React.FC<SectionProps> = ({ events, onCardClick }) => {
  const filteredEvents = events.filter(event => event.event_status === "Rascunho");

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
        Rascunhos
      </Typography>
      
      {filteredEvents.length > 0 ? (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card
                sx={{
                  backgroundColor: colors.white,
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  },
                }}
                onClick={() => onCardClick(event.event_id)}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: colors.primary, fontWeight: "bold", fontSize: "1.1rem" }}
                    >
                      {event.name}
                    </Typography>
                    <Box
                      sx={{
                        padding: "4px 12px",
                        borderRadius: "16px",
                        backgroundColor: colors.grayLight,
                        color: "#FFF",
                        fontWeight: "medium",
                        fontSize: "0.75rem",
                      }}
                    >
                      Rascunho
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.grayDark, mt: 1, display: "flex", alignItems: "center" }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: "0.9rem", mr: 0.5 }} />
                    {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.grayDark, mt: 0.5 }}
                  >
                    {event.city}, {event.state}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <EditIcon sx={{ fontSize: 40, color: colors.grayLight, mb: 1 }} />
          <Typography variant="body1" color="textSecondary">
            Você não tem eventos em rascunho.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Componente de Carteira do Organizador
const OrganizatorWallet: React.FC<SectionProps> = ({ onNotify }) => {
  // Estado para controlar se os dados fiscais já existem
  const [hasOrganizerInfo, setHasOrganizerInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados para o modal de dados fiscais
  const [fiscalDataModalOpen, setFiscalDataModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0); // 0 = Dados fiscais, 1 = Chave Pix
  
  // Estados para o formulário
  const [fiscalType, setFiscalType] = useState<'CPF' | 'CNPJ'>('CPF');
  const [fiscalDocument, setFiscalDocument] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Endereço
  const [cep, setCep] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [complement, setComplement] = useState('');
  
  // Chave Pix
  const [pixKeyType, setPixKeyType] = useState('CPF');
  const [pixKey, setPixKey] = useState('');
  const [acceptTerms1, setAcceptTerms1] = useState(false);
  const [acceptTerms2, setAcceptTerms2] = useState(false);
  
  // Carregar informações do organizador ao iniciar o componente
  useEffect(() => {
    const fetchOrganizerInfo = async () => {
      try {
        setIsLoading(true);
        console.log("🔍 Buscando informações do organizador...");
        
        // Tentar diferentes variações de chaves para o userId
        let userId = localStorage.getItem('userId');
        if (!userId) userId = localStorage.getItem('user_id');
        if (!userId) userId = localStorage.getItem('uid');
        if (!userId) userId = localStorage.getItem('userID');
        if (!userId) userId = localStorage.getItem('id');
        
        console.log("📌 userId encontrado no localStorage:", userId);
        
        if (!userId) {
          console.error("❌ userId não encontrado em nenhuma variação de chave no localStorage");
          throw new Error('ID do usuário não encontrado');
        }
        
        const url = `${API_BASE_URL}/users/${userId}/organizer-info`;
        console.log("🌐 Fazendo requisição para:", url);
        
        const response = await fetch(url);
        console.log("✅ Resposta recebida:", response.status, response);
        
        const data = await response.json();
        console.log("📊 Dados recebidos:", data);
        
        if (data.exists) {
          console.log("✅ Dados do organizador encontrados!");
          setHasOrganizerInfo(true);
          // Preencher formulário com dados existentes
          const orgInfo = data.data;
          console.log("💬 Estrutura completa dos dados:", orgInfo);
          
          setFiscalType(orgInfo.fiscalType || 'CPF');
          setFiscalDocument(orgInfo.fiscalDocument || '');
          setFullName(orgInfo.fullName || '');
          setBirthDate(orgInfo.birthDate || '');
          setPhone(orgInfo.phone || '');
          setEmail(orgInfo.email || '');
          
          // Endereço - acessando o objeto address aninhado
          if (orgInfo.address) {
            setCep(orgInfo.address.cep || '');
            setState(orgInfo.address.state || '');
            setCity(orgInfo.address.city || '');
            setStreet(orgInfo.address.street || '');
            setNumber(orgInfo.address.number || '');
            setNeighborhood(orgInfo.address.neighborhood || '');
            setComplement(orgInfo.address.complement || '');
          }
          
          // Chave PIX - acessando o objeto pixInfo aninhado
          if (orgInfo.pixInfo) {
            setPixKeyType(orgInfo.pixInfo.pixKeyType || 'CPF');
            setPixKey(orgInfo.pixInfo.pixKey || '');
            setAcceptTerms1(true); // Se temos dados salvos, os termos foram aceitos
            setAcceptTerms2(true);
          }
        } else {
          console.log("ℹ️ Nenhuma informação de organizador encontrada");
        }
      } catch (error) {
        console.error('❌ Erro completo:', error);
        onNotify('Erro ao carregar informações. Tente novamente mais tarde.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrganizerInfo();
  }, [onNotify]);
  
  // Funções auxiliares para formatação e validação
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})-(\d{2}).+/, '$1.$2.$3-$4');
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .replace(/^(\d{5})-(\d{3}).+/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/^\((\d{2})\) (\d{5})(\d)/, '($1) $2-$3')
      .replace(/^\((\d{2})\) (\d{5})-(\d{4}).+/, '($1) $2-$3');
  };

  const formatDate = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1/$2')
      .replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
      .replace(/^(\d{2})\/(\d{2})\/(\d{4}).+/, '$1/$2/$3');
  };
  
  // Handlers para o modal
  const handleOpenFiscalDataForm = () => {
    setFiscalDataModalOpen(true);
  };

  const handleCloseFiscalDataModal = () => {
    setFiscalDataModalOpen(false);
    setActiveStep(0);
  };

  const handleNextStep = () => {
    // Validação básica (pode ser expandida)
    if (activeStep === 0) {
      if (!fiscalDocument || !fullName || !birthDate || !phone || !email || !cep || 
          !state || !city || !street || !number || !neighborhood) {
        onNotify("Preencha todos os campos obrigatórios", "error");
        return;
      }
    }
    setActiveStep(1);
  };

  const handlePreviousStep = () => {
    setActiveStep(0);
  };

  const handleSubmitFiscalData = async () => {
    // Validação básica da chave PIX
    if (!pixKey || !acceptTerms1 || !acceptTerms2) {
      onNotify("Preencha todos os campos e aceite os termos", "error");
      return;
    }
    
    try {
      setIsSaving(true);
      console.log("💾 Iniciando salvamento de dados fiscais...");
      
      // Tentar diferentes variações de chaves para o userId
      let userId = localStorage.getItem('userId');
      if (!userId) userId = localStorage.getItem('user_id');
      if (!userId) userId = localStorage.getItem('uid');
      if (!userId) userId = localStorage.getItem('userID');
      if (!userId) userId = localStorage.getItem('id');
      
      console.log("📌 userId encontrado no localStorage:", userId);
      
      if (!userId) {
        console.error("❌ userId não encontrado em nenhuma variação de chave no localStorage");
        throw new Error('ID do usuário não encontrado');
      }
      
      // Preparar os dados para envio
      const organizerData = {
        fiscalType,
        fiscalDocument,
        fullName,
        birthDate,
        phone,
        email,
        address: {
          cep,
          state,
          city,
          street,
          number,
          neighborhood,
          complement
        },
        pixInfo: {
          pixKeyType,
          pixKey,
          termsAccepted: true
        }
      };
      console.log("📝 Dados preparados para envio:", organizerData);
      
      // Construir URL
      const url = `${API_BASE_URL}/users/${userId}/organizer-info`;
      console.log("🌐 Enviando dados para:", url);
      
      // Enviar dados para o backend
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(organizerData)
      });
      
      console.log("✅ Resposta recebida:", response.status, response);
      const result = await response.json();
      console.log("📊 Resposta completa:", result);
      
      if (response.ok) {
        onNotify("Dados fiscais salvos com sucesso", "success");
        setHasOrganizerInfo(true);
        handleCloseFiscalDataModal();
      } else {
        console.error("❌ Erro na resposta:", result.error);
        throw new Error(result.error || 'Erro ao salvar dados');
      }
    } catch (error) {
      console.error("❌ Erro completo:", error);
      onNotify("Erro ao salvar dados. Tente novamente mais tarde.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestAnalysis = () => {
    onNotify("Função disponível após o cadastro dos dados fiscais", "warning");
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: "medium" }}>
        CARTEIRA DA ORGANIZAÇÃO
      </Typography>
      
      {isLoading ? (
        // Loading state
        <Paper elevation={0} sx={{ p: 3, mb: 4, border: "1px solid #E2E8F0", borderRadius: "8px" }}>
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress size={30} />
            <Typography variant="body1" sx={{ ml: 2 }}>
              Carregando informações...
            </Typography>
          </Box>
        </Paper>
      ) : (
        <>
          {/* Dados fiscais e conta */}
          <Paper elevation={0} sx={{ 
            p: 3, 
            mb: 4, 
            border: "1px solid #E2E8F0",
            borderRadius: "8px" 
          }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium", fontSize: "1.1rem" }}>
              Dados fiscais e conta para recebimento
            </Typography>
            
            {hasOrganizerInfo ? (
              // Dados já cadastrados
              <>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  mb: 2,
                  backgroundColor: "#E3F2FD",
                  p: 2,
                  borderRadius: "6px"
                }}>
                  <CheckCircleIcon color="primary" sx={{ mr: 1, fontSize: "1.2rem" }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      Dados cadastrados!
                    </Typography>
                    <Typography variant="body2">
                      Seus dados fiscais e chave PIX estão cadastrados e prontos para receber os valores dos seus eventos.
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>Nome:</Typography>
                    <Typography variant="body2">{fullName}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>{fiscalType}:</Typography>
                    <Typography variant="body2">{fiscalDocument}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>Tipo de chave PIX:</Typography>
                    <Typography variant="body2">{pixKeyType}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>Chave PIX:</Typography>
                    <Typography variant="body2">{pixKey}</Typography>
                  </Grid>
                </Grid>
                
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small" 
                  sx={{ 
                    textTransform: "none",
                    fontWeight: "medium",
                    fontSize: "0.85rem"
                  }}
                  onClick={handleOpenFiscalDataForm}
                >
                  Editar dados
                </Button>
              </>
            ) : (
              // Dados não cadastrados
              <>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "flex-start", 
                  mb: 2,
                  backgroundColor: "#FFF9C4",
                  p: 2,
                  borderRadius: "6px"
                }}>
                  <WarningIcon color="warning" sx={{ mr: 1, fontSize: "1.2rem" }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      Atenção!
                    </Typography>
                    <Typography variant="body2">
                      Verificamos que você ainda não cadastrou seus dados fiscais e a chave pix para receber os valores dos seus eventos.
                    </Typography>
                  </Box>
                </Box>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small" 
                  sx={{ 
                    textTransform: "none",
                    fontWeight: "medium",
                    fontSize: "0.85rem"
                  }}
                  onClick={handleOpenFiscalDataForm}
                >
                  Informar dados
                </Button>
              </>
            )}
          </Paper>
        </>
      )}
      
      {/* Modal de Dados Fiscais */}
      <Dialog 
        open={fiscalDataModalOpen} 
        onClose={handleCloseFiscalDataModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid #eee', 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2
        }}>
          Dados fiscais e dados da conta
          <IconButton onClick={handleCloseFiscalDataModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {/* Abas de navegação */}
          <Box sx={{ width: '100%', mb: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              <Step completed={activeStep > 0}>
                <StepLabel StepIconProps={{
                  sx: {
                    color: activeStep === 0 ? colors.primary : colors.grayLight,
                    backgroundColor: activeStep === 0 ? colors.white : colors.grayLight,
                  }
                }}>
                  <Typography sx={{ fontWeight: activeStep === 0 ? 'bold' : 'normal' }}>
                    Dados fiscais
                  </Typography>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel StepIconProps={{
                  sx: {
                    color: activeStep === 1 ? colors.primary : colors.grayLight,
                    backgroundColor: activeStep === 1 ? colors.white : colors.grayLight,
                  }
                }}>
                  <Typography sx={{ fontWeight: activeStep === 1 ? 'bold' : 'normal' }}>
                    Chave Pix
                  </Typography>
                </StepLabel>
              </Step>
            </Stepper>
          </Box>
          
          {activeStep === 0 ? (
            <>
              {/* Alerta de atenção */}
              <Alert severity="warning" sx={{ mb: 3 }}>
                <AlertTitle>Atenção!</AlertTitle>
                O CPF ou CNPJ cadastrado deve pertencer ao mesmo titular da conta de repasse.
              </Alert>
              
              {/* Seleção de tipo de documento */}
              <Box sx={{ mb: 3 }}>
                <ButtonGroup variant="outlined" color="primary">
                  <Button 
                    variant={fiscalType === 'CPF' ? "contained" : "outlined"}
                    onClick={() => setFiscalType('CPF')}
                  >
                    CPF
                  </Button>
                  <Button 
                    variant={fiscalType === 'CNPJ' ? "contained" : "outlined"}
                    onClick={() => setFiscalType('CNPJ')}
                  >
                    CNPJ
                  </Button>
                </ButtonGroup>
              </Box>
              
              {/* Formulário de dados pessoais */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nome completo"
                    fullWidth
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="CPF"
                    fullWidth
                    value={fiscalDocument}
                    onChange={(e) => setFiscalDocument(formatCPF(e.target.value))}
                    required
                    inputProps={{ maxLength: 14 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nascimento"
                    fullWidth
                    value={birthDate}
                    onChange={(e) => setBirthDate(formatDate(e.target.value))}
                    required
                    placeholder="DD/MM/AAAA"
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Telefone"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    required
                    placeholder="(XX) XXXXX-XXXX"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <img 
                            src="/icons/brazil-flag.png" 
                            alt="BR" 
                            width={20} 
                            height={15} 
                            style={{ marginRight: 5 }}
                          />
                          +55
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="E-mail"
                    fullWidth
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Grid>
                
                {/* Seção de endereço */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Endereço
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="País"
                    fullWidth
                    value="Brasil"
                    disabled
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="CEP"
                    fullWidth
                    value={cep}
                    onChange={(e) => setCep(formatCEP(e.target.value))}
                    required
                    placeholder="XXXXX-XXX"
                    inputProps={{ maxLength: 9 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Estado"
                    fullWidth
                    select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  >
                    {[
                      "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
                      "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
                      "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
                    ].map((state) => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Cidade"
                    fullWidth
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Rua"
                    fullWidth
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Número"
                    fullWidth
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Bairro"
                    fullWidth
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Complemento (opcional)"
                    fullWidth
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                  />
                </Grid>
              </Grid>
            </>
          ) : (
            <>
              {/* Etapa 2: Chave PIX */}
              <Alert severity="warning" sx={{ mb: 3 }}>
                <AlertTitle>Atenção!</AlertTitle>
                O CNPJ ou CPF do proprietário da chave pix deve ser o mesmo CNPJ ou CPF informado nos dados fiscais.
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Tipo de chave PIX"
                    fullWidth
                    select
                    value={pixKeyType}
                    onChange={(e) => setPixKeyType(e.target.value)}
                    required
                  >
                    <MenuItem value="CPF">CPF</MenuItem>
                    <MenuItem value="CNPJ">CNPJ</MenuItem>
                    <MenuItem value="EMAIL">E-mail</MenuItem>
                    <MenuItem value="TELEFONE">Telefone</MenuItem>
                    <MenuItem value="ALEATORIA">Chave Aleatória</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Chave PIX"
                    fullWidth
                    value={pixKey}
                    onChange={(e) => {
                      // Aplica a formatação de acordo com o tipo selecionado
                      let formattedValue = e.target.value;
                      if (pixKeyType === 'CPF') {
                        formattedValue = formatCPF(e.target.value);
                      } else if (pixKeyType === 'TELEFONE') {
                        formattedValue = formatPhone(e.target.value);
                      }
                      setPixKey(formattedValue);
                    }}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={acceptTerms1} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAcceptTerms1(e.target.checked)} 
                      />
                    }
                    label="Ao prosseguir, estou ciente e concordo que a equipe da Eventues pode solicitar mais documentos e validações de segurança, além de entrar em contato pelo celular informado antes de liberar os repasses."
                    sx={{ my: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={acceptTerms2} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAcceptTerms2(e.target.checked)} 
                      />
                    }
                    label="Concordo também com os termos e condições da Eventues."
                    sx={{ my: 1 }}
                  />
                </Grid>
              </Grid>
            </>
          )}
          
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
          {activeStep === 0 ? (
            <>
              <Button 
                onClick={handleCloseFiscalDataModal} 
                variant="outlined" 
                color="inherit"
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleNextStep} 
                variant="contained" 
                color="primary"
                disabled={isSaving}
              >
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={handlePreviousStep} 
                variant="outlined" 
                color="inherit"
                disabled={isSaving}
              >
                Voltar
              </Button>
              <Button 
                onClick={handleSubmitFiscalData} 
                variant="contained" 
                color="primary"
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const MyEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number>(0); // Para controlar o card expandido
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error" | "info" | "warning">("success");
  const [navigating, setNavigating] = useState<boolean>(false); // Estado para controlar quando está navegando
  const [user] = useAuthState(auth); // Firebase Authentication
  const router = useRouter();
  const pathname = usePathname();
  const isSmallScreen = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) {
        setError("Erro: Usuário não autenticado.");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchMyEvents(user.uid); // Passa o uid do Firebase para o backend
        setEvents(data as Event[]);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "Erro ao carregar eventos.");
        } else {
          setError("Erro ao carregar eventos.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);
  
  // Expande ou recolhe um card específico
  const handleExpand = (cardIndex: number) => {
    setExpandedCard(cardIndex);
  };

  // Cria um novo evento
  const createNewEvent = () => {
    router.push('/criar_evento');
  };

  // Navega para os detalhes do evento
  const handleCardClick = (event_id: string) => {
    setNavigating(true); // Ativa o overlay de loading
    router.push(`/event_detail/${event_id}`);
  };
  
  // Exibe notificações
  const handleNotify = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Definição dos cards/seções
  const cards = [
    {
      icon: <DateRangeIcon />,
      title: "Próximos Eventos",
      component: (
        <UpcomingEvents 
          events={events}
          onCardClick={handleCardClick}
          onNotify={handleNotify}
        />
      ),
      description: "Lista de eventos futuros que estão publicados."
    },
    {
      icon: <HistoryIcon />,
      title: "Eventos Passados",
      component: (
        <PastEvents 
          events={events}
          onCardClick={handleCardClick}
          onNotify={handleNotify}
        />
      ),
      description: "Histórico de eventos já realizados."
    },
    {
      icon: <EditIcon />,
      title: "Rascunhos",
      component: (
        <DraftEvents 
          events={events}
          onCardClick={handleCardClick}
          onNotify={handleNotify}
        />
      ),
      description: "Eventos em fase de edição, ainda não publicados."
    },
    {
      icon: <AccountBalanceWalletIcon />,
      title: "Carteira da organização",
      component: (
        <OrganizatorWallet
          events={events}
          onCardClick={handleCardClick}
          onNotify={handleNotify}
        />
      ),
      description: "Gerenciamento financeiro e dados fiscais da organização."    
    }
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {navigating && <LoadingOverlay />}
      <Box sx={{ flexGrow: 1, backgroundColor: colors.background, minHeight: "100vh" }}>
        {/* Header Section with title and Create Event button */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "16px 24px", 
          borderBottom: "1px solid #E2E8F0"
        }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            MEUS EVENTOS
          </Typography>
        </Box>

        {/* Área Principal de Conteúdo com Navegação Lateral */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            flexGrow: 1,
            padding: "15px",
          }}
        >
          {/* Sidebar com Seções */}
          <Box
            sx={{
              flexBasis: isSmallScreen ? "100%" : "20%",
              padding: "10px",
            }}
          >
            {cards.map((card, index) => (
              <Box key={index}>
                <Tooltip title={card.description} placement="right" arrow>
                  <Card
                    sx={{
                      marginBottom: "8px",
                      padding: "10px",
                      cursor: "pointer",
                      backgroundColor:
                        expandedCard === index
                          ? colors.backgroundCardExpanded
                          : colors.white,
                      transition: "background-color 0.3s",
                      "&:hover": {
                        backgroundColor: colors.backgroundCardExpanded,
                      },
                    }}
                    onClick={() => handleExpand(index)}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {card.icon}
                        <Typography
                          variant="subtitle1"
                          sx={{
                            marginLeft: "8px",
                            fontWeight:
                              expandedCard === index ? "bold" : "normal",
                          }}
                        >
                          {card.title}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Tooltip>

                {/* Conteúdo Expandido para Mobile */}
                {isSmallScreen && expandedCard === index && (
                  <Box
                    sx={{
                      padding: "20px",
                      backgroundColor: colors.white,
                      borderRadius: "15px",
                      boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                      marginBottom: "20px",
                    }}
                  >
                    {card.component}
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          {/* Conteúdo Expandido para Telas Maiores */}
          {!isSmallScreen && expandedCard !== null && (
            <Box
              sx={{
                flexBasis: "80%",
                padding: "20px",
                backgroundColor: colors.white,
                borderRadius: "15px",
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease-in-out",
              }}
            >
              {cards[expandedCard].component}
            </Box>
          )}
        </Box>
      </Box>

      {/* Snackbar para Notificações */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyEvents;
