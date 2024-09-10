import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';

// Paleta de cores Eventues
const colors = {
  primary: "#5A67D8", 
  green: "#48BB78", 
  red: "#F56565", 
  grayDark: "#2D3748", 
  grayLight: "#CBD5E0", // Cinza claro padrão para status neutro
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

interface SummaryCardProps {
  eventDetail: EventDetail | null;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ eventDetail }) => {
  return (
    <Box>
      {eventDetail && (
        <Card
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          }}
        >
          <CardContent>
            {/* Nome do evento com status ao lado */}
            <Box sx={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
              <Typography variant="h5" sx={{ color: colors.primary, fontWeight: "bold" }}>
                {eventDetail.name}
              </Typography>
              <Box
                sx={{
                  marginLeft: "10px",
                  padding: "5px 15px",
                  borderRadius: "20px",
                  backgroundColor:
                    eventDetail.event_status === "Rascunho"
                      ? colors.grayLight // Cinza para rascunho
                      : eventDetail.event_status === "Inscrições abertas"
                      ? colors.green // Verde para inscrições abertas
                      : eventDetail.event_status === "Inscrições encerradas"
                      ? colors.red // Vermelho para inscrições encerradas
                      : colors.grayLight, // Padrão, cinza claro
                  color: "#FFF",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {eventDetail.event_status}
              </Box>
            </Box>

            {/* Detalhes do evento */}
            <Typography variant="body2" sx={{ color: colors.grayDark }}>
              Categoria: {eventDetail.category}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grayDark }}>
              Data: {new Date(eventDetail.start_date).toLocaleDateString()} -{" "}
              {new Date(eventDetail.end_date).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grayDark }}>
              Horário: {eventDetail.start_time} - {eventDetail.end_time}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grayDark }}>
              Local: {eventDetail.city}, {eventDetail.state}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grayDark }}>
              Visualizações: {eventDetail.views}
            </Typography>
            <Typography variant="body2" sx={{ color: colors.grayDark }}>
              Visibilidade: {eventDetail.visibility}
            </Typography>

            {/* Ações do evento */}
            <Box sx={{ display: "flex", marginTop: "20px", gap: "10px" }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: colors.primary,
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
                    backgroundColor: colors.green,
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
                    backgroundColor: colors.red,
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
    </Box>
  );
};

export default SummaryCard;
