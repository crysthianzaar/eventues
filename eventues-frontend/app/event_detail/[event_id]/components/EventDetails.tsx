// app/event_detail/[event_id]/components/OrganizatorEventDetail.tsx

"use client";

import React, { useState, useEffect } from "react";
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
import {
  Image as ImageIcon,
  Assignment as FormIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Policy as PolicyIcon,
  Sports as SportsIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import EventIcon from "@mui/icons-material/Event"; // Para eventos em geral
import InfoIcon from "@mui/icons-material/Info"; // Para detalhes do evento
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"; // Para ingressos e valores
import CategoryIcon from "@mui/icons-material/Category"; // Para categorias
import AssignmentIcon from "@mui/icons-material/Assignment"; // Para formulários de inscrição
import DashboardIcon from "@mui/icons-material/Dashboard"; // Para visão geral/resumo
import Image from "next/image"; // Next.js Image component
import SummaryCard from "./Summary";
import InformationCard from "./InformationCard";
import BannerDocumentCard from "../utils/BannerDocumentCard";
import TicketsCard from "../utils/TicketsCard";
import FormCard from "./FormCard";
import PolicyCard from "../utils/PolicyCard";
import TicketsAndValues from "./TicketsAndValues";
import CriarIngressoPage from "./TicketsAndValues";
import Categories from "./Categories";
import { useRouter, useParams } from "next/navigation"; // Importação para obter parâmetros da rota
import api from "../apis/api";

interface EventDetail {
  event_id: string;
  user_id: string; // Adicionado para verificar a propriedade
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
  description: string;
  banner_image_url: string;
  stepper: {
    inf_basic: boolean;
    event_details: boolean;
    documents: boolean;
    ticket_and_values: boolean;
    category: boolean;
    form: boolean;
    event_ready: boolean;
  };
}

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

const OrganizatorEventDetail: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { event_id } = params; // Obtém o event_id da URL
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  // Estados para gerenciamento de dados e UI
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(0);

  // States para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await api.get(`/organizer_detail/${event_id}`);
        setEventDetail(response.data as EventDetail);
      } catch (err: any) {
        if (err.response) {
          // Erros retornados pelo backend
          setError(err.response.data.error || "Erro ao carregar detalhes do evento.");
        } else if (err.request) {
          // Erros de rede
          setError("Erro de rede. Tente novamente mais tarde.");
        } else {
          // Outros erros
          setError("Ocorreu um erro inesperado.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (event_id) {
      fetchEventDetail();
    }
  }, [event_id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#F7F7F7",
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#F7F7F7",
          padding: "20px",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!eventDetail) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#F7F7F7",
        }}
      >
        <Typography color="error">Evento não encontrado.</Typography>
      </Box>
    );
  }

  const steps = [
    {
      label: "Informações essenciais inseridas",
      status: eventDetail.stepper.inf_basic,
    },
    {
      label: "Detalhes do evento preenchidos",
      status: eventDetail.stepper.event_details,
    },
    {
      label: "Ingressos e Valores definidas",
      status: eventDetail.stepper.ticket_and_values,
    },
    {
      label: "Categorias configurados",
      status: eventDetail.stepper.category,
    },
    {
      label: "Formulário de Inscrição configurado",
      status: eventDetail.stepper.form,
    },
    {
      label: "Evento pronto para publicação",
      status: eventDetail.stepper.event_ready,
    },
  ];

  // Handler para expandir/recolher cards
  const handleExpand = (cardIndex: number) => {
    setExpandedCard(expandedCard === cardIndex ? null : cardIndex);
  };

  // Componente de Ícone para o Stepper
  const StepIconComponent: React.FC<StepIconProps> = ({ icon }) => {
    const stepIndex = Number(icon) - 1;
    const stepStatus = steps[stepIndex]?.status;

    return stepStatus ? (
      <CheckCircleIcon sx={{ color: colors.green }} />
    ) : (
      <ErrorIcon sx={{ color: colors.yellowDark }} />
    );
  };

  // Função para obter o ícone de status para os cards
  const getStatusIcon = (status: boolean | null | undefined) => {
    if (status === null || status === undefined) return null;
    return status ? (
      <CheckCircleIcon sx={{ color: colors.green }} />
    ) : (
      <ErrorIcon sx={{ color: colors.yellowDark }} />
    );
  };

  // Handler para notificações com Scroll para o Topo
  const handleNotify = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);

    // Scroll suave para o topo
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Função para redirecionar para o próximo passo incompleto
  const handleRedirectToNextIncompleteStep = () => {
    const firstIncompleteStep = steps.find((step) => !step.status);

    if (firstIncompleteStep) {
      const stepIndex = steps.indexOf(firstIncompleteStep);
      setExpandedCard(stepIndex);
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
      icon: <DashboardIcon />, // Ícone de "dashboard" para o resumo
      title: "Resumo",
      component: <SummaryCard />,
      description:
        "Visão geral do evento, status atual, principais métricas e ações rápidas.",
      status: eventDetail.stepper.inf_basic,
    },
    {
      icon: <InfoIcon />, // Ícone informativo para detalhes do evento
      title: "Detalhes do Evento",
      component: <InformationCard />,
      description:
        "Informações completas sobre o evento (nome, local, data, descrição).",
      status: eventDetail.stepper.event_details,
    },
    {
      icon: <MonetizationOnIcon />, // Ícone de dinheiro para ingressos e valores
      title: "Ingressos e Valores",
      component: <CriarIngressoPage />,
      description: "Configuração de ingressos e seus respectivos preços.",
      status: eventDetail.stepper.ticket_and_values,
    },
    {
      icon: <CategoryIcon />, // Ícone de categorias para o card de categorias
      title: "Categorias",
      component: <Categories />,
      description: "Configuração das categorias, subcategorias e políticas.",
      status: eventDetail.stepper.category,
    },
    {
      icon: <AssignmentIcon />, // Ícone de formulário para inscrição
      title: "Formulário de Inscrição",
      component: (
        <FormCard
          eventId={eventDetail.event_id} // Ajustar conforme necessário
          onNotify={handleNotifyAndRedirect}
          onUpdate={() => { /* Implementar se necessário */ }}
        />
      ),
      description:
        "Personalização do formulário que os participantes devem preencher ao se inscrever.",
      status: eventDetail.stepper.form,
    },
    // Adicione mais cards conforme necessário...
  ];

  return (
    <>
      {/* Header com Banner e Status do Evento */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: isSmallScreen ? "150px" : "200px",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Componente Image do Next.js para o Banner */}
        <Image
          src={
            eventDetail.banner_image_url
              ? eventDetail.banner_image_url
              : "/banner_template.png"
          }
          alt={`Banner do evento ${eventDetail.name}`}
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority // Opcional: priorizar o carregamento
        />

        {/* Conteúdo Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.3)", // Overlay escuro para legibilidade do texto
            color: colors.white,
          }}
        >
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

        {/* Botão para Publicar Evento */}
        <Button
          variant="contained"
          color="primary"
          disabled={!steps.every((step) => step.status)}
          sx={{
            display: "block",
            fontSize: isSmallScreen ? "12px" : "14px",
            textAlign: "center",
            whiteSpace: "normal",
            height: "40px",
            alignSelf: isSmallScreen ? "flex-start" : "center",
          }}
          onClick={() => router.push("/publicar_evento")} // Ajuste a rota conforme necessário
        >
          Publicar Evento
        </Button>
      </Box>

      {/* Área Principal de Conteúdo */}
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
                    {getStatusIcon(card.status)}
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
    </>
  );
};

export default OrganizatorEventDetail;
