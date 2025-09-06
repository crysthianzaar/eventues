"use client";

import React, { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import {
  Box,
  Button,
  Card,
  CardMedia,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  Typography,
  styled,
  useTheme,
  useMediaQuery,
  Container,
  CardContent,
  Chip,
  Fade,
  Zoom,
  Tooltip
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
  Share as ShareIcon,
  ArrowForward as ArrowForwardIcon,
  InfoOutlined as InfoOutlinedIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  WhatsApp as WhatsAppIcon,
  Telegram as TelegramIcon,
  LinkedIn as LinkedInIcon,
  ContentCopy as ContentCopyIcon,
  Groups2
} from '@mui/icons-material';
import InformationCard from './InformationCard';
import axios from 'axios';
import { Event } from '@/app/types/event';
import { formatDate } from '@/utils/formatters';
import { format } from 'date-fns';
import useAuth from '@/app/hooks/useAuth';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import { useRouter } from 'next/navigation';
import InternalLinking from '@/app/components/InternalLinking';

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

const EventDetails: React.FC<EventDetailsProps> = memo(({ event }) => {
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const [cacheBuster, setCacheBuster] = useState(() => Date.now());
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        // Use event.banner_image_url if available, otherwise fetch from API
        if (event.banner_image_url) {
          setBannerUrl(event.banner_image_url);
          setIsLoaded(true);
          return;
        }

        const response = await axios.get<DocumentFile[]>(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer_detail/${event.event_id}/get_document_files`,
          {
            timeout: 3000, // Reduce timeout for faster loading
            headers: {
              'Cache-Control': 'public, max-age=300'
            }
          }
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
  }, [event.event_id, event.banner_image_url]);

  useEffect(() => {
    setCacheBuster(Date.now());
  }, [bannerUrl]);

  // Função para compartilhamento em redes sociais específicas
  const shareOnSocialMedia = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'linkedin' | 'copy') => {
    // Check if we're in a browser environment before accessing window
    const url = typeof window !== 'undefined' ? window.location.href : `https://eventues.com/e/${event.slug}`;
    const title = `${event.name} - ${event.city}`;
    const description = [
      `🎯 ${event.event_type}: ${event.name}`,
      `📅 Data: ${formatEventDate(event.start_date)}`,
      `⏰ Horário: ${event.start_time} às ${event.end_time}`,
      `📍 Local: ${event.city}, ${event.state}`,
      '',
      '🎟️ Garanta sua vaga agora!'
    ].join('\n');
    
    // Cada plataforma tem um formato de compartilhamento diferente
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n\n${description}\n\n${url}`)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`${title}\n\n${description}`)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        break;
      case 'copy':
        navigator.clipboard.writeText(`${title}\n\n${description}\n\n${url}`)
          .then(() => {
            alert('Link copiado para a área de transferência!');
          })
          .catch((err) => {
            console.error('Erro ao copiar: ', err);
          });
        break;
    }
  };
  
  // Estado para o menu de compartilhamento
  const [shareAnchorEl, setShareAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleShare = async () => {
    try {
      // Preparar dados para compartilhamento nativo
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
      
      // Tenta compartilhamento padrão (sem imagem)
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback para navegadores que não suportam a Web Share API
        // Usa o menu de compartilhamento personalizado ou copia para a área de transferência
        // Por enquanto, vamos apenas copiar para a área de transferência
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n\nSaiba mais: ${shareData.url}`
        );
        alert('Link copiado para a área de transferência!');
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      // Se falhar, tenta copiar para a área de transferência
      try {
        const fallbackText = `${event.name} - ${event.city}\n\nSaiba mais: ${window.location.href}`;
        await navigator.clipboard.writeText(fallbackText);
        alert('Link copiado para a área de transferência!');
      } catch (clipboardError) {
        console.error('Erro ao copiar:', clipboardError);
      }
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

  const handleTicketNavigation = () => {
    setIsLoading(true);
    router.push(`/e/${event.slug}/tickets`);
  };

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <Fade in={isLoaded} timeout={1000}>
        <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -8 }, position: 'relative', zIndex: 1 }}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <Grid container spacing={4}>
            {/* Banner Section - Layout limpo como na imagem */}
            <Grid item xs={12}>
              <Box sx={{ mb: 4 }}>
                {/* Card do Banner (imagem) */}
                <Card
                  elevation={1}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: '#000',
                    mb: 2,
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {/* Chip de categoria no canto superior */}
                  <Box sx={{ position: 'relative' }}>
                    
                    {/* Imagem do Banner */}
                    <Box
                      sx={{
                        width: '100%',
                        height: isMobile ? 280 : 350,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {isLoaded ? (
                        <Image
                          src={`${bannerUrl}?v=${cacheBuster}`}
                          alt={`Banner do evento ${event.name}`}
                          fill
                          style={{
                            objectFit: 'cover',
                            objectPosition: 'center'
                          }}
                          priority={true}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                          quality={85}
                        />
                      ) : (
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height="100%"
                          animation="wave"
                        />
                      )}
                    </Box>
                  </Box>
                </Card>
                
                {/* Card de Informações principais + Action Bar */}
                <Card
                  elevation={1}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    p: { xs: 2, md: 3 },
                    bgcolor: '#FFF',
                    mb: 2
                  }}
                >
                  <Grid container spacing={3} alignItems="center">
                    {/* Informações principais */}
                    <Grid item xs={12} md={8}>
                      <Box sx={{ height: '100%' }}>
                        {/* Título do evento */}
                        <Typography 
                          variant={isMobile ? "h5" : "h4"} 
                          component="h1"
                          sx={{ 
                            mb: 1.5, 
                            fontWeight: 700,
                            color: '#1A202C'
                          }}
                        >
                          {event.name}
                        </Typography>
                        {/* Organização e Local */}
                        <Stack 
                          direction="row" 
                          spacing={3} 
                          divider={<Divider orientation="vertical" flexItem />}
                          sx={{ 
                            mb: 2,
                            color: '#4A5568',
                            flexWrap: 'wrap',
                            gap: 1
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Groups2 fontSize="small" sx={{ color: colors.primary, opacity: 0.8 }} />
                            <Typography variant="body2">{event.organization_name}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOnIcon fontSize="small" sx={{ color: colors.primary, opacity: 0.8 }} />
                            <Typography variant="body2">{event.city}, {event.state}</Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Grid>

                    {/* Data, hora, e ações à direita */}
                    <Grid item xs={12} md={4}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', md: 'row' },
                          alignItems: { xs: 'stretch', md: 'center' },
                          gap: { xs: 2, md: 3 },
                          justifyContent: 'flex-end',
                          height: '100%'
                        }}
                      >
                        {/* Action Bar: Botão e Compartilhar */}
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="center"
                          justifyContent="flex-end"
                          sx={{ minWidth: 180 }}
                        >
                          <Button
                            variant="contained"
                            size="large"
                            onClick={handleTicketNavigation}
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
                              transition: 'all 0.2s ease-in-out',
                              width: { xs: 'auto', md: '100%' },
                              minWidth: 180
                            }}
                          >
                            {event.event_type.toLowerCase() === 'esportivo' ? 'Se Inscrever' : 'Garantir Ingresso'}
                          </Button>
                          <Tooltip title="Compartilhar" arrow>
                            <IconButton
                              onClick={(e) => setShareAnchorEl(e.currentTarget)}
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
                              aria-label="Compartilhar"
                            >
                              <ShareIcon />
                            </IconButton>
                            
                          </Tooltip>
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              </Box>
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
          
          {/* Internal Linking Section for SEO */}
          <Container maxWidth="lg" sx={{ mt: 6 }}>
            <InternalLinking />
          </Container>
        </Container>
      </Fade>
    </>
  );
});

export default EventDetails;
