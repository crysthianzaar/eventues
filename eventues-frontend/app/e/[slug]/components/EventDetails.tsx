"use client";

import React, { useEffect, useState } from 'react';
import { 
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Paper,
  Chip
} from '@mui/material';
import { Share as ShareIcon } from '@mui/icons-material';
import InformationCard from './InformationCard';
import axios from 'axios';

interface DocumentFile {
  s3_key: string;
  file_name: string;
  title?: string;
  url: string;
}

interface EventDetailsProps {
  event: {
    event_id: string;
    name: string;
    event_type: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    city: string;
    state: string;
    address: string;
    event_description: string;
    organization_name: string;
    banner_image_url: string;
    slug: string;
  };
}

// Define a paleta de cores
const colors = {
  primary: "#5A67D8", // Azul
  secondary: "#68BB78", // Verde
  lightBlue: "#63B3ED", // Azul Claro
  grayLight: "#EDF2F7",
  grayDark: "#2D3748",
  white: "#FFFFFF",
  red: "#E53E3E",
};

export default function EventDetails({ event }: EventDetailsProps) {
  const [bannerUrl, setBannerUrl] = useState<string>("");

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get<DocumentFile[]>(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer_detail/${event.event_id}/get_document_files`
        );
        
        const bannerFile = response.data.find((file) => 
          file.file_name.toLowerCase().includes('banner')
        );

        if (bannerFile?.url) {
          setBannerUrl(bannerFile.url);
        } else {
          setBannerUrl("/images/default_banner.jpg");
        }
      } catch (error) {
        console.error('Error fetching banner:', error);
        setBannerUrl("/images/default_banner.jpg");
      }
    };

    fetchBanner();
  }, [event.event_id]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event.name,
        text: `Confira ${event.name} em ${event.city}`,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 1 }}>
      <Grid container spacing={4}>
        {/* Banner e Informações Principais */}
        <Grid item xs={12}>
          <Card 
            elevation={3}
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <CardMedia
              component="img"
              height="400"
              image={bannerUrl}
              alt={`Banner do evento ${event.name}`}
              sx={{
                objectFit: 'cover',
                filter: 'brightness(0.9)'
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)',
                color: colors.white,
                p: 4,
                pt: 12 // Aumenta o padding-top para o gradiente ter mais espaço
              }}
            >
              <Chip
                label={event.event_type}
                color="primary"
                size="small"
                sx={{ 
                  mb: 2,
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: colors.primary,
                  fontWeight: 500
                }}
              />
              
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  fontWeight: 700
                }}
              >
                {event.name}
              </Typography>
              
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.9,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                Por {event.organization_name}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Ações */}
        <Grid item xs={12}>
          <Paper 
            elevation={2}
            sx={{ 
              p: 2,
              borderRadius: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              bgcolor: colors.white
            }}
          >
            <Button
              variant="contained"
              size="large"
              href={`/e/${event.slug}/tickets`}
              sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1.1rem',
              bgcolor: colors.primary,
              '&:hover': {
                bgcolor: '#4C5BC0'
              }
              }}
            >
              {event.event_type.toLowerCase() === 'esportivo' ? 'Se Inscrever' : 'Garantir Ingresso'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={handleShare}
              sx={{
                color: colors.primary,
                borderColor: colors.primary,
                '&:hover': {
                  borderColor: '#4C5BC0',
                  color: '#4C5BC0'
                }
              }}
            >
              Compartilhar
            </Button>
          </Paper>
        </Grid>

        {/* Grid Principal */}
        <Grid container item spacing={4}>
          {/* Coluna da Esquerda - Descrição */}
          <Grid item xs={12} md={8}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: colors.white
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom color={colors.grayDark}>
                  Sobre o Evento
                </Typography>
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: event.event_description }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Coluna da Direita - Informações */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              <InformationCard event={event} />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
