'use client';

import React from 'react';
import { Grid, TextField, Box } from '@mui/material';
import { CardFlag } from './CardFlag';

interface CreditCardFormProps {
  formData: {
    cardNumber: string;
    cardHolderName: string;
    cardExpiry: string;
    cardCvv: string;
    postalCode: string;
  };
  onCardNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCardHolderNameChange: (value: string) => void;
  onCardExpiryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCardCVVChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPostalCodeChange: (value: string) => void;
  onInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export function CreditCardForm({
  formData,
  onCardNumberChange,
  onCardHolderNameChange,
  onCardExpiryChange,
  onCardCVVChange,
  onPostalCodeChange,
  onInputFocus
}: CreditCardFormProps) {
  const getCardType = (number: string) => {
    const firstDigit = number.charAt(0);
    if (firstDigit === '4') return 'visa';
    if (firstDigit === '5') return 'mastercard';
    return '';
  };

  return (
    <Grid container spacing={2.5}>
      {/* Cartão Preview */}
      <Grid item xs={12} sx={{ mb: 3 }}>
        <Box sx={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2
        }}>
          <Box sx={{
            width: '100%',
            maxWidth: '360px',
            height: '200px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0033cc 0%, #0066ff 100%)',
            position: 'relative',
            color: 'white',
            p: 2.5,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <Box sx={{
              fontSize: '1.5rem',
              letterSpacing: '2px',
              mt: 4,
              mb: 2,
              fontFamily: 'monospace'
            }}>
              {formData.cardNumber || '•••• •••• •••• ••••'}
            </Box>
            <Box sx={{
              position: 'absolute',
              top: 20,
              right: 20
            }}>
              <CardFlag type={getCardType(formData.cardNumber)} />
            </Box>
            <Box sx={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: 'monospace'
            }}>
              {formData.cardHolderName || 'NOME NO CARTÃO'}
            </Box>
            <Box sx={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}>
              {formData.cardExpiry || 'MM/AA'}
            </Box>
          </Box>
        </Box>
      </Grid>

      {/* Formulário */}
      <Grid item xs={12}>
        <Grid container spacing={2}>
        <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Informe o seu CEP do seu Endereço"
              name="postalCode"
              value={formData.postalCode}
              onChange={(e) => onPostalCodeChange(e.target.value.replace(/\D/g, ''))}
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
              label="Número do cartão"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={onCardNumberChange}
              onFocus={onInputFocus}
              inputProps={{ maxLength: 19 }}
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
              label="Nome no cartão"
              name="cardHolderName"
              value={formData.cardHolderName}
              onChange={(e) => onCardHolderNameChange(e.target.value.toUpperCase())}
              onFocus={onInputFocus}
              helperText="Conforme aparece no cartão"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white'
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              fullWidth
              label="Data de vencimento"
              name="cardExpiry"
              value={formData.cardExpiry}
              onChange={onCardExpiryChange}
              onFocus={onInputFocus}
              inputProps={{ maxLength: 5 }}
              helperText="Mês / Ano"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white'
                }
              }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              required
              fullWidth
              label="CVV"
              name="cardCvv"
              value={formData.cardCvv}
              onChange={onCardCVVChange}
              onFocus={onInputFocus}
              inputProps={{ maxLength: 4 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'white'
                }
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
