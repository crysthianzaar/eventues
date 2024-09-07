import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography, Card, CardContent, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Importando o hook de navegação
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
}

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
    return <CircularProgress sx={{ color: "#5A67D8" }} />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#F7FAFC", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", color: "#5A67D8", fontWeight: "bold" }}>
        Meus Eventos
      </Typography>
      <Grid container spacing={3}>
        {events.length > 0 ? (
          events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                  transition: "transform 0.3s ease",
                  cursor: "pointer", // Adiciona cursor pointer para indicar que o card é clicável
                  "&:hover": {
                    transform: "translateY(-5px)",
                  },
                }}
                onClick={() => handleCardClick(event.event_id)} // Chama a função de redirecionamento com o event_id correto
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: "#5A67D8", fontWeight: "bold" }}>
                    {event.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#2D3748" }}>
                    Categoria: {event.category}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#2D3748" }}>
                    Data: {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#2D3748" }}>
                    Local: {event.city}, {event.state}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" sx={{ color: "#2D3748" }}>
            Você ainda não criou nenhum evento.
          </Typography>
        )}
      </Grid>
    </Box>
  );
};

export default MyEvents;
