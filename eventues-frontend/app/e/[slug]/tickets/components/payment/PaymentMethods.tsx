'use client';

import React from 'react';
import { Box, Typography, Grid, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CreditCard, Pix, Receipt } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';

const PaymentOption = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '10'
  },
  '&.selected': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light + '15'
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5)
  }
}));

const PaymentIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.light + '20',
  color: theme.palette.primary.main,
  marginRight: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    width: 32,
    height: 32,
    marginRight: theme.spacing(1.5)
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:hover': {
      borderColor: theme.palette.primary.main
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`
    }
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiOutlinedInput-input': {
      padding: '12px'
    }
  }
}));

interface PaymentMethodsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    cpfCnpj: string;
    paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (value: 'PIX' | 'BOLETO' | 'CREDIT_CARD') => void;
  disabled?: boolean;
}

const paymentMethods = [
  {
    value: 'CREDIT_CARD',
    label: 'Cartão de Crédito',
    icon: <CreditCard />
  },
  {
    value: 'PIX',
    label: 'PIX',
    icon: <Pix />
  },
  {
    value: 'BOLETO',
    label: 'Boleto Bancário',
    icon: <Receipt />
  }
];

export function PaymentMethods({
  formData,
  onChange,
  onSelectChange,
  disabled
}: PaymentMethodsProps) {
  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
        Dados Pessoais
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <StyledTextField
            required
            fullWidth
            label="Nome Completo"
            name="name"
            value={formData.name}
            onChange={onChange}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12}>
          <StyledTextField
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <StyledTextField
            required
            fullWidth
            label="CPF/CNPJ"
            name="cpfCnpj"
            value={formData.cpfCnpj}
            onChange={onChange}
            disabled={disabled}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <StyledTextField
            fullWidth
            label="Telefone"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            disabled={disabled}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ fontWeight: 500, mt: 4, mb: 2 }}>
        Forma de Pagamento
      </Typography>

      <RadioGroup 
        value={formData.paymentMethod}
        onChange={(e) => onSelectChange(e.target.value as 'PIX' | 'BOLETO' | 'CREDIT_CARD')}
      >
        <Grid container spacing={2}>
          {paymentMethods.map((method) => (
            <Grid item xs={12} key={method.value}>
              <FormControlLabel
                value={method.value}
                control={<Radio />}
                label={
                  <PaymentOption className={formData.paymentMethod === method.value ? 'selected' : ''}>
                    <PaymentIcon>
                      {method.icon}
                    </PaymentIcon>
                    <Typography>
                      {method.label}
                    </Typography>
                  </PaymentOption>
                }
                sx={{ margin: 0, width: '100%' }}
              />
            </Grid>
          ))}
        </Grid>
      </RadioGroup>
    </Box>
  );
}
