"use client";

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const EconomyCalculator = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [ticketPrice, setTicketPrice] = useState('');
  const [ticketQuantity, setTicketQuantity] = useState('');
  const [feeOption, setFeeOption] = useState('repassar');
  const [savings, setSavings] = useState<number | null>(null);

  const handleCalculate = () => {
    const price = parseFloat(ticketPrice);
    const quantity = parseInt(ticketQuantity);
    if (!isNaN(price) && !isNaN(quantity)) {
      // Taxas da Eventues: 7,99% ou R$2 fixos
      const eventuesFee = price >= 20 ? price * 0.0799 * quantity : 2 * quantity;
      // Taxas de concorrentes: supondo 10% sem mínimo
      const competitorFee = price * 0.1 * quantity;
      const calculatedSavings = competitorFee - eventuesFee;
      setSavings(calculatedSavings);
    } else {
      setSavings(null);
    }
  };

  return (
    <Box sx={{ py: 8, backgroundColor: '#F7F7F7' }}>
      <Container maxWidth="md">
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          align="center"
          sx={{ mb: 4, fontWeight: 'bold' }}
        >
          Calcule sua Economia com a Eventues
        </Typography>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
            onSubmit={(e) => {
              e.preventDefault();
              handleCalculate();
            }}
          >
            <TextField
              label="Valor do Ingresso (R$)"
              type="number"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              fullWidth
              required
              InputProps={{
                inputProps: { min: 0, step: '0.01' },
              }}
            />
            <TextField
              label="Quantidade de Ingressos"
              type="number"
              value={ticketQuantity}
              onChange={(e) => setTicketQuantity(e.target.value)}
              fullWidth
              required
              InputProps={{
                inputProps: { min: 1 },
              }}
            />
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Como deseja cobrar a taxa?
              </Typography>
              <RadioGroup
                row
                value={feeOption}
                onChange={(e) => setFeeOption(e.target.value)}
              >
                <FormControlLabel
                  value="repassar"
                  control={<Radio />}
                  label="Repassar ao participante"
                />
                <FormControlLabel
                  value="absorver"
                  control={<Radio />}
                  label="Absorver a taxa"
                />
              </RadioGroup>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleCalculate}
              sx={{ mt: 2 }}
            >
              Calcular Economia
            </Button>
            {savings !== null && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  Sua economia estimada:
                </Typography>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  R$ {savings.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  *Comparado com a média do mercado de 10%
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default EconomyCalculator;
