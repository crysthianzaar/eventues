import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Box,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import { 
  CalendarMonth, 
  AccessTime, 
  LocationOn, 
  Person, 
  Category 
} from '@mui/icons-material';
import { formatDate, formatTime } from '@/utils/formatters';

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
  const startDate = formatDate(event?.start_date);
  const endDate = formatDate(event?.end_date);
  const startTime = formatTime(event?.start_time);
  const endTime = formatTime(event?.end_time);

  const InfoItem = ({ 
    icon, 
    title, 
    content, 
    chip 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    content: string;
    chip?: string;
  }) => (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
      <IconButton
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': { backgroundColor: 'primary.dark' },
          width: 40,
          height: 40,
        }}
      >
        {icon}
      </IconButton>
      <Box>
        <Typography 
          variant="subtitle2" 
          color="text.secondary" 
          gutterBottom
        >
          {title}
        </Typography>
        <Typography variant="body1" paragraph>
          {content}
        </Typography>
        {chip && (
          <Chip
            label={chip}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );

  return (
    <Card 
      elevation={2}
      sx={{ 
        borderRadius: 3,
        overflow: 'visible',
        position: 'relative',
        mt: 2
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Informações do Evento
            </Typography>
            <Divider />
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
            icon={<AccessTime />}
            title="Horário"
            content={`${startTime} às ${endTime}`}
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
