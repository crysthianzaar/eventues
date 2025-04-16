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
  // Backend-calculated values (preferably used when available)
  backendFee?: number;
  backendTotal?: number;
  backendSubtotal?: number;
  // Flag to force using backend values only
  useBackendValuesOnly?: boolean;
}

export default function PaymentSummary({ 
  tickets, 
  selectedQuantities, 
  backendFee, 
  backendTotal, 
  backendSubtotal,
  useBackendValuesOnly = false 
}: PaymentSummaryProps) {
  console.log('[PaymentSummary] Rendering with props:', { 
    tickets, 
    selectedQuantities, 
    backendFee, 
    backendTotal, 
    backendSubtotal,
    useBackendValuesOnly 
  });
  const calculateSubtotal = () => {
    console.log('[PaymentSummary] Calculating subtotal with tickets:', tickets);
    const result = tickets.reduce((total, ticket) => {
      const quantity = selectedQuantities[ticket.id] || 0;
      console.log(`[PaymentSummary] Ticket ${ticket.nome}: price=${ticket.valor}, quantity=${quantity}, subtotal=${ticket.valor * quantity}`);
      return total + (ticket.valor * quantity);
    }, 0);
    console.log('[PaymentSummary] Final subtotal:', result);
    return result;
  };

  const calculateFees = () => {
    console.log('[PaymentSummary] Calculating fees');
    const result = tickets.reduce((total, ticket) => {
      const quantity = selectedQuantities[ticket.id] || 0;
      const fee = calculatePlatformFee(ticket.valor);
      console.log(`[PaymentSummary] Ticket ${ticket.nome}: price=${ticket.valor}, fee=${fee}, quantity=${quantity}, total fee=${fee * quantity}`);
      return total + (fee * quantity);
    }, 0);
    console.log('[PaymentSummary] Final fees:', result);
    return result;
  };

  console.log('[PaymentSummary] Starting calculations');
  
  // Calculate frontend values
  const calculatedSubtotal = calculateSubtotal();
  const calculatedFees = calculateFees();
  
  // Determine whether to use frontend or backend values
  let subtotal: number;
  let fees: number;
  let total: number;

  if (useBackendValuesOnly) {
    // When forced to use backend values only, use zeros as fallbacks
    subtotal = backendSubtotal ?? 0;
    fees = backendFee ?? 0;
    total = backendTotal ?? 0;
    console.log('[PaymentSummary] Using backend values only');
  } else {
    // Use backend values if available, otherwise use calculated values
    subtotal = backendSubtotal !== undefined ? backendSubtotal : calculatedSubtotal;
    fees = backendFee !== undefined ? backendFee : calculatedFees;
    total = backendTotal !== undefined ? backendTotal : (calculatedSubtotal + calculatedFees);
  }
  
  console.log('[PaymentSummary] Final values:', {
    calculatedSubtotal,
    calculatedFees,
    backendSubtotal,
    backendFee,
    backendTotal,
    subtotal,
    fees,
    total,
    usingBackendOnly: useBackendValuesOnly,
    ticketsCount: tickets.length,
    selectedTicketsCount: Object.values(selectedQuantities).filter(q => q > 0).length
  });

  return (
    <SummaryContainer>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Resumo do pedido
      </Typography>

      {tickets.map((ticket) => {
        const quantity = selectedQuantities[ticket.id] || 0;
        console.log(`[PaymentSummary] Rendering ticket ${ticket.nome}: quantity=${quantity}`);
        if (quantity === 0) return null;

        // For display purposes only - the actual pricing is controlled by the backend
        const ticketTotal = ticket.valor * quantity;
        const ticketFee = calculatePlatformFee(ticket.valor) * quantity;
        console.log(`[PaymentSummary] Ticket ${ticket.nome} details:`, {
          price: ticket.valor,
          quantity,
          ticketTotal,
          fee: calculatePlatformFee(ticket.valor),
          ticketFee
        });

        return (
          <Box key={ticket.id} sx={{ mb: 2 }}>
            <SummaryRow>
              <SummaryLabel>
                {ticket.nome} x {quantity}
              </SummaryLabel>
              <SummaryValue>
                {formatPrice(subtotal)}
              </SummaryValue>
            </SummaryRow>
            <SummaryRow>
              <SummaryLabel sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>
                Taxa de serviço
              </SummaryLabel>
              <SummaryValue sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                {formatPrice(fees)}
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
