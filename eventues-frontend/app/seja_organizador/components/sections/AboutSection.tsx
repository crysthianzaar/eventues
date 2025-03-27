"use client";

import React from 'react';
import { Box, Container, Grid, Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useRouter } from 'next/navigation';

const AboutSection = () => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ py: 8, backgroundColor: '#F7F7F7' }}>
      <Container>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <div
              style={{
                padding: '56.25% 0 0 0',
                position: 'relative',
                borderRadius: '12px',
                boxShadow: '10px 10px 30px rgba(0, 0, 0, 0.3)',
              }}
            >
              <iframe
                src="https://player.vimeo.com/video/1023743624?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                title="Seja um Organizador | Eventues"
                allowFullScreen
              />
            </div>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              Simplifique a Gestão do Seu Evento
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              • Com a Eventues, você gerencia tudo em um só lugar, focando no que
              realmente importa: criar experiências incríveis para seu público.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              • Crie seu evento gratuitamente e só pague quando começar a vender e
              pelo que vender.
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              • Receba seus valores antecipadamente, antes do evento acontecer.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mt: 2,
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
                Comece Agora
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutSection;
