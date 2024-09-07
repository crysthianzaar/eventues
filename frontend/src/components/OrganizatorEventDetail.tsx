import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom"; // Para capturar o event_id da URL
import axios from "axios";

// Importando ícones do Material UI
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

// Interface para detalhes do evento
interface EventDetail {
  name: string;
  category: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  city: string;
  state: string;
  organization_name: string;
  organization_contact: string;
  views: number;
  visibility: string;
}

// Menu lateral para navegação
const SidebarMenu = ({
  selectedTab,
  onSelectTab,
}: {
  selectedTab: string;
  onSelectTab: (tab: string) => void;
}) => {
  const tabs = [
    { name: "Resumo", icon: <DashboardIcon /> },
    { name: "Banner e Documentos", icon: <ImageIcon /> },
    { name: "Informações", icon: <InfoIcon /> },
    { name: "Ingressos", icon: <TicketIcon /> },
    { name: "Cupons", icon: <DiscountIcon /> },
    { name: "Formulário", icon: <FormIcon /> },
    { name: "Participantes", icon: <PeopleIcon /> },
    { name: "Check-in", icon: <CheckCircleIcon /> },
    { name: "Financeiro", icon: <PaymentIcon /> },
    { name: "Níveis de Acesso", icon: <LockIcon /> },
  ];

  return (
    <Box
      sx={{
        width: "250px",
        backgroundColor: "#E2E8F0",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {tabs.map((tab) => (
        <Box
          key={tab.name}
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "10px",
            cursor: "pointer",
            fontWeight: selectedTab === tab.name ? "bold" : "normal",
            color: selectedTab === tab.name ? "#5A67D8" : "#2D3748",
            "&:hover": {
              color: "#5A67D8",
            },
          }}
          onClick={() => onSelectTab(tab.name)}
        >
          {tab.icon}
          <Typography
            variant="h6"
            sx={{
              marginLeft: "10px",
            }}
          >
            {tab.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// Componente principal para renderizar os detalhes do evento
const OrganizatorEventDetail: React.FC = () => {
  const { event_id } = useParams<{ event_id: string }>();
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("Resumo");

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
    return <CircularProgress sx={{ color: "#5A67D8" }} />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  // Função para renderizar a sessão selecionada
  const renderTabContent = () => {
    switch (selectedTab) {
      case "Resumo":
        return (
          <>
            <Typography variant="h4" sx={{ marginBottom: "20px", color: "#5A67D8" }}>
              Detalhes do Evento - Resumo
            </Typography>
            {eventDetail && (
              <Card sx={{ backgroundColor: "#ffffff", borderRadius: "10px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)" }}>
                <CardContent>
                  <Typography variant="h5" sx={{ color: "#5A67D8", fontWeight: "bold" }}>
                    {eventDetail.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#2D3748" }}>
                    Categoria: {eventDetail.category}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#2D3748" }}>
                    Data: {new Date(eventDetail.start_date).toLocaleDateString()} -{" "}
                    {new Date(eventDetail.end_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#2D3748" }}>
                    Horário: {eventDetail.start_time} - {eventDetail.end_time}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#2D3748" }}>
                    Local: {eventDetail.city}, {eventDetail.state}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#2D3748" }}>
                    Visualizações: {eventDetail.views}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#2D3748" }}>
                    Visibilidade: {eventDetail.visibility}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#5A67D8",
                      marginTop: "20px",
                      "&:hover": { backgroundColor: "#434190" },
                    }}
                  >
                    Ver página do evento
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        );
      case "Banner e Documentos":
        return (
          <>
            <Typography variant="h4" sx={{ marginBottom: "20px", color: "#5A67D8" }}>
              Banner e Documentos
            </Typography>
            <Card
              sx={{
                padding: "20px",
                backgroundColor: "#fff",
                borderRadius: "10px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Typography variant="h6" sx={{ marginBottom: "20px", color: "#2D3748" }}>
                Upload de Banner
              </Typography>
              <Box
                sx={{
                  border: "2px dashed #5A67D8",
                  padding: "40px",
                  textAlign: "center",
                  marginBottom: "20px",
                }}
              >
                <Typography>Arraste ou clique aqui para carregar o banner</Typography>
                <Typography sx={{ fontSize: "12px", color: "#718096" }}>
                  Dimensões recomendadas: 1000px x 1000px, formato JPEG ou PNG, até 10MB.
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ marginBottom: "10px", color: "#2D3748" }}>
                Documentos do Evento
              </Typography>
              {["Regulamento do evento", "Termo de retirada para terceiros", "Termo para menores de 18 anos"].map(
                (doc) => (
                  <Box
                    key={doc}
                    sx={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "5px",
                      padding: "10px",
                      marginBottom: "10px",
                      backgroundColor: "#F7FAFC",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography>{doc}</Typography>
                    <Button variant="contained" sx={{ backgroundColor: "#5A67D8" }}>
                      Clique aqui
                    </Button>
                  </Box>
                )
              )}
            </Card>
          </>
        );
      // Adicionar outras sessões conforme necessário (Ingressos, Cupons, etc.)
      default:
        return <Typography>Conteúdo não disponível</Typography>;
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Menu lateral */}
      <SidebarMenu selectedTab={selectedTab} onSelectTab={setSelectedTab} />

      {/* Conteúdo principal */}
      <Box sx={{ flexGrow: 1, padding: "20px", backgroundColor: "#F7FAFC", minHeight: "100vh" }}>
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default OrganizatorEventDetail;
