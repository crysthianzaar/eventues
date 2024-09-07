import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography, Card, CardContent, Grid } from "@mui/material";
import axios from "axios";

interface Event {
  id: number;
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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const userId = localStorage.getItem("user_id")?.replace(/-/g, ""); // Obter user_id sem hífens
        if (!userId) {
          setError("Erro: Usuário não autenticado.");
          setLoading(false);
          return;
        }
  
        // Adicionando o tipo de resposta esperada (<Event[]>)
        const response = await axios.get<Event[]>(`http://127.0.0.1:8000/list_events?user_id=${userId}`);
        setEvents(response.data); // Agora o TypeScript reconhece que response.data é do tipo Event[]
      } catch (err) {
        setError("Erro ao carregar eventos.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchEvents();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px" }}>
        Meus Eventos
      </Typography>
      <Grid container spacing={3}>
        {events.length > 0 ? (
          events.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{event.name}</Typography>
                  <Typography variant="body2">Categoria: {event.category}</Typography>
                  <Typography variant="body2">
                    Data: {new Date(event.start_date).toLocaleDateString()} -{" "}
                    {new Date(event.end_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Local: {event.city}, {event.state}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1">Você ainda não criou nenhum evento.</Typography>
        )}
      </Grid>
    </Box>
  );
};

export default MyEvents;
