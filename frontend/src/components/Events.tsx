import React from 'react';
import { Grid, Box, Card, CardMedia, CardContent, Typography, Chip } from '@mui/material';

const eventsData = [
  {
    id: 1,
    title: "XC Run Búzios 2024",
    date: "19/10/2024",
    location: "Armação dos Búzios, RJ",
    image: "https://cdn.ticketsports.com.br/ticketagora/images/G90C0HP81FEOG1W4F11PIOVMGLGNPGFXSDTERGQKSSI5LG6TUC.png",
  },
  {
    id: 2,
    title: "1º RioEco Dance Festival",
    date: "14/09/2024",
    location: "Rio de Janeiro, RJ",
    image: "https://cdn.ticketsports.com.br/ticketagora/images/JMPY6T7VJKH6USKXX57FKPFR5H2YVC7FQHCI91DJHOCOS6MYZW.png",
  },
  {
    id: 3,
    title: "11ª Ultramaratona 12 Horas",
    date: "30/03/2025",
    location: "Macaé, RJ",
    image: "https://cdn.ticketsports.com.br/ticketagora/images/6NW4L4ETXK302QPCT3GDRJUEZKYV7KFBVEP0DBE62SU1NTALKB.png",
  },
  {
    id: 4,
    title: "12º Ultradesafio Sana",
    date: "14/09/2024",
    location: "Macaé, RJ",
    image: "https://cdn.ticketsports.com.br/ticketagora/images/3RYOAH3ETBNCIVWO3DW8LP38QD6JQYIC8AE3PV6YHBEPWKHIRP.png",
  },
];

const EventCard: React.FC<{ title: string, date: string, location: string, image: string }> = ({ title, date, location, image }) => (
  <Card sx={{ maxWidth: 300 }}>
    <CardMedia
      component="img"
      height="150"
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
    </CardContent>
  </Card>
);

const Events: React.FC = () => {
  return (
    <Box sx={{ padding: '40px 0', backgroundColor: '#F7FAFC'}}>
      <Typography variant="h4" align="center" gutterBottom sx={{ marginTop: '40px', marginBottom: '40px', color: '#2D3748' }}>
        Próximos Eventos
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {eventsData.map((event) => (
          <Grid item key={event.id}>
            <EventCard title={event.title} date={event.date} location={event.location} image={event.image} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Events;
