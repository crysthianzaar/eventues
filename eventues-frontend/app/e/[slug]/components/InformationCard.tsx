import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Box,
  IconButton,
  Stack,
  useTheme
} from '@mui/material';
import { 
  CalendarMonth, 
  AccessTime, 
  LocationOn, 
  Person, 
  Category 
} from '@mui/icons-material';
import { formatDate, formatTime } from '@/utils/formatters';

// Matching color palette with EventDetails
const colors = {
  primary: "#4F46E5",
  secondary: "#10B981",
  surface: {
    light: "#FFFFFF",
    accent: "#F3F4F6",
    highlight: "#EEF2FF"
  },
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    accent: "#4F46E5"
  },
  border: {
    light: "#E5E7EB",
    accent: "#818CF8"
  },
  gradient: {
    light: "linear-gradient(135deg, #EEF2FF 0%, #F3F4F6 100%)"
  }
};

interface InformationCardProps {
  event: {
    name: string;
    event_type: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    city: string;
    state: string;
    address: string;
    organization_name: string;
  };
}

export default function InformationCard({ event }: InformationCardProps) {
  const theme = useTheme();
  const startDate = formatDate(event?.start_date);
  const endDate = formatDate(event?.end_date);
  const startTime = formatTime(event?.start_time);
  const endTime = formatTime(event?.end_time);

  const InfoItem = ({ 
    icon, 
    title, 
    content
  }: { 
    icon: React.ReactNode; 
    title: string; 
    content: string;
  }) => (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: 2, 
        mb: 3,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateX(4px)'
        }
      }}
    >
      <IconButton
        sx={{
          backgroundColor: colors.surface.highlight,
          color: colors.primary,
          border: `2px solid ${colors.border.accent}`,
          '&:hover': { 
            backgroundColor: colors.surface.highlight,
            transform: 'rotate(5deg)'
          },
          width: 44,
          height: 44,
          transition: 'transform 0.2s ease'
        }}
      >
        {icon}
      </IconButton>
      <Box>
        <Typography 
          variant="subtitle2" 
          color="text.secondary" 
          gutterBottom
          sx={{
            fontSize: '0.875rem',
            fontWeight: 500,
            letterSpacing: '0.025em'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="body1"
          sx={{
            color: colors.text.primary,
            fontWeight: 500,
            lineHeight: 1.5
          }}
        >
          {content}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Card 
      elevation={0}
      sx={{ 
        borderRadius: 3,
        overflow: 'visible',
        position: 'relative',
        mt: 2,
        border: `1px solid ${colors.border.light}`,
        background: colors.gradient.light,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{
                fontWeight: 600,
                color: colors.text.primary,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: 0,
                  width: '40px',
                  height: '3px',
                  bgcolor: colors.primary,
                  borderRadius: '2px'
                }
              }}
            >
              Informações do Evento
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>

          <InfoItem
            icon={<Category />}
            title="Tipo do Evento"
            content={event.event_type}
          />

          <InfoItem
            icon={<CalendarMonth />}
            title="Data"
            content={startDate === endDate 
              ? startDate 
              : `${startDate} até ${endDate}`
            }
          />

          <InfoItem
            icon={<LocationOn />}
            title="Local"
            content={`${event.address}, ${event.city} - ${event.state}`}
          />

          <InfoItem
            icon={<Person />}
            title="Organizador"
            content={event.organization_name}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
