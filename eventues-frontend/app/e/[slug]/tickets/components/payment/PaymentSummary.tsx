import { Box, Typography, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { formatPrice } from '@/app/utils/formatPrice';

const SummaryContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2.5),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: 0,
    backgroundColor: 'transparent'
  }
}));

const SummaryRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  '&:last-child': {
    marginBottom: 0
  }
}));

const SummaryLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.9rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.85rem'
  }
}));

const SummaryValue = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem'
  }
}));

const TotalLabel = styled(Typography)(({ theme }) => ({
  fontSize: '1.1rem',
  fontWeight: 600,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem'
  }
}));

const TotalValue = styled(Typography)(({ theme }) => ({
  fontSize: '1.2rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.1rem'
  }
}));

interface OrderTicket {
  ticket_id: string;
  ticket_name: string;
  valor: number;
  taxa: number;
  valor_total: number;
  quantity: number;
}

interface PaymentSummaryProps {
  tickets: OrderTicket[];
  // Backend-calculated values (preferably used when available)
  backendFee?: number;
  backendTotal?: number;
  backendSubtotal?: number;
}

export default function PaymentSummary({ 
  tickets, 
  backendFee, 
  backendTotal, 
  backendSubtotal
}: PaymentSummaryProps) {
  
  // Calculate totals directly from ticket data
  const calculatedSubtotal = tickets.reduce((total, ticket) => {
    return total + (ticket.valor * ticket.quantity);
  }, 0);
  
  const calculatedFees = tickets.reduce((total, ticket) => {
    return total + (ticket.taxa * ticket.quantity);
  }, 0);
  
  const calculatedTotal = tickets.reduce((total, ticket) => {
    return total + (ticket.valor_total * ticket.quantity);
  }, 0);
  
  // Use backend values if available, otherwise use calculated values
  const subtotal = backendSubtotal ?? calculatedSubtotal;
  const fees = backendFee ?? calculatedFees;
  const total = backendTotal ?? calculatedTotal;

  return (
    <SummaryContainer>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Resumo do pedido
      </Typography>

      {tickets.map((ticket) => {
        const valor = Number(ticket.valor) || 0;
        const taxa = Number(ticket.taxa) || 0;
        const quantity = Number(ticket.quantity) || 1;
        if (!quantity || quantity === 0) return null;

        return (
          <Box key={ticket.ticket_id} sx={{ mb: 2 }}>
            <SummaryRow>
              <SummaryLabel>
                {ticket.ticket_name} x {quantity}
              </SummaryLabel>
              <SummaryValue>
                {formatPrice(valor * quantity)}
              </SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                Taxa de serviço
              </SummaryLabel>
              <SummaryValue sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                {formatPrice(taxa * quantity)}
              </SummaryValue>
            </SummaryRow>
          </Box>
        );
      })}

      <Divider sx={{ my: 2 }} />
      <SummaryRow>
        <TotalLabel>Total</TotalLabel>
        <TotalValue>{formatPrice(total)}</TotalValue>
      </SummaryRow>
    </SummaryContainer>
  );
}
