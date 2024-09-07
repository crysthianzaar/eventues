import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Card, CardContent } from "@mui/material";
import { useParams } from "react-router-dom"; // Para capturar o event_id da URL
import axios from "axios";

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
}

const OrganizatorEventDetail: React.FC = () => {
  const { event_id } = useParams<{ event_id: string }>();
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    return <CircularProgress sx={{ color: "#5A67D8" }} />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ padding: "20px", backgroundColor: "#F7FAFC", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px", color: "#5A67D8", fontWeight: "bold" }}>
        Detalhes do Evento
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
              Data: {new Date(eventDetail.start_date).toLocaleDateString()} - {new Date(eventDetail.end_date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" sx={{ color: "#2D3748" }}>
              Horário: {eventDetail.start_time} - {eventDetail.end_time}
            </Typography>
            <Typography variant="body2" sx={{ color: "#2D3748" }}>
              Local: {eventDetail.city}, {eventDetail.state}
            </Typography>
            <Typography variant="body2" sx={{ color: "#2D3748" }}>
              Organizador: {eventDetail.organization_name}
            </Typography>
            <Typography variant="body2" sx={{ color: "#2D3748" }}>
              Contato: {eventDetail.organization_contact}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default OrganizatorEventDetail;
