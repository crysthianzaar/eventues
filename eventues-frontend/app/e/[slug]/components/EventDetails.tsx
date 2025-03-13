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
  Chip,
  IconButton,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Share as ShareIcon,
  CalendarToday,
  LocationOn,
  AccessTime,
  Groups2
} from '@mui/icons-material';
import InformationCard from './InformationCard';
import axios from 'axios';
import { format } from 'date-fns';
import { formatDate } from '@/utils/formatters';
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

// Paleta de cores moderna e profissional
const colors = {
  primary: "#4F46E5", // Indigo mais vibrante
  secondary: "#10B981", // Verde esmeralda
  accent: "#F59E0B", // Âmbar
  surface: {
    light: "#FFFFFF",
    dark: "#1F2937",
    accent: "#F3F4F6",
    highlight: "#EEF2FF"
  },
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    light: "#FFFFFF",
    accent: "#4F46E5"
  },
  gradient: {
    dark: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)",
    accent: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    light: "linear-gradient(135deg, #EEF2FF 0%, #F3F4F6 100%)"
  },
  border: {
    light: "#E5E7EB",
    accent: "#818CF8"
  }
};

export default function EventDetails({ event }: EventDetailsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [cacheBuster, setCacheBuster] = useState(() => Date.now());
  const [isLoaded, setIsLoaded] = useState(false);

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
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching banner:', error);
        setBannerUrl("/images/default_banner.jpg");
        setIsLoaded(true);
      }
    };

    fetchBanner();
  }, [event.event_id]);

  useEffect(() => {
    setCacheBuster(Date.now());
  }, [bannerUrl]);

  const handleShare = async () => {
    try {
      const shareData = {
        title: `${event.name} - ${event.city}`,
        text: [
          `🎯 ${event.event_type}: ${event.name}`,
          `📅 Data: ${formatEventDate(event.start_date)}`,
          `⏰ Horário: ${event.start_time} às ${event.end_time}`,
          `📍 Local: ${event.city}, ${event.state}`,
          `👥 Organizado por: ${event.organization_name}`,
          '',
          '🎟️ Garanta sua vaga agora!'
        ].join('\n'),
        url: window.location.href,
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\nSaiba mais: ${shareData.url}`
        );
        // You might want to show a toast/notification here
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatEventDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM");
  };

  const EventInfoCard = ({ icon: Icon, title, content }: { icon: any, title: string, content: string }) => (
    <Card 
      elevation={0}
      sx={{ 
        p: 2,
        bgcolor: colors.surface.accent,
        borderRadius: 2,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            bgcolor: colors.primary,
            borderRadius: 1.5,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon sx={{ color: colors.text.light }} />
        </Box>
        <Box>
          <Typography variant="caption" color={colors.text.secondary} gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1" color={colors.text.primary} fontWeight={500}>
            {content}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.event_description,
    startDate: `${event.start_date}T${event.start_time}`,
    endDate: `${event.end_date}T${event.end_time}`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: `${event.city}, ${event.state}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressRegion: event.state,
        streetAddress: event.address,
        addressCountry: 'BR'
      }
    },
    organizer: {
      '@type': 'Organization',
      name: event.organization_name
    },
    image: [
      {
        '@type': 'ImageObject',
        url: bannerUrl,
        width: '1200',
        height: '630'
      }
    ],
    url: window.location.href,
    inLanguage: 'pt-BR',
    offers: {
      '@type': 'Offer',
      url: `${window.location.href}/tickets`,
      availability: 'https://schema.org/InStock',
      priceCurrency: 'BRL'
    }
  };

  return (
    <Fade in={isLoaded} timeout={1000}>
      <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -8 }, position: 'relative', zIndex: 1 }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Grid container spacing={4}>
          {/* Hero Section */}
          <Grid item xs={12}>
            <Zoom in={isLoaded} timeout={800}>
              <Card 
                elevation={3}
                sx={{ 
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  bgcolor: colors.surface.dark,
                  boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)'
                }}
              >
                <CardMedia
                  component="img"
                  height={isMobile ? "300" : "500"}
                  image={`${bannerUrl}?v=${cacheBuster}`}
                  alt={`Banner do evento ${event.name}`}
                  sx={{
                    objectFit: 'cover',
                    filter: 'brightness(0.85)',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: colors.gradient.dark,
                    color: colors.text.light,
                    p: { xs: 3, md: 6 },
                    pt: { xs: 8, md: 12 }
                  }}
                >
                  <Stack spacing={2} maxWidth="800px">
                    <Chip
                      label={event.event_type}
                      size="small"
                      sx={{ 
                        alignSelf: 'flex-start',
                        bgcolor: colors.accent,
                        color: colors.text.primary,
                        fontWeight: 600,
                        px: 1,
                        borderRadius: '16px',
                        '&:hover': {
                          bgcolor: colors.accent,
                          transform: 'translateY(-1px)'
                        },
                        transition: 'transform 0.2s ease'
                      }}
                    />
                    
                    <Typography 
                      variant={isMobile ? "h4" : "h2"}
                      component="h1" 
                      sx={{
                        fontWeight: 800,
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2
                      }}
                    >
                      {event.name}
                    </Typography>
                    
                    <Stack 
                      direction="row" 
                      spacing={2} 
                      alignItems="center"
                      divider={<Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />}
                    >
                      <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        Por {event.organization_name}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                        {event.city}, {event.state}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Card>
            </Zoom>
          </Grid>

          {/* Action Bar */}
          <Grid item xs={12}>
            <Paper 
              elevation={2}
              sx={{ 
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                bgcolor: colors.surface.light,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                border: `1px solid ${colors.border.light}`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Button
                variant="contained"
                size="large"
                href={`/e/${event.slug}/tickets`}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  bgcolor: colors.primary,
                  fontWeight: 600,
                  boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
                  '&:hover': {
                    bgcolor: '#4338CA',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px -2px rgba(79, 70, 229, 0.3)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {event.event_type.toLowerCase() === 'esportivo' ? 'Se Inscrever' : 'Garantir Ingresso'}
              </Button>

              <IconButton
                onClick={handleShare}
                sx={{
                  bgcolor: colors.surface.highlight,
                  color: colors.primary,
                  p: 2,
                  borderRadius: '50%',
                  border: `2px solid ${colors.border.accent}`,
                  '&:hover': {
                    bgcolor: colors.surface.highlight,
                    transform: 'scale(1.05) rotate(5deg)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <ShareIcon />
              </IconButton>
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid container item spacing={4}>
            {/* Description */}
            <Grid item xs={12} md={8}>
              <Card 
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: colors.surface.light,
                  border: `1px solid ${colors.border.light}`,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    sx={{ 
                      color: colors.text.primary,
                      fontWeight: 600,
                      mb: 3,
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
                    Sobre o Evento
                  </Typography>
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: event.event_description }}
                    style={{
                      color: colors.text.secondary,
                      lineHeight: 1.8
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
              <Box sx={{ position: 'sticky', top: 24 }}>
                <InformationCard event={event} />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  );
}
