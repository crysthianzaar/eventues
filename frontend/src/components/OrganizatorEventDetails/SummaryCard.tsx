import React from 'react';
import { Box, Typography, Button, CardContent } from '@mui/material';

// Paleta de cores Eventues
const colors = {
  primary: "#5A67D8",
  green: "#48BB78",
  red: "#F56565",
  grayDark: "#2D3748",
  white: "#FFFFFF",
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
    <Box sx={{ padding: { xs: '20px', md: '40px' }, maxWidth: { xs: '100%', md: '1400px' }, margin: '0 auto' }}>
      {eventDetail && (
        <CardContent>
          <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '10px' }}>
            Categoria: {eventDetail.category}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '10px' }}>
            Data: {new Date(eventDetail.start_date).toLocaleDateString()} -{" "}
            {new Date(eventDetail.end_date).toLocaleDateString()}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '10px' }}>
            Horário: {eventDetail.start_time} - {eventDetail.end_time}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '10px' }}>
            Local: {eventDetail.city}, {eventDetail.state}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '10px' }}>
            Visualizações: {eventDetail.views}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '10px' }}>
            Visibilidade: {eventDetail.visibility}
          </Typography>

          <Box sx={{ display: 'flex', marginTop: '20px', gap: '10px' }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: colors.primary,
                "&:hover": { backgroundColor: "#434190" },
                padding: '10px 20px',
              }}
            >
              Ver página do evento
            </Button>

            {eventDetail.event_status === "Rascunho" && (
              <Button
                variant="contained"
                sx={{
                  backgroundColor: colors.green,
                  "&:hover": { backgroundColor: "#38A169" },
                  padding: '10px 20px',
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
                  padding: '10px 20px',
                }}
              >
                Encerrar Inscrições
              </Button>
            )}
          </Box>
        </CardContent>
      )}
    </Box>
  );
};

export default SummaryCard;
