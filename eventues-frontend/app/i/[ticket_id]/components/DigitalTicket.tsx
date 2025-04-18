'use client';

import { Box, Typography, styled, Paper, Divider, Chip } from '@mui/material';
import QRCode from 'react-qr-code';
import { TicketItem, TicketDetails } from '../types';
import { useState } from 'react';
import EventIcon from '@mui/icons-material/Event';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

// Componentes estilizados para o design do ingresso digital
const TicketContainer = styled(Paper)(({ theme }) => ({
  maxWidth: '100%',
  margin: '0 auto',
  borderRadius: 16,
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const TicketHeader = styled(Box)(({ theme }) => ({
  background: theme.palette.primary.main,
  padding: theme.spacing(3),
  color: '#fff',
  position: 'relative',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -15,
    left: 50,
    right: 50,
    height: 30,
    background: '#f5f5f5',
    borderRadius: '50% 50% 0 0',
    zIndex: 1,
  },
}));

const TicketBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4, 3, 3),
  position: 'relative',
}));

const TicketDivider = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  margin: theme.spacing(1, 0),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 1,
    background: `repeating-linear-gradient(90deg, ${theme.palette.divider}, ${theme.palette.divider} 6px, transparent 6px, transparent 12px)`,
    zIndex: 0,
  },
}));

const TicketInfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1.5),
    fontSize: 20,
  },
}));

const QRCodeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#fff',
  borderRadius: 8,
  padding: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  marginBottom: theme.spacing(2),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -6,
    left: '50%',
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    transform: 'translateX(-50%) rotate(45deg)',
    boxShadow: '4px 4px 5px rgba(0,0,0,0.05)',
    zIndex: -1,
  }
}));

const TicketStatus = styled(Chip)(({ theme, color }) => ({
  fontWeight: 600,
  borderRadius: 12,
  height: 24,
  fontSize: '0.75rem',
  '& .MuiChip-label': {
    paddingLeft: 12,
    paddingRight: 12,
  },
}));

const TicketFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  borderTop: `1px dashed ${theme.palette.divider}`,
  marginTop: theme.spacing(2),
  paddingTop: theme.spacing(2),
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
}));

interface DigitalTicketProps {
  ticketDetails: TicketDetails;
  formatDate: (dateString: string) => string;
}

const DigitalTicket = ({ ticketDetails, formatDate }: DigitalTicketProps) => {
  const [activeTicketIndex, setActiveTicketIndex] = useState(0);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
      case 'PAID':
      case 'completed':
        return 'success';
      case 'PAGAMENTO PENDENTE':
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleTicketChange = (index: number) => {
    setActiveTicketIndex(index);
  };

  const activeTicket = ticketDetails.tickets && ticketDetails.tickets.length > 0 
    ? ticketDetails.tickets[activeTicketIndex] 
    : null;

  const activeParticipant = activeTicket?.participants && activeTicket.participants.length > 0
    ? activeTicket.participants[0]
    : null;
    
  // Format event date for display
  const eventDate = new Date(ticketDetails.event_date);
  const eventDay = eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const eventTime = eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const eventYear = eventDate.getFullYear();

  return (
    <>
      {/* Seleção de ingressos caso tenha mais de um */}
      {ticketDetails.tickets && ticketDetails.tickets.length > 1 && (
        <Box sx={{ display: 'flex', mb: 2, overflowX: 'auto', pb: 1 }}>
          {ticketDetails.tickets.map((ticket, index) => (
            <Box
              key={index}
              onClick={() => handleTicketChange(index)}
              sx={{
                px: 2, 
                py: 1, 
                mx: 0.5, 
                borderRadius: 2,
                backgroundColor: index === activeTicketIndex ? 'primary.main' : 'background.paper',
                color: index === activeTicketIndex ? 'white' : 'text.primary',
                cursor: 'pointer',
                fontWeight: index === activeTicketIndex ? 'bold' : 'normal',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                boxShadow: index === activeTicketIndex ? 2 : 0,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: index === activeTicketIndex ? 'primary.dark' : 'grey.100'
                }
              }}
            >
              Ingresso {index + 1} - {ticket.ticket_name}
            </Box>
          ))}
        </Box>
      )}

      {/* Design do ingresso */}
      <TicketContainer>
        <TicketHeader>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {ticketDetails.event_name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              {ticketDetails.event_type}
            </Typography>
          </Box>
          <TicketStatus 
            label={ticketDetails.status} 
            color={getStatusColor(ticketDetails.status)}
            size="small"
          />
        </TicketHeader>
        
        <TicketBody>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Coluna esquerda - Informações */}
            <Box sx={{ flex: 1 }}>
              <TicketInfoItem>
                <EventIcon />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Data do Evento
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {eventDay} • {eventYear}
                  </Typography>
                </Box>
              </TicketInfoItem>
              
              <TicketInfoItem>
                <AccessTimeIcon />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Horário
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {eventTime}
                  </Typography>
                </Box>
              </TicketInfoItem>
              
              <TicketInfoItem>
                <PlaceIcon />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Local
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {ticketDetails.event_location || 'Local não informado'}
                  </Typography>
                </Box>
              </TicketInfoItem>
              
              {activeParticipant && (
                <TicketInfoItem>
                  <PersonIcon />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Participante
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {activeParticipant.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activeParticipant.email}
                    </Typography>
                  </Box>
                </TicketInfoItem>
              )}
              
              <TicketInfoItem>
                <ConfirmationNumberIcon />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Tipo de Ingresso
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {activeTicket?.ticket_name || ticketDetails.ticket_name}
                  </Typography>
                </Box>
              </TicketInfoItem>
            </Box>
            
            {/* Coluna direita - QR Code */}
            <Box sx={{ 
              width: { xs: '100%', md: '30%' }, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {activeTicket?.qr_code_uuid && (
                <QRCodeContainer>
                  <QRCode 
                    value={activeTicket.qr_code_uuid} 
                    size={120}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </QRCodeContainer>
              )}
              <Typography variant="caption" color="text.secondary" align="center">
                Apresente este QR Code
              </Typography>
              {activeTicket?.qr_code_uuid && (
                <Typography variant="caption" color="text.secondary" align="center" sx={{ wordBreak: 'break-all' }}>
                  {activeTicket.qr_code_uuid}
                </Typography>
              )}
            </Box>
          </Box>
          
          <TicketDivider>
            <Typography variant="caption" sx={{ backgroundColor: '#f5f5f5', px: 1, zIndex: 1 }}>
              Informações do Pedido
            </Typography>
          </TicketDivider>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2, gap: 2 }}>
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" color="text.secondary">
                Data da Compra
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatDate(ticketDetails.created_at)}
              </Typography>
            </Box>
            
            <Box sx={{ minWidth: 120 }}>
              <Typography variant="caption" color="text.secondary">
                Valor Total
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'primary.main' }}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(ticketDetails.total_value)}
              </Typography>
            </Box>
          </Box>
          
          <TicketFooter>
            <Typography variant="caption">
              ID do Pedido: {ticketDetails.order_id}
            </Typography>
            <Typography variant="caption">
              Eventues ©
            </Typography>
          </TicketFooter>
        </TicketBody>
      </TicketContainer>
    </>
  );
};

export default DigitalTicket;
