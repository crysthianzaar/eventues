'use client';

import { Typography } from '@mui/material';

interface EventInfoProps {
  eventName: string;
  eventLocation: string | null;
  eventDate: string;
  formatDate: (dateString: string) => string;
}

const EventInfo = ({ eventName, eventLocation, eventDate, formatDate }: EventInfoProps) => {
  return (
    <>
      <Typography variant="h5" gutterBottom>
        {eventName}
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        {eventLocation}
      </Typography>
      <Typography variant="body1" paragraph>
        <strong>Data do Evento:</strong> {formatDate(eventDate)}
      </Typography>
    </>
  );
};

export default EventInfo;
