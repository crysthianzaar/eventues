import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography, Card, CardContent, Grid, Button } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Importando o hook de navegação
import EventIcon from "@mui/icons-material/Event"; // Ícone de evento para melhorar o design visual
import axios from "axios";

interface Event {
  id: number;
  event_id: string; // Certifique-se de que event_id está corretamente definido
  name: string;
  category: string;
  start_date: string;
  end_date: string;
  city: string;
  state: string;
  event_status: string; // Adicionando o status do evento
}

const colors = {
  primary: "#5A67D8",
  green: "#48BB78",
  red: "#F56565",
  grayDark: "#2D3748",
  grayLight: "#CBD5E0",
  white: "#FFFFFF",
};

const MyEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Inicialize o hook de navegação

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userId = localStorage.getItem("user_id")?.replace(/-/g, ""); // Obter user_id sem hífens
        if (!userId) {
          setError("Erro: Usuário não autenticado.");
          setLoading(false);
          return;
        }

        const response = await axios.get<Event[]>(`http://127.0.0.1:8000/list_events?user_id=${userId}`);
        setEvents(response.data);
      } catch (err) {
        setError("Erro ao carregar eventos.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleCardClick = (event_id: string) => {
    navigate(`/event_detail/${event_id}`); // Redireciona para os detalhes do evento
  };

  if (loading) {
    return <CircularProgress sx={{ color: colors.primary }} />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#F7FAFC", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", color: colors.primary, fontWeight: "bold" }}>
        Meus Eventos
      </Typography>
      <Grid container spacing={3}>
        {events.length > 0 ? (
          events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card
                sx={{
                  backgroundColor: colors.white,
                  borderRadius: "10px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                  transition: "transform 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
                onClick={() => handleCardClick(event.event_id)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" sx={{ color: colors.primary, fontWeight: "bold" }}>
                      {event.name}
                    </Typography>
                    <Box
                      sx={{
                        padding: "5px 15px",
                        borderRadius: "20px",
                        backgroundColor:
                          event.event_status === "Rascunho"
                            ? colors.grayLight
                            : event.event_status === "Inscrições abertas"
                            ? colors.green
                            : event.event_status === "Inscrições encerradas"
                            ? colors.red
                            : colors.grayLight,
                        color: "#FFF",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {event.event_status}
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: colors.grayDark }}>
                    Categoria: {event.category}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.grayDark }}>
                    Data: {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.grayDark }}>
                    Local: {event.city}, {event.state}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: "60vh" }}>
            <Grid item xs={12} sm={8} md={6}>
              <Box sx={{ textAlign: "center", padding: "20px", backgroundColor: colors.white, borderRadius: "12px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)" }}>
                <EventIcon sx={{ fontSize: "80px", color: colors.grayLight }} />
                <Typography variant="h6" sx={{ color: colors.grayDark, fontWeight: "bold", marginTop: "20px" }}>
                  Você ainda não criou nenhum evento.
                </Typography>
                <Typography variant="body1" sx={{ color: colors.grayLight, marginTop: "10px" }}>
                  Que tal criar seu primeiro evento agora mesmo?
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: "20px", backgroundColor: colors.green, color: "#FFF", fontWeight: "bold" }}
                  onClick={() => navigate("/criar_evento")}
                >
                  Criar Evento
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default MyEvents;
