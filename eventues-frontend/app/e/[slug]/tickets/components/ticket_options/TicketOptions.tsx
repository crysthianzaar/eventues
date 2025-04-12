'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Divider,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Chip,
  useTheme,
  styled,
  alpha,
  Fade,
  Zoom,
  Tooltip,
  Badge,
  Alert,
  Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import { motion } from 'framer-motion';
import { formatPrice } from '@/app/utils/formatters';
import { Ingresso } from '@/app/apis/api';
import { calculatePlatformFee } from '../../utils/calculateFee';

interface TicketOptionsProps {
  tickets: Ingresso[];
  onSelectTicket: (ticket: Ingresso, quantity: number) => void;
  selectedQuantities: Record<string, number>;
  loading?: boolean;
}

// Styled components
const TicketGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    '& > .MuiGrid-item': {
      width: '100%',
      maxWidth: '100%'
    }
  }
}));

const TicketCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  '&:hover': {
    boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
    transform: 'translateY(-4px)',
  },
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2)
  }
}));

const TicketBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: 20,
  padding: '4px 12px',
  fontWeight: 600,
  fontSize: '0.75rem',
  zIndex: 1,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
}));

const TicketHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: alpha(theme.palette.primary.light, 0.1),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
}));

const TicketPrice = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
}));

const MainPrice = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  lineHeight: 1.2,
}));

const FeeText = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  '& .MuiSvgIcon-root': {
    fontSize: '0.875rem',
    cursor: 'help',
  },
}));

const QuantityControl = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    justifyContent: 'flex-end',
    marginTop: theme.spacing(1)
  }
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
  '&.Mui-disabled': {
    backgroundColor: alpha(theme.palette.action.disabled, 0.1),
    color: theme.palette.action.disabled,
  },
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1)
  }
}));

const PriceInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginTop: theme.spacing(1)
  }
}));

const TicketInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column'
  }
}));

const TicketInfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const TicketDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}));

export default function TicketOptions({ 
  tickets, 
  onSelectTicket, 
  selectedQuantities,
  loading = false
}: TicketOptionsProps) {
  const theme = useTheme();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const handleQuantityChange = (ticket: Ingresso, change: number) => {
    const currentQuantity = selectedQuantities[ticket.id] || 0;
    const newQuantity = Math.max(0, Math.min(currentQuantity + change, 10)); // Max 10 tickets per person
    onSelectTicket(ticket, newQuantity);
  };

  const getTotalSelectedTickets = () => {
    return Object.values(selectedQuantities).reduce((acc, quantity) => acc + quantity, 0);
  };

  const getTotalPrice = () => {
    return tickets.reduce((acc, ticket) => {
      const quantity = selectedQuantities[ticket.id] || 0;
      const ticketTotal = ticket.valor * quantity;
      const fee = calculatePlatformFee(ticket.valor) * quantity;
      return acc + ticketTotal + fee;
    }, 0);
  };

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Carregando ingressos...</Typography>
      </Box>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
        Não há ingressos disponíveis para este evento no momento.
      </Alert>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 3,
          gap: 2
        }}>
          <Box sx={{ 
            bgcolor: theme.palette.primary.main, 
            color: 'white', 
            borderRadius: '50%', 
            width: 40, 
            height: 40, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <ConfirmationNumberIcon />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Ingressos Disponíveis
          </Typography>
        </Box>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <TicketGrid container spacing={3}>
            {tickets.map((ticket) => {
              const fee = calculatePlatformFee(ticket.valor);
              return (
                <Grid item xs={12} key={ticket.id} component={motion.div} variants={itemVariants} sx={{ mb: 2 }}>
                  <TicketCard sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: theme.spacing(2),
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    },
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {ticket.nome}
                      </Typography>
                      <TicketPrice>
                        <MainPrice>
                          {formatPrice(ticket.valor)}
                        </MainPrice>
                        {ticket.valor > 0 && (
                          <Tooltip
                            title="Taxa de 7,99% para manutenção da plataforma. Valor mínimo de R$ 2,00 para ingressos abaixo de R$ 20,00."
                            placement="bottom"
                            arrow
                          >
                            <FeeText>
                              + {formatPrice(fee)} taxa de serviço
                              <InfoIcon />
                            </FeeText>
                          </Tooltip>
                        )}
                      </TicketPrice>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: theme.spacing(2) }}>
                      <Typography variant="body2">
                        Disponível até {new Date(ticket.fimVendas || new Date()).toLocaleDateString('pt-BR')}
                      </Typography>
                      <QuantityControl>
                        <StyledIconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(ticket, -1)}
                          disabled={!selectedQuantities[ticket.id] || selectedQuantities[ticket.id] === 0}
                        >
                          <RemoveIcon fontSize="small" />
                        </StyledIconButton>
                        <Typography variant="body1" sx={{ fontWeight: 600, minWidth: '24px', textAlign: 'center' }}>
                          {selectedQuantities[ticket.id] || 0}
                        </Typography>
                        <StyledIconButton 
                          size="small" 
                          onClick={() => handleQuantityChange(ticket, 1)}
                        >
                          <AddIcon fontSize="small" />
                        </StyledIconButton>
                      </QuantityControl>
                    </Box>
                  </TicketCard>
                </Grid>
              );
            })}
          </TicketGrid>
        </motion.div>

        {getTotalSelectedTickets() > 0 && (
          <Zoom in={true} timeout={500}>
            <Paper 
              elevation={3} 
              sx={{ 
                mt: 4, 
                p: 2, 
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {getTotalSelectedTickets()} {getTotalSelectedTickets() === 1 ? 'ingresso selecionado' : 'ingressos selecionados'}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Total: {formatPrice(getTotalPrice())}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Inclui taxas de serviço
                </Typography>
              </Box>
              <Tooltip title="Prossiga para preencher suas informações pessoais">
                <Badge 
                  badgeContent={getTotalSelectedTickets()} 
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }}
                >
                  <ConfirmationNumberIcon color="primary" sx={{ mr: 1 }} />
                </Badge>
              </Tooltip>
            </Paper>
          </Zoom>
        )}
      </Box>
    </Fade>
  );
}
