// src/components/EconomyCalculator.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  Slider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/system';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const CalculatorCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #EDF2F7 0%, #FFFFFF 100%)',
  borderRadius: '16px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  padding: theme.spacing(4),
  transition: 'transform 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const EconomyCalculator: React.FC = () => {
  const [ticketPrice, setTicketPrice] = useState<number>(100);
  const [ticketQuantity, setTicketQuantity] = useState<number>(100);
  const [absorbFee, setAbsorbFee] = useState<boolean>(false);
  const [savings, setSavings] = useState<number>(0);
  const [participantPaymentPerTicket, setParticipantPaymentPerTicket] = useState<number>(0);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const calculateSavings = (price: number, quantity: number): { totalSavings: number; participantPayment: number } => {
      let eventuesFeePerTicket = 0;
      let competitorFeePerTicket = 0;
      let participantFeePerTicket = 0;

      if (price <= 20) {
        eventuesFeePerTicket = 1.99;
        competitorFeePerTicket = 1.99 + 0.10 * price;
        participantFeePerTicket = price + 1.99; // Valor da inscrição para participantes
      } else {
        eventuesFeePerTicket = 0.0799 * price;
        competitorFeePerTicket = 0.10 * price;
        participantFeePerTicket = price + (0.0799 * price); // Valor da inscrição para participantes
      }

      const savingsPerTicket = competitorFeePerTicket - eventuesFeePerTicket;
      const totalSavings = savingsPerTicket * quantity;

      return { totalSavings, participantPayment: participantFeePerTicket };
    };

    const { totalSavings, participantPayment } = calculateSavings(ticketPrice, ticketQuantity);
    setSavings(totalSavings);
    setParticipantPaymentPerTicket(participantPayment);
  }, [ticketPrice, ticketQuantity]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <CalculatorCard>
      <CardContent>
        
        {/* Breve descrição */}
        <Typography variant="body2" sx={{ mb: 4, color: '#4A5568' }}>
          Insira o valor da inscrição e a quantidade de ingressos vendidos. Escolha se deseja absorver a taxa ou repassá-la para os participantes.
          A calculadora mostrará a economia que você ou seus participantes podem obter ao utilizar a Eventues.
        </Typography>

        <Grid container spacing={4}>
          {/* Input Valor da Inscrição */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Valor da Inscrição (R$)"
              type="number"
              variant="outlined"
              fullWidth
              value={ticketPrice}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value >= 0) setTicketPrice(value);
              }}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
              }}
              helperText="Insira o valor de cada ingresso"
            />
          </Grid>

          {/* Input Quantidade de Ingressos */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ mr: 2, color: '#5A67D8' }} />
              <Box sx={{ width: '100%' }}>
                <Typography gutterBottom>
                  Quantidade de Ingressos: {ticketQuantity}
                </Typography>
                <Slider
                  value={ticketQuantity}
                  onChange={(e, newValue) => setTicketQuantity(newValue as number)}
                  aria-labelledby="ticket-quantity-slider"
                  valueLabelDisplay="auto"
                  step={10}
                  marks={[
                    { value: 10, label: '10' },
                    { value: 1000, label: '1000' },
                  ]}
                  min={10}
                  max={1000}
                  sx={{
                    color: '#5A67D8',
                  }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Switch para absorver ou repassar taxa */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={absorbFee}
                  onChange={(e) => setAbsorbFee(e.target.checked)}
                  color="primary"
                />
              }
              label={absorbFee ? 'Absorvendo a taxa' : 'Repassando a taxa para Participantes'}
            />
          </Grid>

          {/* Resultados */}
          <Grid item xs={12}>
            <Box
              sx={{
                background: 'linear-gradient(135deg, #E6FFFA 0%, #B2F5EA 100%)',
                borderRadius: '12px',
                padding: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: isSmallScreen ? 'column' : 'row',
                alignItems: isSmallScreen ? 'flex-start' : 'center',
                gap: 2,
              }}
            >
              {absorbFee ? (
                <>
                  <MoneyOffIcon sx={{ fontSize: 40, color: '#319795' }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#319795', fontWeight: 'bold' }}>
                      Você vai economizar:
                    </Typography>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold', mb: 2 }}>
                      {formatCurrency(savings)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Economize {formatCurrency(savings)} ao absorver a taxa de 7,99% comparada a 10% de outras plataformas.
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <TrendingUpIcon sx={{ fontSize: 40, color: '#319795' }} />
                  <Box>
                    <Typography variant="h6" sx={{ color: '#319795', fontWeight: 'bold' }}>
                      Seus participantes vão economizar:
                    </Typography>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold', mb: 2 }}>
                      {formatCurrency(savings)}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Eles pagarão{' '}
                      <Typography
                        component="span"
                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                      >
                        {formatCurrency(participantPaymentPerTicket)}
                      </Typography>{' '}
                      por inscrição com a taxa de 7,99%, economizando {formatCurrency(savings)} em relação às plataformas tradicionais que cobram 10%.
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </CalculatorCard>
  );
};

export default EconomyCalculator;
