import React from 'react';
import { Grid, Box, Card, CardMedia, CardContent, Typography, Chip, Button, CardActionArea } from '@mui/material';

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
  <Card
    sx={{
      width: { xs: '100%', sm: '90%', md: '300px' }, // Ajusta a largura do card para telas pequenas
      margin: { xs: '10px auto', md: '0 auto' }, // Centraliza e adiciona margem em telas pequenas
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)', // Sombra preta mais intensa por padrão
      border: '2px solid rgba(0, 0, 0, 0.2)', // Borda preta por padrão
      borderRadius: '20px', // Bordas arredondadas para um visual mais suave
      overflow: 'hidden', // Garante que o conteúdo arredondado fique dentro do card
      transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease', // Transição suave para a transformação, sombra e borda
      '&:hover': {
        transform: 'scale(1.05)', // Aumenta ligeiramente o card ao passar o mouse
        boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)', // Sombra mais intensa ao passar o mouse
        borderColor: '#5A67D8', // Adiciona o contorno azul ao passar o mouse
      },
    }}
  >
    <CardActionArea>
      <CardMedia
        component="img"
        image={image}
        alt={title}
        sx={{
          height: '200px', // Define uma altura fixa para a imagem
          objectFit: 'cover', // A imagem cobre todo o espaço designado sem distorção
        }}
      />
      <CardContent sx={{ height: '150px', overflow: 'hidden' }}> {/* Define a altura do conteúdo e esconde overflow */}
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
    </CardActionArea>
    <Box sx={{ padding: '10px' }}>
      <Button
        variant="contained"
        fullWidth
        sx={{
          backgroundColor: '#5A67D8',
          color: 'white',
          borderRadius: '50px', // Torna o botão mais redondo
          padding: '10px 20px', // Aumenta o padding para um visual mais proeminente
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.3)', // Sombras pretas no botão
          '&:hover': {
            backgroundColor: '#434190',
          },
        }}
      >
        Inscreva-se
      </Button>
    </Box>
  </Card>
);

const Events: React.FC = () => {
  return (
    <Box
      sx={{
        padding: { xs: '40px 10px', md: '40px 0' }, // Adiciona padding nas laterais em telas pequenas
        backgroundColor: '#F7FAFC',
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          marginTop: '40px',
          marginBottom: '40px',
          color: '#2D3748',
        }}
      >
        Próximos Eventos
      </Typography>
      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{ flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }} // Ajusta a direção e alinhamento em telas pequenas
      >
        {eventsData.map((event) => (
          <Grid item key={event.id} sx={{ width: { xs: '100%', md: 'auto' } }}> {/* Ocupa 100% da largura em telas pequenas */}
            <EventCard title={event.title} date={event.date} location={event.location} image={event.image} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Events;
