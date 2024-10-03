// src/components/OrganizatorEventDetails/OrganizatorEventDetail.tsx

import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Card,
  Typography,
  Tooltip,
  useMediaQuery,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepIconProps,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ImageIcon from "@mui/icons-material/Image";
import InfoIcon from "@mui/icons-material/Info";
import TicketIcon from "@mui/icons-material/ConfirmationNumber";
import DiscountIcon from "@mui/icons-material/LocalOffer";
import FormIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import LockIcon from "@mui/icons-material/Lock";
import PolicyIcon from "@mui/icons-material/Policy";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BarChartIcon from "@mui/icons-material/BarChart";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SportsIcon from "@mui/icons-material/Sports";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import SummaryCard from "./SummaryCard";
import BannerDocumentCard from "./BannerDocumentCard";
import InformationCard from "./InformationCard";
import TicketsCard from "./TicketsCard";
import CouponsCard from "./CouponsCard";
import FormCard from "./FormCard";
import ParticipantsCard from "./ParticipantsCard";
import CheckInCard from "./CheckInCard";
import FinanceCard from "./FinanceCard";
import AccessLevelsCard from "./AccessLevelsCard";
import banner_template from "../../assets/banner_template.png";
import PolicyCard from "./PolicyCard";

// Importe o Helmet
import { Helmet } from "react-helmet";

const colors = {
  primary: "#5A67D8",
  green: "#48BB78",
  yellowDark: "#F6AD55",
  grayDark: "#2D3748",
  grayLight: "#8E959C",
  red: "#F56565",
  white: "#FFFFFF",
  backgroundCardExpanded: "#EBF4FF",
  footerBackground: "#2D3748",
};

interface EventDetail {
  name: string;
  category: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  city: string;
  state: string;
  views: number;
  visibility: string;
  event_status: string;
  description: string; // Adicionado
  banner_image_url: string; // Adicionado
  stepper: {
    inf_basic: boolean;
    event_details: boolean;
    documents: boolean;
    policies: boolean;
    category_and_values: boolean;
    form: boolean;
    event_ready: boolean;
  };
}

const OrganizatorEventDetail: React.FC = () => {
  const { event_id } = useParams<{ event_id: string }>();
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(0);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  // Estados para o Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const steps = eventDetail
    ? [
        {
          label: "Informações essenciais inseridas",
          status: eventDetail.stepper.inf_basic,
        },
        {
          label: "Detalhes do evento preenchidos",
          status: eventDetail.stepper.event_details,
        },
        {
          label: "Banner e documentos carregados",
          status: eventDetail.stepper.documents,
        },
        {
          label: "Políticas definidas",
          status: eventDetail.stepper.policies,
        },
        {
          label: "Categorias e Valores configurados",
          status: eventDetail.stepper.category_and_values,
        },
        {
          label: "Formulário de Inscrição configurados",
          status: eventDetail.stepper.form,
        },
        {
          label: "Evento pronto para publicação",
          status: eventDetail.stepper.event_ready,
        },
      ]
    : [];

  // Função para buscar detalhes do evento
  const refetchEventDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<EventDetail>(
        `http://127.0.0.1:8000/organizer_detail/${event_id}`
      );
      setEventDetail(response.data);
    } catch (err) {
      setError("Erro ao carregar detalhes do evento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetchEventDetail();
  }, [event_id]);

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F7FAFC",
        }}
      >
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F7FAFC",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const handleExpand = (cardIndex: number) => {
    setExpandedCard(expandedCard === cardIndex ? null : cardIndex);
  };

  // Componente de Ícone do Stepper
  const StepIconComponent: React.FC<StepIconProps> = ({ icon }) => {
    const stepIndex = Number(icon) - 1;
    const stepStatus = steps[stepIndex].status;

    return stepStatus ? (
      <CheckCircleIcon sx={{ color: colors.green }} />
    ) : (
      <ErrorIcon sx={{ color: colors.yellowDark }} />
    );
  };

  // Função para obter o ícone de status dos cards
  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return null;
    return status ? (
      <CheckCircleIcon sx={{ color: colors.green }} />
    ) : (
      <ErrorIcon sx={{ color: colors.yellowDark }} />
    );
  };

  // Handler de Notificação com Scroll-to-Top
  const handleNotify = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);

    // Scroll para o topo suavemente
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Função para redirecionar para o próximo passo incompleto
  const handleRedirectToNextIncompleteStep = () => {
    if (!eventDetail) return;

    const stepper = eventDetail.stepper;
    const stepEntries = Object.entries(stepper);

    // Encontra o primeiro passo que é false
    const firstIncompleteStep = stepEntries.find(([key, value]) => !value);

    if (firstIncompleteStep) {
      const stepKey = firstIncompleteStep[0];
      // Mapeia os passos para os índices dos cards
      const stepToCardMap: { [key: string]: number } = {
        inf_basic: 0, // Resumo
        event_details: 1, // Detalhes do Evento
        documents: 2, // Banner e Documentos
        policies: 3, // Políticas
        category_and_values: 4, // Categorias e Valores
        form: 5, // Formulário de Inscrição
        // event_ready é o passo final, redirecionar para o resumo
      };
      const cardIndex =
        stepToCardMap[stepKey] !== undefined ? stepToCardMap[stepKey] : 0;
      setExpandedCard(cardIndex);
    } else {
      // Todos os passos estão completos, redirecionar para o resumo
      setExpandedCard(0);
    }
  };

  // Handler combinado: Notificar e Redirecionar
  const handleNotifyAndRedirect = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    handleNotify(message, severity);
    handleRedirectToNextIncompleteStep();
  };

  const cards = [
    {
      icon: <DashboardIcon />,
      title: "Resumo",
      component: <SummaryCard eventDetail={eventDetail} />,
      description:
        "Visão geral do evento, status atual, principais métricas e ações rápidas.",
      status: eventDetail?.stepper.inf_basic,
    },
    {
      icon: <InfoIcon />,
      title: "Detalhes do Evento",
      component: <InformationCard onNotify={handleNotifyAndRedirect} onUpdate={refetchEventDetail}/>,
      description:
        "Informações completas sobre o evento (nome, local, data, descrição).",
      status: eventDetail?.stepper.event_details,
    },
    {
      icon: <ImageIcon />,
      title: "Banner e Documentos",
      component: <BannerDocumentCard eventId={event_id!} onNotify={handleNotifyAndRedirect} onUpdate={refetchEventDetail}/>,
      description:
        "Upload e gerenciamento de materiais visuais e documentos importantes.",
      status: eventDetail?.stepper.documents,
    },
    {
      icon: <PolicyIcon />,
      title: "Políticas",
      component: (
        <PolicyCard
          eventId={event_id!}
          onUpdate={refetchEventDetail}
          handleNotify={handleNotifyAndRedirect}
        />
      ), // Pass handleNotifyAndRedirect here
      description:
        "Configuração das políticas de cancelamento, reembolso, e termos de participação.",
      status: eventDetail?.stepper.policies,
    },
    {
      icon: <SportsIcon />,
      title: "Categorias e Valores",
      component: <TicketsCard eventId={event_id!} onNotify={handleNotifyAndRedirect} onUpdate={refetchEventDetail} />,
      description: "Definição de categorias de inscrição e respectivos preços.",
      status: eventDetail?.stepper.category_and_values,
    },
    {
      icon: <FormIcon />,
      title: "Formulário de Inscrição",
      component: <FormCard eventId={event_id!} onNotify={handleNotifyAndRedirect} onUpdate={refetchEventDetail} />,
      description:
        "Personalização do formulário que os participantes devem preencher ao se inscrever.",
      status: eventDetail?.stepper.form,
    },
    {
      icon: <TicketIcon />,
      title: "Ingressos/Inscrições",
      component: <TicketsCard eventId={event_id!} onNotify={handleNotifyAndRedirect} onUpdate={refetchEventDetail} />,
      description:
        "Gerenciamento de ingressos ou inscrições, controle de disponibilidade e venda.",
      status: null,
    },
    {
      icon: <DiscountIcon />,
      title: "Cupons",
      component: <CouponsCard />,
      description:
        "Criação e gerenciamento de cupons de desconto para participantes.",
      status: null,
    },
    {
      icon: <PeopleIcon />,
      title: "Participantes",
      component: <ParticipantsCard />,
      description:
        "Listagem de todos os inscritos, com filtros e opções de exportação.",
      status: null,
    },
    {
      icon: <CheckCircleIcon />,
      title: "Check-In",
      component: <CheckInCard />,
      description:
        "Ferramenta para fazer o check-in dos participantes no dia do evento.",
      status: null,
    },
    {
      icon: <AttachMoneyIcon />,
      title: "Financeiro",
      component: <FinanceCard />,
      description:
        "Resumo financeiro do evento, incluindo taxas pagas, receitas geradas e pagamento de comissões.",
      status: null,
    },
    {
      icon: <BarChartIcon />,
      title: "Relatórios e Estatísticas",
      component: <FinanceCard />,
      description:
        "Dados de performance, como número de visualizações do evento, taxa de conversão, e relatórios detalhados em tempo real.",
      status: null,
    },
    {
      icon: <NotificationsIcon />,
      title: "Mensagens/Notificações",
      component: <FinanceCard />,
      description:
        "Ferramenta de comunicação para enviar e-mails ou notificações para os participantes.",
      status: null,
    },
    {
      icon: <CalendarTodayIcon />,
      title: "Agenda/Cronograma",
      component: <FinanceCard />,
      description:
        "Ferramenta para gerenciar datas e horários importantes do evento, como largadas ou palestras.",
      status: null,
    },
    {
      icon: <LockIcon />,
      title: "Níveis de Acesso",
      component: <AccessLevelsCard />,
      description:
        "Configuração dos níveis de acesso para organizadores e colaboradores.",
      status: null,
    },
  ];

  return (
    <>
      {eventDetail && (
        <Helmet>
          <title>{eventDetail.name} | Eventues</title>
          <meta name="description" content={eventDetail.description} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="article" />
          <meta
            property="og:url"
            content={`https://www.eventues.com/event_detail/${event_id}`}
          />
          <meta property="og:title" content={eventDetail.name} />
          <meta
            property="og:description"
            content={eventDetail.description}
          />
          <meta
            property="og:image"
            content={eventDetail.banner_image_url || banner_template}
          />

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:url"
            content={`https://www.eventues.com/event_detail/${event_id}`}
          />
          <meta name="twitter:title" content={eventDetail.name} />
          <meta
            name="twitter:description"
            content={eventDetail.description}
          />
          <meta
            name="twitter:image"
            content={eventDetail.banner_image_url || banner_template}
          />
        </Helmet>
      )}

      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#F7FAFC",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
        }}
      >
        {/* Cabeçalho com Banner e status do evento */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: isSmallScreen ? "150px" : "200px",
            backgroundImage: `url(${banner_template})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          {eventDetail && (
            <Box sx={{ textAlign: "center", color: colors.white }}>
              <Box
                sx={{
                  marginBottom: "10px",
                  padding: "5px 15px",
                  borderRadius: "20px",
                  backgroundColor:
                    eventDetail.event_status === "Rascunho"
                      ? colors.grayLight
                      : eventDetail.event_status === "Inscrições abertas"
                      ? colors.green
                      : colors.red,
                  color: colors.white,
                  fontWeight: "bold",
                  textAlign: "center",
                  display: "inline-block",
                }}
              >
                {eventDetail.event_status}
              </Box>

              <Typography
                variant={isSmallScreen ? "h5" : "h3"}
                sx={{
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  marginTop: "10px",
                }}
              >
                {eventDetail.name}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LocationOnIcon sx={{ marginRight: "8px" }} />
                <Typography variant={isSmallScreen ? "body1" : "h6"}>
                  {eventDetail.city}, {eventDetail.state}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Stepper com Scroll Horizontal em Mobile */}
        <Box
          sx={{
            marginTop: "20px",
            padding: isSmallScreen ? "0 20px" : "0",
            width: "100%",
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            alignItems: isSmallScreen ? "unset" : "center",
            justifyContent: isSmallScreen ? "unset" : "center",
            overflowX: isSmallScreen ? "scroll" : "unset",
            whiteSpace: isSmallScreen ? "nowrap" : "normal",
            gap: isSmallScreen ? "20px" : "unset",
          }}
        >
          <Stepper
            alternativeLabel
            sx={{
              minWidth: isSmallScreen ? "600px" : "unset",
              whiteSpace: "normal",
              justifyContent: "center",
              marginBottom: "10px",
            }}
          >
            {steps.map((step, index) => (
              <Step key={index}>
                <StepLabel
                  StepIconComponent={StepIconComponent}
                  sx={{
                    "& .MuiStepLabel-label": {
                      display: "block",
                      fontSize: isSmallScreen ? "12px" : "14px",
                      maxWidth: "160px",
                      textAlign: "center",
                      whiteSpace: "normal",
                    },
                  }}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Botão de Publicação */}
          <Button
            variant="contained"
            color="primary"
            disabled={!steps.every((step) => step.status)}
            sx={{
              display: "block",
              fontSize: isSmallScreen ? "12px" : "14px",
              textAlign: "center",
              whiteSpace: "normal",
            }}
          >
            Publicar Evento
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            flexGrow: 1,
            padding: "15px",
          }}
        >
          {/* Sidebar com as seções */}
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
                          variant="h6"
                          sx={{
                            marginLeft: "8px",
                            fontWeight:
                              expandedCard === index ? "bold" : "normal",
                          }}
                        >
                          {card.title}
                        </Typography>
                      </Box>
                      {getStatusIcon(
                        card.status !== undefined ? card.status : null
                      )}
                    </Box>
                  </Card>
                </Tooltip>

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

          {/* Conteúdo expandido das seções em telas maiores */}
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

        {/* Snackbar Centralizado para Notificações */}
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
    </>
  );
};

export default OrganizatorEventDetail;
