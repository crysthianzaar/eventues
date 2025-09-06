'use client';

import Link from 'next/link';
import { Box, Typography, Chip, Grid } from '@mui/material';
import { Event } from '../types/event';

interface InternalLinkingProps {
  currentEvent?: Event;
  relatedEvents?: Event[];
  eventCategories?: string[];
  eventCities?: string[];
}

const InternalLinking: React.FC<InternalLinkingProps> = ({
  currentEvent,
  relatedEvents = [],
  eventCategories = [],
  eventCities = []
}) => {
  // Default categories and cities for better internal linking
  const defaultCategories = [
    'Corrida',
    'Maratona',
    'Ciclismo',
    'Triathlon',
    'Natação',
    'Futebol',
    'Vôlei',
    'Basquete'
  ];

  const defaultCities = [
    'São Paulo',
    'Rio de Janeiro',
    'Belo Horizonte',
    'Brasília',
    'Salvador',
    'Curitiba',
    'Porto Alegre',
    'Recife'
  ];

  const categories = eventCategories.length > 0 ? eventCategories : defaultCategories;
  const cities = eventCities.length > 0 ? eventCities : defaultCities;

  return (
    <Box sx={{ mt: 4 }}>
      {/* Related Events Section */}
      {relatedEvents.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Eventos Relacionados
          </Typography>
          <Grid container spacing={2}>
            {relatedEvents.slice(0, 4).map((event) => (
              <Grid item xs={12} sm={6} md={3} key={event.event_id}>
                <Link 
                  href={`/e/${event.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'grey.50'
                      }
                    }}
                  >
                    <Typography variant="subtitle2" noWrap>
                      {event.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {event.location}
                    </Typography>
                  </Box>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Event Categories */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Categorias de Eventos
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category}
              href={`/search?type=${encodeURIComponent(category)}`}
              style={{ textDecoration: 'none' }}
            >
              <Chip
                label={category}
                variant="outlined"
                size="small"
                clickable
                sx={{
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white'
                  }
                }}
              />
            </Link>
          ))}
        </Box>
      </Box>

      {/* Cities */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Eventos por Cidade
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {cities.slice(0, 8).map((city) => (
            <Link
              key={city}
              href={`/search?city=${encodeURIComponent(city)}`}
              style={{ textDecoration: 'none' }}
            >
              <Chip
                label={city}
                variant="outlined"
                size="small"
                clickable
                sx={{
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white'
                  }
                }}
              />
            </Link>
          ))}
        </Box>
      </Box>

      {/* Navigation Links */}
      <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'grey.300' }}>
        <Typography variant="h6" gutterBottom>
          Navegação
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
              🏠 Página Inicial
            </Typography>
          </Link>
          <Link href="/search" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
              🔍 Buscar Eventos
            </Typography>
          </Link>
          <Link href="/criar-evento" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
              ➕ Criar Evento
            </Typography>
          </Link>
          <Link href="/meus-eventos" style={{ textDecoration: 'none' }}>
            <Typography variant="body2" color="primary" sx={{ '&:hover': { textDecoration: 'underline' } }}>
              📅 Meus Eventos
            </Typography>
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default InternalLinking;
