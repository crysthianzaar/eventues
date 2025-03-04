'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Grid, Box, Card, CardMedia, CardContent, Typography, Button, 
  CardActionArea, CircularProgress, Chip } from '@mui/material';
import { formatDate } from '../../utils/date';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Event {
  event_id: string;
  name: string;
  slug: string;
  banner_url: string;
  start_date: string;
  end_date: string;
  event_type: string;
  event_category: string;
  state: string;
  city: string;
}

interface EventResponse {
  events: Event[];
  next_cursor: string | null;
}

interface EventCardProps {
  event: Event;
  onEventClick: (slug: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEventClick }) => {
  const formattedDate = formatDate(event.start_date);

  return (
    <Card
   sx={{
     width: { xs: '100%', sm: '90%', md: '300px' },
     margin: { xs: '10px auto', md: '0 auto' },
     boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
     border: '2px solid rgba(0, 0, 0, 0.2)',
     borderRadius: '20px',
     overflow: 'hidden',
     transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
     '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
    borderColor: '#5A67D8',
     },
   }}
    >
  <CardActionArea onClick={() => onEventClick(event.slug)}>
    <CardMedia
   component="img"
   image={event.banner_url || "/images/default_banner.jpg"}
   alt={event.name}
   sx={{
    height: '200px',
    objectFit: 'cover',
   }}
    />
    <CardContent sx={{ height: '150px', overflow: 'hidden' }}>
   <Chip 
    label={event.event_type} 
    color="primary" 
    sx={{ marginBottom: '10px', marginRight: '5px' }} 
   />
   {event.event_category && (
    <Chip 
      label={event.event_category} 
      variant="outlined" 
      sx={{ marginBottom: '10px' }} 
    />
   )}
   <Typography variant="h6" component="h3" gutterBottom>
    {event.name}
   </Typography>
   <Typography variant="body2" color="textSecondary">
    <i className="bi bi-calendar"></i> {formattedDate}
   </Typography>
   <Typography variant="body2" color="textSecondary">
    <i className="bi bi-geo-alt"></i> {event.city}, {event.state}
   </Typography>
    </CardContent>
  </CardActionArea>
   <Box sx={{ padding: '10px' }}>
     <Button
    variant="contained"
    fullWidth
    onClick={() => onEventClick(event.slug)}
    sx={{
      backgroundColor: '#5A67D8',
      color: 'white',
      borderRadius: '50px',
      padding: '10px 20px',
      boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.3)',
      '&:hover': {
        backgroundColor: '#434190',
      },
    }}
     >
    Saiba mais
     </Button>
   </Box>
    </Card>
  );
};

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const router = useRouter();

  const fetchEvents = async (cursor: string | null = null) => {
    try {
   setLoading(true);
   const response = await axios.get<EventResponse>(
     `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/public/events`,
     {
    params: {
      cursor,
      limit: 8
    }
     }
   );

   const { events: newEvents, next_cursor } = response.data;
   setEvents(prev => cursor ? [...prev, ...newEvents] : newEvents);
   setNextCursor(next_cursor);
   setHasMore(!!next_cursor);
    } catch (error) {
   console.error('Error fetching events:', error);
    } finally {
   setLoading(false);
    }
  };

  const lastEventElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
   if (entries[0].isIntersecting && hasMore) {
     fetchEvents(nextCursor);
   }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, nextCursor]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventClick = (slug: string) => {
    router.push(`/e/${slug}`);
  };

  return (
    <Box sx={{ padding: { xs: '40px 10px', md: '40px 0' }, backgroundColor: '#F7FAFC' }}>
   <Typography
     variant="h4"
     align="center"
     gutterBottom
     sx={{ marginY: '40px', color: '#2D3748' }}
   >
     Próximos Eventos
   </Typography>
   <Grid
     container
     spacing={4}
     justifyContent="center"
     sx={{ flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center' }}
   >
     {events.map((event, index) => (
    <Grid
      item
      key={event.event_id}
      sx={{ width: { xs: '100%', md: 'auto' } }}
      ref={index === events.length - 1 ? lastEventElementRef : null}
    >
      <EventCard event={event} onEventClick={handleEventClick} />
    </Grid>
     ))}
   </Grid>
   {loading && (
     <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <CircularProgress />
     </Box>
   )}
    </Box>
  );
};

export default Events;
