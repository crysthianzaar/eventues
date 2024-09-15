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
}

const steps = [
  { label: "Informações essenciais inseridas", status: true },
  { label: "Detalhes do evento preenchidos", status: false },
  { label: "Banner e documentos carregados", status: true },
  { label: "Políticas definidas", status: false },
  { label: "Categorias e Valores configurados", status: false },
  { label: "Formulário de Inscrição configurados", status: false },
  { label: "Evento pronto para publicação", status: false },
];

const StepIconComponent: React.FC<StepIconProps> = ({ icon }) => {
  const stepIndex = Number(icon) - 1;
  const stepStatus = steps[stepIndex].status;

  return stepStatus ? (
    <CheckCircleIcon sx={{ color: colors.green }} />
  ) : (
    <ErrorIcon sx={{ color: colors.yellowDark }} />
  );
};

const OrganizatorEventDetail: React.FC = () => {
  const { event_id } = useParams<{ event_id: string }>();
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(0);
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  useEffect(() => {
    const fetchEventDetail = async () => {
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

    fetchEventDetail();
  }, [event_id]);

  if (loading) {
    return <CircularProgress sx={{ color: colors.primary }} />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const handleExpand = (cardIndex: number) => {
    setExpandedCard(expandedCard === cardIndex ? null : cardIndex);
  };

  const cards = [
    {
      icon: <DashboardIcon />,
      title: "Resumo",
      component: <SummaryCard eventDetail={eventDetail} />,
      description:
        "Visão geral do evento, status atual, principais métricas e ações rápidas.",
    },
    {
      icon: <InfoIcon />,
      title: "Detalhes do Evento",
      component: <InformationCard />,
      description:
        "Informações completas sobre o evento (nome, local, data, descrição).",
    },
    {
      icon: <ImageIcon />,
      title: "Banner e Documentos",
      component: <BannerDocumentCard eventId={event_id!} />,
      description:
        "Upload e gerenciamento de materiais visuais e documentos importantes.",
    },
    {
      icon: <PolicyIcon />,
      title: "Políticas",
      component: <PolicyCard />,
      description:
        "Configuração das políticas de cancelamento, reembolso, e termos de participação.",
    },
    {
      icon: <SportsIcon />,
      title: "Categorias e Valores",
      component: <CouponsCard />,
      description: "Definição de categorias de inscrição e respectivos preços.",
    },
    {
      icon: <FormIcon />,
      title: "Formulário de Inscrição",
      component: <FormCard />,
      description:
        "Personalização do formulário que os participantes devem preencher ao se inscrever.",
    },
    {
      icon: <TicketIcon />,
      title: "Ingressos/Inscrições",
      component: <TicketsCard />,
      description:
        "Gerenciamento de ingressos ou inscrições, controle de disponibilidade e venda.",
    },
    {
      icon: <DiscountIcon />,
      title: "Cupons",
      component: <CouponsCard />,
      description:
        "Criação e gerenciamento de cupons de desconto para participantes.",
    },
    {
      icon: <PeopleIcon />,
      title: "Participantes",
      component: <ParticipantsCard />,
      description:
        "Listagem de todos os inscritos, com filtros e opções de exportação.",
    },
    {
      icon: <CheckCircleIcon />,
      title: "Check-In",
      component: <CheckInCard />,
      description:
        "Ferramenta para fazer o check-in dos participantes no dia do evento.",
    },
    {
      icon: <AttachMoneyIcon />,
      title: "Financeiro",
      component: <FinanceCard />,
      description:
        "Resumo financeiro do evento, incluindo taxas pagas, receitas geradas e pagamento de comissões.",
    },
    {
      icon: <BarChartIcon />,
      title: "Relatórios e Estatísticas",
      component: <FinanceCard />,
      description:
        "Dados de performance, como número de visualizações do evento, taxa de conversão, e relatórios detalhados em tempo real.",
    },
    {
      icon: <NotificationsIcon />,
      title: "Mensagens/Notificações",
      component: <FinanceCard />,
      description:
        "Ferramenta de comunicação para enviar e-mails ou notificações para os participantes.",
    },
    {
      icon: <CalendarTodayIcon />,
      title: "Agenda/Cronograma",
      component: <FinanceCard />,
      description:
        "Ferramenta para gerenciar datas e horários importantes do evento, como largadas ou palestras.",
    },
    {
      icon: <LockIcon />,
      title: "Níveis de Acesso",
      component: <AccessLevelsCard />,
      description:
        "Configuração dos níveis de acesso para organizadores e colaboradores.",
    },
  ];

  return (
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
          boxShadow: "0 4px 12px rgba(1, 1, 1, 1)",
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
          padding: isSmallScreen ? "0 20px" : "0", // Adicionando padding nas laterais no mobile para garantir espaço
          width: "100%",
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row", // Em telas pequenas, exibir como coluna
          alignItems: isSmallScreen ? "unset" : "center",
          justifyContent: isSmallScreen ? "unset" : "center", // Centraliza o conteúdo apenas em telas grandes
          overflowX: isSmallScreen ? "scroll" : "unset", // Scroll no mobile
          whiteSpace: isSmallScreen ? "nowrap" : "normal", // Impede quebra de linha no mobile
          gap: isSmallScreen ? "20px" : "unset", // Espaço entre os elementos em mobile
        }}
      >
        <Stepper
          alternativeLabel
          sx={{
        minWidth: isSmallScreen ? "600px" : "unset", // Definindo um mínimo para mobile
        whiteSpace: "normal", // Permite que o texto quebre em múltiplas linhas
        justifyContent: "center", // Centralizar os steps
        marginBottom: "10px", // Garantir espaço inferior para o Stepper
          }}
        >
          {steps.map((step, index) => (
        <Step key={index}>
          <StepLabel
            StepIconComponent={StepIconComponent}
            sx={{
          "& .MuiStepLabel-label": {
            display: "block", // Forçar o label a ser um bloco
            fontSize: isSmallScreen ? "12px" : "14px", // Ajustar a fonte para telas menores
            maxWidth: "160px", // Limita a largura do label para forçar a quebra de linha
            textAlign: "center", // Centralizar o texto
            whiteSpace: "normal", // Permitir quebra de linha
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
        marginTop: "20px", // Sempre manter margem superior no mobile
        width: isSmallScreen ? "100%" : "auto", // O botão ocupa 100% da tela no mobile
        zIndex: 10,
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
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    {card.icon}
                    <Typography
                      variant="h6"
                      sx={{
                        marginLeft: "8px",
                        fontWeight: expandedCard === index ? "bold" : "normal",
                      }}
                    >
                      {card.title}
                    </Typography>
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
    </Box>
  );
};

export default OrganizatorEventDetail;
