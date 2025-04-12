import { Box, Typography, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Ingresso } from '@/app/apis/api';
import { calculatePlatformFee } from '../../utils/calculateFee';
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

interface PaymentSummaryProps {
  tickets: Ingresso[];
  selectedQuantities: { [key: string]: number };
}

export default function PaymentSummary({ tickets, selectedQuantities }: PaymentSummaryProps) {
  const calculateSubtotal = () => {
    return tickets.reduce((total, ticket) => {
      const quantity = selectedQuantities[ticket.id] || 0;
      return total + (ticket.valor * quantity);
    }, 0);
  };

  const calculateFees = () => {
    return tickets.reduce((total, ticket) => {
      const quantity = selectedQuantities[ticket.id] || 0;
      const fee = calculatePlatformFee(ticket.valor);
      return total + (fee * quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const fees = calculateFees();
  const total = subtotal + fees;

  return (
    <SummaryContainer>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Resumo do pedido
      </Typography>

      {tickets.map((ticket) => {
        const quantity = selectedQuantities[ticket.id] || 0;
        if (quantity === 0) return null;

        const ticketTotal = ticket.valor * quantity;
        const ticketFee = calculatePlatformFee(ticket.valor) * quantity;

        return (
          <Box key={ticket.id} sx={{ mb: 2 }}>
            <SummaryRow>
              <SummaryLabel>
                {ticket.nome} x {quantity}
              </SummaryLabel>
              <SummaryValue>
                {formatPrice(ticketTotal)}
              </SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                Taxa de serviço
              </SummaryLabel>
              <SummaryValue sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                {formatPrice(ticketFee)}
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
