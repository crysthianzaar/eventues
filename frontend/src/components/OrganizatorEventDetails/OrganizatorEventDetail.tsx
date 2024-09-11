import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Card, Typography } from "@mui/material";
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

import SummaryCard from './SummaryCard';
import BannerDocumentCard from './BannerDocumentCard';
import InformationCard from './InformationCard';
import TicketsCard from './TicketsCard';
import CouponsCard from './CouponsCard';
import FormCard from './FormCard';
import ParticipantsCard from './ParticipantsCard';
import CheckInCard from './CheckInCard';
import FinanceCard from './FinanceCard';
import AccessLevelsCard from './AccessLevelsCard';

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

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await axios.get<EventDetail>(`http://127.0.0.1:8000/organizator_detail/${event_id}`);
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
      description: "Visão geral do evento, status atual, principais métricas e ações rápidas."
    },
    {
      icon: <ImageIcon />, 
      title: "Banner e Documentos", 
      component: <BannerDocumentCard eventId={event_id!} />, // Passa o eventId corretamente
      description: "Upload e gerenciamento de materiais visuais e documentos importantes."
    },
    {
      icon: <InfoIcon />, 
      title: "Detalhes do Evento", 
      component: <InformationCard />, 
      description: "Informações completas sobre o evento (nome, local, data, descrição)."
    },
    {
      icon: <PolicyIcon />, 
      title: "Políticas do Evento", 
      component: <CouponsCard />, 
      description: "Configuração das políticas de cancelamento, reembolso, e termos de participação."
    },
    {
      icon: <SportsIcon />, 
      title: "Categorias e Valores", 
      component: <CouponsCard />, 
      description: "Definição de categorias de inscrição e respectivos preços."
    },
    {
      icon: <TicketIcon />, 
      title: "Ingressos/Inscrições", 
      component: <TicketsCard />, 
      description: "Gerenciamento de ingressos ou inscrições, controle de disponibilidade e venda."
    },
    {
      icon: <DiscountIcon />, 
      title: "Cupons", 
      component: <CouponsCard />, 
      description: "Criação e gerenciamento de cupons de desconto para participantes."
    },
    {
      icon: <FormIcon />, 
      title: "Formulário de Inscrição", 
      component: <FormCard />, 
      description: "Personalização do formulário que os participantes devem preencher ao se inscrever."
    },
    {
      icon: <PeopleIcon />, 
      title: "Participantes", 
      component: <ParticipantsCard />, 
      description: "Listagem de todos os inscritos, com filtros e opções de exportação."
    },
    {
      icon: <CheckCircleIcon />, 
      title: "Check-In", 
      component: <CheckInCard />, 
      description: "Ferramenta para fazer o check-in dos participantes no dia do evento."
    },
    {
      icon: <AttachMoneyIcon />, 
      title: "Financeiro", 
      component: <FinanceCard />, 
      description: "Resumo financeiro do evento, incluindo taxas pagas, receitas geradas e pagamento de comissões."
    },
    {
      icon: <BarChartIcon />, 
      title: "Relatórios e Estatísticas", 
      component: <FinanceCard />, 
      description: "Dados de performance, como número de visualizações do evento, taxa de conversão, e relatórios detalhados em tempo real."
    },
    {
      icon: <NotificationsIcon />, 
      title: "Mensagens/Notificações", 
      component: <FinanceCard />, 
      description: "Ferramenta de comunicação para enviar e-mails ou notificações para os participantes."
    },
    {
      icon: <CalendarTodayIcon />, 
      title: "Agenda/Cronograma", 
      component: <FinanceCard />, 
      description: "Ferramenta para gerenciar datas e horários importantes do evento, como largadas ou palestras."
    },
    {
      icon: <LockIcon />, 
      title: "Níveis de Acesso", 
      component: <AccessLevelsCard />, 
      description: "Configuração dos níveis de acesso para organizadores e colaboradores."
    },
  ];
  

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#F7FAFC" }}>
      {/* Nome do evento centralizado */}
      {eventDetail && (
        <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "20px",
          marginTop: "20px", // Adicionando margem superior
          paddingX: { xs: "20px", md: "0px" },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            color: colors.primary,
            fontWeight: "bold",
            fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" }, // Ajuste do tamanho da fonte conforme o tamanho da tela
          }}
        >
          {eventDetail.name}
        </Typography>
        <Box
          sx={{
            marginLeft: "10px",
            padding: "5px 15px",
            borderRadius: "20px",
            backgroundColor:
              eventDetail.event_status === "Rascunho"
                ? colors.grayLight
                : eventDetail.event_status === "Inscrições abertas"
                ? colors.green
                : eventDetail.event_status === "Inscrições encerradas"
                ? colors.red
                : colors.grayLight,
            color: "#FFF",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {eventDetail.event_status}
        </Box>
      </Box>
      
      )}

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, flexGrow: 1 }}>
        {/* Cards à esquerda */}
        <Box
          sx={{
            flexBasis: { xs: "100%", md: expandedCard !== null ? "20%" : "100%" },
            transition: "flex-basis 0.5s ease",
          }}
        >
          {cards.map((card, index) => (
            <React.Fragment key={index}>
              <Card
                sx={{
                  marginBottom: "8px",
                  padding: "8px",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "box-shadow 0.3s, padding 0.3s",
                  "&:hover": {
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
                    padding: "10px",
                  },
                  backgroundColor: expandedCard === index ? colors.backgroundCardExpanded : colors.white,
                }}
                onClick={() => handleExpand(index)}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {card.icon}
                  <Typography
                    variant="h6"
                    sx={{
                      marginLeft: "8px",
                      color: expandedCard === index ? colors.primary : colors.grayDark,
                      fontWeight: expandedCard === index ? "bold" : "normal",
                    }}
                  >
                    {card.title}
                  </Typography>
                </Box>
              </Card>

              {/* Em dispositivos móveis, expande o conteúdo logo abaixo do card selecionado */}
              {expandedCard === index && (
                <Box
                  sx={{
                    display: { xs: "block", md: "none" }, // Mostra somente em mobile (xs)
                    minHeight: "100%",
                    transition: "flex-basis 0.5s ease",
                    backgroundColor: colors.white,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    borderRadius: "10px",
                    marginTop: { xs: "8px", md: "0" }, // Margem no mobile
                    padding: "15px",
                  }}
                >
                  {cards[expandedCard].component}
                </Box>
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Em telas grandes (md+), o conteúdo será expandido ao lado */}
        {expandedCard !== null && (
          <Box
            sx={{
              flexBasis: "80%", // Ocupa 80% da largura da tela em md+
              display: { xs: "none", md: "block" }, // Somente para telas md+ (desktop)
              minHeight: "100%",
              transition: "flex-basis 0.5s ease",
              backgroundColor: colors.white,
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              marginLeft: "10px",
              padding: "15px",
            }}
          >
            {cards[expandedCard].component}
          </Box>
        )}
      </Box>

      {/* Footer com a mesma cor do sidebar */}
      <Box
        sx={{
          backgroundColor: colors.footerBackground,
          padding: "20px",
          textAlign: "center",
          marginTop: "auto",
        }}
      >
        <Typography sx={{ color: colors.white }}>© 2024 Eventues. Todos os direitos reservados.</Typography>
      </Box>
    </Box>
  );
};

export default OrganizatorEventDetail;
