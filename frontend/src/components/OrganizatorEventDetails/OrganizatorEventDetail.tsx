import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Card, CardContent, Collapse, IconButton, Typography } from "@mui/material";
import { useParams } from "react-router-dom"; 
import axios from "axios";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; 
import DashboardIcon from "@mui/icons-material/Dashboard";
import ImageIcon from "@mui/icons-material/Image";
import InfoIcon from "@mui/icons-material/Info";
import TicketIcon from "@mui/icons-material/ConfirmationNumber";
import DiscountIcon from "@mui/icons-material/LocalOffer";
import FormIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PaymentIcon from "@mui/icons-material/AttachMoney";
import LockIcon from "@mui/icons-material/Lock";

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
  grayDark: "#2D3748",
  white: "#FFFFFF", 
  backgroundCardExpanded: "#EBF4FF", 
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
    { icon: <DashboardIcon />, title: "Resumo", component: <SummaryCard eventDetail={eventDetail} /> },
    { icon: <ImageIcon />, title: "Banner e Documentos", component: <BannerDocumentCard /> },
    { icon: <InfoIcon />, title: "Informações", component: <InformationCard /> },
    { icon: <TicketIcon />, title: "Ingressos/Inscrições", component: <TicketsCard /> },
    { icon: <DiscountIcon />, title: "Cupons", component: <CouponsCard /> },
    { icon: <FormIcon />, title: "Formulário de Inscrição", component: <FormCard /> },
    { icon: <PeopleIcon />, title: "Participantes", component: <ParticipantsCard /> },
    { icon: <CheckCircleIcon />, title: "Check-In", component: <CheckInCard /> },
    { icon: <PaymentIcon />, title: "Financeiro", component: <FinanceCard /> },
    { icon: <LockIcon />, title: "Níveis de Acesso", component: <AccessLevelsCard /> },
  ];

  return (
    <Box sx={{ width: "100%", padding: "20px", backgroundColor: "#F7FAFC" }}>
      {cards.map((card, index) => (
        <Card
          key={index}
          sx={{
            marginBottom: "15px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            borderRadius: "10px",
            transition: "box-shadow 0.3s",
            "&:hover": {
              boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "15px",
              backgroundColor: expandedCard === index ? colors.backgroundCardExpanded : colors.white,
              cursor: "pointer",
            }}
            onClick={() => handleExpand(index)}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {card.icon}
              <Typography
                variant="h6"
                sx={{
                  marginLeft: "10px",
                  color: expandedCard === index ? colors.primary : colors.grayDark,
                  fontWeight: expandedCard === index ? "bold" : "normal",
                }}
              >
                {card.title}
              </Typography>
            </Box>
            <IconButton>
              <ExpandMoreIcon
                sx={{ color: expandedCard === index ? colors.primary : colors.grayDark }}
              />
            </IconButton>
          </Box>

          <Collapse in={expandedCard === index} timeout="auto" unmountOnExit>
            <CardContent>{card.component}</CardContent>
          </Collapse>
        </Card>
      ))}
    </Box>
  );
};

export default OrganizatorEventDetail;
