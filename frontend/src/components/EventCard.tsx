import React from 'react';
import { Card, CardMedia, CardContent, Typography, Chip, Button } from '@mui/material';

const EventCard: React.FC<{ title: string, date: string, location: string, image: string }> = ({ title, date, location, image }) => (
  <Card sx={{ maxWidth: 300, boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', borderRadius: '10px' }}>
    <CardMedia
      component="img"
      height="180"
      image={image}
      alt={title}
    />
    <CardContent>
      <Chip label="Inscrições abertas" color="success" sx={{ marginBottom: '10px' }} />
      <Typography variant="h6" component="h3" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        <i className="bi bi-calendar"></i> {date}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        <i className="bi bi-geo-alt"></i> {location}
      </Typography>
      <Button variant="contained" fullWidth sx={{ backgroundColor: '#68D391', marginTop: '10px' }}>Inscreva-se</Button>
    </CardContent>
  </Card>
);

export default EventCard;
