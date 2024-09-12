import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Card,
  Typography,
  Tooltip,
  useMediaQuery,
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

const colors = {
  primary: "#5A67D8",
  green: "#48BB78",
  red: "#F56565",
  grayDark: "#2D3748",
  grayLight: "#CBD5E0",
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

const OrganizatorEventDetail: React.FC = () => {
  const { event_id } = useParams<{ event_id: string }>();
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(0);

  // Responsividade: verifica se a tela é pequena
  const isSmallScreen = useMediaQuery("(max-width: 600px)");

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await axios.get<EventDetail>(
          `http://127.0.0.1:8000/organizator_detail/${event_id}`
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
      icon: <ImageIcon />,
      title: "Banner e Documentos",
      component: <BannerDocumentCard eventId={event_id!} />,
      description:
        "Upload e gerenciamento de materiais visuais e documentos importantes.",
    },
    {
      icon: <InfoIcon />,
      title: "Detalhes do Evento",
      component: <InformationCard />,
      description:
        "Informações completas sobre o evento (nome, local, data, descrição).",
    },
    {
      icon: <PolicyIcon />,
      title: "Políticas",
      component: <CouponsCard />,
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
      icon: <FormIcon />,
      title: "Formulário de Inscrição",
      component: <FormCard />,
      description:
        "Personalização do formulário que os participantes devem preencher ao se inscrever.",
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
          height: isSmallScreen ? "150px" : "200px", // Ajuste de tamanho para mobile
          backgroundImage: `url(${banner_template})`, // Usando a imagem do logo como fundo
          backgroundSize: "cover", // Para cobrir todo o espaço do banner
          backgroundPosition: "center", // Centraliza a imagem
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(1, 1, 1, 1)", // Sombra para profundidade
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
              variant={isSmallScreen ? "h5" : "h3"} // Tamanho do texto ajustado para telas pequenas
              sx={{
                fontWeight: "bold",
                textTransform: "uppercase",
                marginTop: "10px",
              }}
            >
              {eventDetail.name}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LocationOnIcon sx={{ marginRight: "8px" }} />
              <Typography variant={isSmallScreen ? "body1" : "h6"}>
                {eventDetail.city}, {eventDetail.state}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row", // Em telas pequenas, as seções ficam empilhadas
          flexGrow: 1,
          padding: "15px",
        }}
      >
        {/* Sidebar com as seções */}
        <Box
          sx={{
            flexBasis: isSmallScreen ? "100%" : "20%", // Sidebar ocupa toda a largura em telas pequenas
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

              {/* Exibir o conteúdo logo abaixo do card em telas pequenas */}
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
              flexBasis: "80%", // Em telas grandes, o conteúdo ocupa o espaço lateral
              padding: "20px",
              backgroundColor: colors.white,
              borderRadius: "15px", // Borda arredondada
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // Sombra suave
              transition: "all 0.3s ease-in-out", // Suavização da transição
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
