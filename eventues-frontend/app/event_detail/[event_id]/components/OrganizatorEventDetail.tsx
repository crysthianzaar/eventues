// app/event_detail/[event_id]/components/OrganizatorEventDetail.tsx
"use client";

import React, { useState } from "react";
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
import SummaryCard from "./SummaryCard";
import InformationCard from "./InformationCard";
import BannerDocumentCard from "./BannerDocumentCard";
import TicketsCard from "./TicketsCard";
import FormCard from "./FormCard";
import PolicyCard from "./PolicyCard";
import ClientIngressosPage from "./ClientIngressosPage";
import CriarIngressoPage from "./ClientIngressosPage";
import Categories from "./Categories";

interface EventDetail {
  event_id: string;
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
    policies: boolean;
    category_and_values: boolean;
    form: boolean;
    event_ready: boolean;
  };
}

interface OrganizatorEventDetailProps {
  eventDetail: EventDetail;
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

const OrganizatorEventDetail: React.FC<OrganizatorEventDetailProps> = ({
  eventDetail,
}) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(0);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  // States for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

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
      status: eventDetail.stepper.policies,
    },
    {
      label: "Categorias configurados",
      status: eventDetail.stepper.category_and_values,
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

  // Handler for expanding/collapsing cards
  const handleExpand = (cardIndex: number) => {
    setExpandedCard(expandedCard === cardIndex ? null : cardIndex);
  };

  // Stepper Icon Component
  const StepIconComponent: React.FC<StepIconProps> = ({ icon }) => {
    const stepIndex = Number(icon) - 1;
    const stepStatus = steps[stepIndex]?.status;

    return stepStatus ? (
      <CheckCircleIcon sx={{ color: colors.green }} />
    ) : (
      <ErrorIcon sx={{ color: colors.yellowDark }} />
    );
  };

  // Function to get the status icon for cards
  const getStatusIcon = (status: boolean | null | undefined) => {
    if (status === null || status === undefined) return null;
    return status ? (
      <CheckCircleIcon sx={{ color: colors.green }} />
    ) : (
      <ErrorIcon sx={{ color: colors.yellowDark }} />
    );
  };

  // Notification Handler with Scroll-to-Top
  const handleNotify = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);

    // Smooth scroll to top
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Function to redirect to the next incomplete step
  const handleRedirectToNextIncompleteStep = () => {
    const firstIncompleteStep = steps.find((step) => !step.status);

    if (firstIncompleteStep) {
      const stepIndex = steps.indexOf(firstIncompleteStep);
      setExpandedCard(stepIndex);
    } else {
      // All steps are complete, redirect to summary
      setExpandedCard(0);
    }
  };

  // Combined Handler: Notify and Redirect
  const handleNotifyAndRedirect = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    handleNotify(message, severity);
    handleRedirectToNextIncompleteStep();
  };

  const cards = [
    {
      icon: <DashboardIcon />, // Mantém o ícone de "dashboard" para o resumo
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
      status: eventDetail.stepper.category_and_values,
    },
    {
      icon: <CategoryIcon />, // Ícone de categorias para o card de categorias
      title: "Categorias",
      component: (
        <Categories/>
      ),
      description: "Configuração das categorias, subcategorias e políticas.",
      status: eventDetail.stepper.policies,
    },
    {
      icon: <AssignmentIcon />, // Ícone de formulário para inscrição
      title: "Formulário de Inscrição",
      component: (
        <FormCard
          eventId={eventDetail.event_id} // Ajustar conforme necessário
          onNotify={handleNotifyAndRedirect}
          onUpdate={() => {} /* Implementar se necessário */}
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
      {/* Header with Banner and Event Status */}
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
        {/* Next.js Image Component for Banner */}
        <Image
          src={
            eventDetail.banner_image_url
              ? eventDetail.banner_image_url
              : "/banner_template.png"
          }
          alt={`Banner do evento ${eventDetail.name}`}
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority // Optional: prioritize loading
        />

        {/* Overlay Content */}
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
            backgroundColor: "rgba(0, 0, 0, 0.3)", // Dark overlay for text readability
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

      {/* Stepper with Horizontal Scroll on Mobile */}
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

        {/* Publish Event Button */}
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
        >
          Publicar Evento
        </Button>
      </Box>

      {/* Main Content Area */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          flexGrow: 1,
          padding: "15px",
        }}
      >
        {/* Sidebar with Sections */}
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

              {/* Expanded Content for Mobile */}
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

        {/* Expanded Content for Larger Screens */}
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

      {/* Snackbar for Notifications */}
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
