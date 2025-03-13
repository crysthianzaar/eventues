'use client';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Grid, Box, Card, CardContent, Typography, Button, 
  CardActionArea, CircularProgress, Chip } from '@mui/material';
import { formatDate } from '../../utils/date';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useSWR from 'swr';

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

const fetcher = async (url: string): Promise<EventResponse> => {
  const response = await axios.get<EventResponse>(url);
  return response.data;
};

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
        <Box sx={{ position: 'relative', height: '200px' }}>
          <Image
            src={event.banner_url || "/images/default_banner.jpg"}
            alt={event.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            priority={false}
            quality={75}
          />
        </Box>
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
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const router = useRouter();

  const { data, error, isLoading } = useSWR<EventResponse>(
    `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/public/events${nextCursor ? `?cursor=${nextCursor}&limit=8` : '?limit=8'}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  useEffect(() => {
    if (data) {
      setEvents(prev => nextCursor ? [...prev, ...data.events] : data.events);
      setNextCursor(data.next_cursor);
      setHasMore(!!data.next_cursor);
    }
  }, [data, nextCursor]);

  const lastEventElementRef = useCallback((node: HTMLElement | null) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setNextCursor(prev => prev);  // Trigger new fetch
      }
    });

    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  const handleEventClick = (slug: string) => {
    router.push(`/e/${slug}`);
  };

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">Failed to load events. Please try again later.</Typography>
      </Box>
    );
  }

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
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default Events;
