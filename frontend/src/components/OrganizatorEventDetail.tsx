import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Card, CardContent, Button, IconButton } from "@mui/material";
import { useParams, Link, useNavigate } from "react-router-dom"; // Importando Link e useNavigate para navegação
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Ícone de seta

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

// Importando a logo
import logo from '../assets/logo.png'; // Importando a logo da Eventues

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
  event_status: string;
}

// Menu lateral com estilo moderno e minimalista
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

  const navigate = useNavigate(); // Função para navegação

  return (
    <Box
      sx={{
        width: "250px",
        backgroundColor: "#F7FAFC",
        minHeight: "100vh",
        padding: "10px 20px",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)", // Sombra para separar a sidebar do conteúdo
        borderRight: "1px solid #CBD5E0", // Linha vertical para delimitar o menu
      }}
    >
      {/* Adicionando a logo da Eventues com link para a página inicial */}
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <IconButton onClick={() => navigate('/meus_eventos')} sx={{ marginRight: "10px" }}>
          <ArrowBackIcon />
        </IconButton>
        <Link to="/">
          <img src={logo} alt="Eventues Logo" style={{ maxWidth: "150px", cursor: "pointer" }} />
        </Link>
      </Box>

      {tabs.map((tab) => (
        <Box
          key={tab.name}
          sx={{
            display: "flex",
            alignItems: "center",
            padding: "10px 5px", // Reduzi o padding para menos espaçamento entre os itens
            cursor: "pointer",
            fontWeight: selectedTab === tab.name ? "bold" : "normal",
            color: selectedTab === tab.name ? "#5A67D8" : "#2D3748",
            backgroundColor: selectedTab === tab.name ? "#EDF2F7" : "#FFFFFF",
            borderRadius: "8px",
            transition: "background-color 0.3s, box-shadow 0.3s",
            "&:hover": {
              backgroundColor: "#EDF2F7",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Sombra ao passar o mouse
            },
          }}
          onClick={() => onSelectTab(tab.name)}
        >
          {tab.icon}
          <Typography
            variant="h6"
            sx={{
              marginLeft: "10px",
              fontSize: "15px", // Diminuí o tamanho da fonte para corresponder ao espaçamento reduzido
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
              <Card
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
                    <Typography variant="h5" sx={{ color: "#5A67D8", fontWeight: "bold" }}>
                      {eventDetail.name}
                    </Typography>
                    <Box
                      sx={{
                        marginLeft: "10px",
                        padding: "5px 15px",
                        borderRadius: "20px",
                        backgroundColor:
                          eventDetail.event_status === "Rascunho"
                            ? "#A0AEC0" // Cinza para rascunho
                            : eventDetail.event_status === "Inscrições abertas"
                            ? "#48BB78" // Verde para inscrições abertas
                            : eventDetail.event_status === "Inscrições encerradas"
                            ? "#F56565" // Vermelho para inscrições encerradas
                            : "#CBD5E0", // Padrão, cinza claro
                        color: "#FFF",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {eventDetail.event_status}
                    </Box>
                  </Box>

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

                  <Box sx={{ display: "flex", marginTop: "20px", gap: "10px" }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#5A67D8",
                        "&:hover": { backgroundColor: "#434190" },
                      }}
                    >
                      Ver página do evento
                    </Button>

                    {/* Botões extras de acordo com o status */}
                    {eventDetail.event_status === "Rascunho" && (
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#48BB78",
                          "&:hover": { backgroundColor: "#38A169" },
                        }}
                      >
                        Publicar Evento
                      </Button>
                    )}
                    {eventDetail.event_status === "Inscrições abertas" && (
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "#F56565",
                          "&:hover": { backgroundColor: "#E53E3E" },
                        }}
                      >
                        Encerrar Inscrições
                      </Button>
                    )}
                  </Box>
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
