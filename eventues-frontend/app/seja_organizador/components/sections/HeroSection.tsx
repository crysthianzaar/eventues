"use client";

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: '100vh', md: '80vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage:
          'url(https://cdn.pixabay.com/photo/2018/05/15/23/02/football-stadium-3404535_1280.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      />
      <Container
        sx={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          color: '#FFF',
          px: { xs: 2, sm: 4 },
        }}
      >
        <Image
          src="/icon_eventues.png"
          alt="Eventues Icon"
          width={75}
          height={75}
          style={{ marginBottom: '20px' }}
        />
        <Typography
          variant={isMobile ? 'h5' : 'h2'}
          sx={{
            fontWeight: 'bold',
            mb: 2,
            color: '#5A67D8',
            textShadow: '4px 4px 4px rgba(0.5, 0.5, 0.5, 0.5)',
          }}
        >
          Por que Escolher a Eventues?
        </Typography>
        <Typography
          variant={isMobile ? 'body1' : 'h5'}
          sx={{ mb: 3, textShadow: '4px 4px 4px rgba(0.5, 0.5, 0.5, 0.5)' }}
        >
          Somos mais que uma plataforma de inscrições e venda de ingressos, somos seu parceiro completo na gestão de eventos. Com preços competitivos e suporte dedicado, oferecemos todas as ferramentas e recursos que você precisa para organizar e promover seus eventos com facilidade e eficiência.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 'bold',
              width: { xs: '100%', sm: 'auto' },
              py: { xs: 1.5, sm: 1 },
            }}
            onClick={() => router.push('/criar_evento')}
          >
            Crie seu Evento Agora
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: '8px',
              color: '#FFF',
              borderColor: '#FFF',
              textTransform: 'none',
              fontWeight: 'bold',
              width: { xs: '100%', sm: 'auto' },
              py: { xs: 1.5, sm: 1 },
            }}
            onClick={() => {
              const element = document.getElementById('benefits');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Saiba Mais
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
