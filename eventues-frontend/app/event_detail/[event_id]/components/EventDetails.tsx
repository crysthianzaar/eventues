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
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
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
import TicketOptions from '@/app/e/[slug]/components/TicketOptions';
import { useRouter, useParams } from "next/navigation"; // Importação para obter parâmetros da rota
import api from "../apis/api";

interface EventDetail {
  event_id: string;
  user_id: string; // Adicionado para verificar a propriedade
  name: string;
  slug: string; // Adicionando slug à interface
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
  // Removemos o stepper
}

interface EventDetail {
  event_id: string;
  user_id: string;
  name: string;
  slug: string;
  category: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  state: string;
  city: string;
  address: string;
  address_complement: string;
  address_detail: string;
  organization_name: string;
  organization_contact: string;
  event_status: string;
  event_type: string;
  event_description?: string;
  banner_image?: string;
  tickets?: {
    id: string;
    name: string;
    description: string;
    price: number;
    totalIngressos: number;
    type: 'Simples' | 'Lotes' | 'Gratuito';
    status: 'active' | 'inactive';
    category?: string;
  }[];
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

  // States para Dialog de confirmação de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

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

  // Handler para expandir/recolher cards
  const handleExpand = (cardIndex: number) => {
    setExpandedCard(expandedCard === cardIndex ? null : cardIndex);
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

  // Handler combinado: Notificar e realizar ação
  const handleNotifyAndAction = (
    message: string,
    severity: "success" | "error" | "info" | "warning",
    action: () => void
  ) => {
    handleNotify(message, severity);
    action();
  };

  // Função para publicar/despublicar o evento
  const handlePublishEvent = async () => {
    try {
      // Define o novo status baseado no status atual
      const newStatus = eventDetail?.event_status === "Rascunho" ? "Publicado" : "Rascunho";
      
      // Chamada à API para alterar o status do evento
      const response = await api.patch(`/publish_event/${event_id}/${newStatus}`);
      
      if (response.status === 200) {
        const message = newStatus === "Publicado" 
          ? "Evento publicado com sucesso!" 
          : "Evento despublicado com sucesso!";
        
        handleNotify(message, "success");
        
        // Atualiza o status do evento localmente
        setEventDetail((prev) =>
          prev ? { ...prev, event_status: newStatus } : prev
        );
      }
    } catch (err: any) {
      const action = eventDetail?.event_status === "Rascunho" ? "publicar" : "despublicar";
      handleNotify(`Erro ao ${action} o evento.`, "error");
    }
  };

  // Função para excluir o evento
  const handleDeleteEvent = async () => {
    try {
      // Chamada à API para excluir o evento
      const response = await api.delete(`/delete_event/${event_id}`);
      if (response.status === 200) {
        handleNotify("Evento excluído com sucesso!", "success");
        // Redireciona após a exclusão
        router.push("/meus_eventos"); // Ajuste conforme a rota dos seus eventos
      }
    } catch (err: any) {
      handleNotify("Erro ao excluir o evento.", "error");
    }
  };

  const cards = [
    {
      icon: <DashboardIcon />, // Ícone de "dashboard" para o resumo
      title: "Resumo",
      component: <SummaryCard />,
      description:
        "Visão geral do evento, status atual, principais métricas e ações rápidas.",
    },
    {
      icon: <InfoIcon />, // Ícone informativo para detalhes do evento
      title: "Detalhes do Evento",
      component: <InformationCard />,
      description:
        "Informações completas sobre o evento (nome, local, data, descrição).",
    },
    {
      icon: <MonetizationOnIcon />, // Ícone de dinheiro para ingressos e valores
      title: "Ingressos e Valores",
      component: <CriarIngressoPage />,
      description: "Configuração de ingressos e seus respectivos preços.",
    },
    {
      icon: <AssignmentIcon />, // Ícone de formulário para inscrição
      title: "Formulário",
      component: (
        <FormCard
          eventId={eventDetail.event_id} // Ajustar conforme necessário
          onNotify={(message, severity) =>
            handleNotifyAndAction(message, severity, () => {})
          }
          onUpdate={() => { /* Implementar se necessário */ }}
        />
      ),
      description:
        "Personalização do formulário que os participantes devem preencher ao se inscrever.",
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

      {/* Área de Botões de Ação */}
      <Box
        sx={{
          marginTop: "20px",
          padding: isSmallScreen ? "0 20px" : "0",
          width: "100%",
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: "center",
          justifyContent: "center", // Centraliza os botões
          gap: "10px",
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          startIcon={<EventIcon />}
          onClick={() => router.push(`/e/${eventDetail.slug}`)}
          sx={{ fontSize: isSmallScreen ? "12px" : "14px" }}
        >
          Visualizar Página do Evento
        </Button>

        {eventDetail.event_status === "Rascunho" ? (
          <>
        <Button
          variant="contained"
          color="primary"
          startIcon={<MonetizationOnIcon />}
          onClick={handlePublishEvent}
          sx={{
            fontSize: isSmallScreen ? "12px" : "14px",
          }}
        >
          Publicar Evento
        </Button>

        <Button
          variant="outlined"
          color="error"
          startIcon={<ErrorIcon />}
          onClick={() => setDeleteDialogOpen(true)}
          sx={{
            fontSize: isSmallScreen ? "12px" : "14px",
          }}
        >
          Excluir Evento
        </Button>
          </>
        ) : (
          <Button
        variant="contained"
        color="warning"
        startIcon={<MonetizationOnIcon />}
        onClick={handlePublishEvent}
        sx={{
          fontSize: isSmallScreen ? "12px" : "14px",
        }}
          >
        Despublicar Evento
          </Button>
        )}
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
                    {/* Removemos o ícone de status */}
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

      {/* Dialog de Confirmação para Exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmar Exclusão do Evento"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Tem certeza de que deseja excluir este evento? Essa ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={() => {
              handleDeleteEvent();
              setDeleteDialogOpen(false);
            }}
            color="error"
            autoFocus
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrganizatorEventDetail;
