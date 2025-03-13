import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { formatPrice } from '@/app/utils/formatters';
import { getEventBySlug, getEventTickets, Ingresso, Lote, Event } from '@/app/apis/api';

interface TicketOptionsProps {
  eventSlug: string;
  onSelectTicket: (ticket: Ingresso, quantity: number) => void;
}

export default function TicketOptions({ eventSlug, onSelectTicket }: TicketOptionsProps) {
  const [tickets, setTickets] = useState<Ingresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuantities, setSelectedQuantities] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const event = await getEventBySlug(eventSlug);
        const ticketsData = await getEventTickets(event.event_id);
        setTickets(ticketsData);
        // Initialize quantities
        const initialQuantities = ticketsData.reduce((acc, ticket) => ({
          ...acc,
          [ticket.id]: 0
        }), {});
        setSelectedQuantities(initialQuantities);
      } catch (error) {
        setError('Erro ao carregar ingressos');
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [eventSlug]);

  const handleQuantityChange = (ticket: Ingresso, change: number) => {
    const currentQuantity = selectedQuantities[ticket.id] || 0;
    const newQuantity = Math.max(0, Math.min(currentQuantity + change, 10)); // Max 10 tickets per person
    
    setSelectedQuantities(prev => ({
      ...prev,
      [ticket.id]: newQuantity
    }));
    
    // Notify parent component of the quantity change
    onSelectTicket(ticket, newQuantity);
  };

  const getCurrentLoteInfo = (ticket: Ingresso): Lote | null => {
    if (ticket.tipo !== 'Lotes' || !ticket.lotes || ticket.lotes.length === 0) {
      return null;
    }

    const currentLote = ticket.lotes.find((lote, index) => {
      const previousLotesQuantity = ticket.lotes!
        .slice(0, index)
        .reduce((sum, l) => sum + l.quantidade, 0);
      return previousLotesQuantity < ticket.totalIngressos;
    });

    return currentLote || null;
  };

  const getTicketPrice = (ticket: Ingresso): number => {
    if (ticket.tipo === 'Gratuito') return 0;
    if (ticket.tipo === 'Lotes') {
      const currentLote = getCurrentLoteInfo(ticket);
      return currentLote ? currentLote.valor : ticket.valor;
    }
    return ticket.valor;
  };

  const getTicketStatus = (ticket: Ingresso): { available: boolean; message: string } => {
    const now = new Date();
    const startDate = ticket.inicioVendas ? new Date(ticket.inicioVendas) : null;
    const endDate = ticket.fimVendas ? new Date(ticket.fimVendas) : null;

    if (startDate && now < startDate) {
      return { available: false, message: 'Vendas não iniciadas' };
    }

    if (endDate && now > endDate) {
      return { available: false, message: 'Vendas encerradas' };
    }

    if (ticket.totalIngressos <= 0) {
      return { available: false, message: 'Esgotado' };
    }

    return { available: true, message: 'Disponível' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const calculateTotal = (ticket: Ingresso) => {
    const price = getTicketPrice(ticket);
    const quantity = selectedQuantities[ticket.id] || 0;
    return price * quantity;
  };

  return (
    <Grid container spacing={2}>
      {tickets.map((ticket) => {
        const status = getTicketStatus(ticket);
        const price = getTicketPrice(ticket);
        const currentLote = getCurrentLoteInfo(ticket);
        const quantity = selectedQuantities[ticket.id] || 0;

        return (
          <Grid item xs={12} key={ticket.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {ticket.nome}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip
                        label={ticket.tipo}
                        color={ticket.tipo === 'Gratuito' ? 'success' : 'primary'}
                        size="small"
                      />
                      <Chip
                        label={status.message}
                        color={status.available ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Typography variant="h6" color="primary">
                    {ticket.tipo === 'Gratuito' ? 'GRÁTIS' : formatPrice(price)}
                  </Typography>
                </Box>

                {currentLote && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Lote Atual: {currentLote.quantidade} ingressos disponíveis
                    </Typography>
                    {currentLote.viradaProximoLote.data && (
                      <Typography variant="body2" color="text.secondary">
                        Próximo lote em: {new Date(currentLote.viradaProximoLote.data).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleQuantityChange(ticket, -1)}
                      disabled={!status.available || quantity === 0}
                    >
                      -
                    </Button>
                    <Typography sx={{ mx: 2 }}>{quantity}</Typography>
                    <Button
                      variant="outlined"
                      onClick={() => handleQuantityChange(ticket, 1)}
                      disabled={!status.available || quantity >= 10 || quantity >= ticket.totalIngressos}
                    >
                      +
                    </Button>
                  </Box>
                  <Typography variant="h6">
                    Total: {formatPrice(calculateTotal(ticket))}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Quantidade selecionada: {quantity}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
