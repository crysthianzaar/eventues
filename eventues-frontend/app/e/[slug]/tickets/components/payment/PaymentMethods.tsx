'use client';

import React from 'react';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface PaymentMethodsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    cpfCnpj: string;
    paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (e: SelectChangeEvent<'PIX' | 'BOLETO' | 'CREDIT_CARD'>) => void;
  disabled?: boolean;
}

export function PaymentMethods({
  formData,
  onChange,
  onSelectChange,
  disabled
}: PaymentMethodsProps) {
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Nome Completo"
          name="name"
          value={formData.name}
          onChange={onChange}
          disabled={disabled}
          variant="outlined"
          size="medium"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white'
            }
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          disabled={disabled}
          variant="outlined"
          size="medium"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white'
            }
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Telefone"
          name="phone"
          value={formData.phone || ''}
          onChange={onChange}
          disabled={disabled}
          variant="outlined"
          size="medium"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white'
            }
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="CPF/CNPJ"
          name="cpfCnpj"
          value={formData.cpfCnpj}
          onChange={onChange}
          disabled={disabled}
          variant="outlined"
          size="medium"
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'white'
            }
          }}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth required>
          <InputLabel id="payment-method-label">Método de Pagamento</InputLabel>
          <Select
            labelId="payment-method-label"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={onSelectChange}
            disabled={disabled}
            label="Método de Pagamento"
            size="medium"
            sx={{
              bgcolor: 'white'
            }}
          >
            <MenuItem value="PIX">PIX</MenuItem>
            <MenuItem value="CREDIT_CARD">Cartão de Crédito</MenuItem>
            <MenuItem value="BOLETO">Boleto</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
