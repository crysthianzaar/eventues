// app/meus_eventos/components/MyEvents.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tooltip,
  Snackbar,
  Alert,
  Paper,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/navigation";
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
import { useAuthState } from "react-firebase-hooks/auth"; // Hook para autenticação
import { fetchMyEvents } from "../api/api"; // Função para chamar seu backend
import { auth } from "../../../firebase";

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
  const handleOpenFiscalDataForm = () => {
    onNotify("Em breve você poderá cadastrar seus dados fiscais", "info");
  };

  const handleRequestAnalysis = () => {
    onNotify("Função disponível após o cadastro dos dados fiscais", "warning");
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: "medium" }}>
        CARTEIRA DA ORGANIZAÇÃO
      </Typography>
      
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
      </Paper>
      
      {/* Solicitação de análise */}
      <Paper elevation={0} sx={{ 
        p: 3, 
        border: "1px solid #E2E8F0",
        borderRadius: "8px",
        display: "flex",
        alignItems: "flex-start"
      }}>
        <MonetizationOnIcon sx={{ 
          color: colors.primary, 
          fontSize: "32px", 
          mr: 2,
          mt: 0.5,
          p: 0.5,
          backgroundColor: "rgba(25, 118, 210, 0.1)",
          borderRadius: "50%"
        }} />
        
        <Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: "medium", fontSize: "1.1rem" }}>
            Solicitar análise para antecipação de saque dos seus eventos.
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, color: colors.grayDark }}>
            Antes de solicitar esta análise você precisa preencher seus dados fiscais e sua chave pix.
          </Typography>
          
          <Button 
            variant="outlined" 
            color="primary" 
            size="small"
            disabled
            sx={{ 
              textTransform: "none",
              fontWeight: "medium",
              fontSize: "0.85rem"
            }}
            onClick={handleRequestAnalysis}
          >
            Solicitar análise
          </Button>
        </Box>
      </Paper>
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
  const [user] = useAuthState(auth); // Firebase Authentication
  const router = useRouter();
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
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={createNewEvent}
            sx={{ 
              borderRadius: "4px", 
              textTransform: "none", 
              fontWeight: "medium", 
              boxShadow: "none" 
            }}
          >
            Criar evento
          </Button>
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
