'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, CircularProgress, Alert, Grid, SelectChangeEvent } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../../../../firebase';
import { fetchUserData } from '../../api/userApi';
import { PaymentFormData, CustomerData, TicketData } from './types';
import { PaymentMethods } from './PaymentMethods';
import { CreditCardForm } from './CreditCardForm';
import { PaymentSummary } from './PaymentSummary';
import { PaymentSuccess } from './PaymentSuccess';
import { usePaymentSubmit } from './hooks/usePaymentSubmit';
import { usePaymentStatus } from './hooks/usePaymentStatus';

// Definindo a variável de ambiente
declare const process: {
  env: {
    NEXT_PUBLIC_BACKEND_API_URL: string;
  }
};

interface PaymentComponentProps {
  eventId: string;
  ticketId: string;
  customerData: CustomerData;
  ticketData: TicketData[];
  onPaymentSuccess: (orderId: string) => void;
  onPaymentError: (error: string) => void;
}

export default function PaymentComponent({
  eventId,
  ticketId,
  customerData,
  ticketData,
  onPaymentSuccess,
  onPaymentError
}: PaymentComponentProps) {
  const [user] = useAuthState(auth);
  const [loadingUserData, setLoadingUserData] = useState(false);
  
  const [formData, setFormData] = useState<PaymentFormData>({
    name: customerData.name || '',
    email: customerData.email || '',
    cpfCnpj: customerData.cpf || '',
    paymentMethod: 'PIX',
    phone: customerData.phone || '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardHolderName: '',
    cardFocus: '',
    cardType: '',
    postalCode: '',
  });

  const { 
    loading, 
    error, 
    paymentResult, 
    submitPayment, 
    setError 
  } = usePaymentSubmit();

  const {
    showSuccessModal,
    showSuccessOverlay,
  } = usePaymentStatus(paymentResult, user!);

  const totalAmount = useMemo(() => 
    ticketData.reduce((total, ticket) => total + (ticket.price * ticket.quantity), 0)
  , [ticketData]);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setTimeout> | null = null;

    const loadUserData = async () => {
      if (!user || !mounted) return;
      
      setLoadingUserData(true);
      try {
        const userData = await fetchUserData(user);
        if (!mounted) return;
        
        setFormData(prev => ({
          ...prev,
          name: prev.name || userData.name || '',
          email: prev.email || userData.email || '',
          phone: prev.phone || userData.phone_number || '',
          cardHolderName: prev.cardHolderName || userData.name || '',
        }));
      } catch (err) {
        console.error('Error fetching user data:', err);
        if (!mounted) return;
        
        if (!customerData.name && !customerData.email) {
          setError('Não foi possível carregar seus dados. Por favor, preencha manualmente.');
        }
      } finally {
        if (mounted) {
          setLoadingUserData(false);
        }
      }
    };

    loadUserData();
    return () => { mounted = false; };
  }, [user, customerData, setFormData, setError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent<'PIX' | 'BOLETO' | 'CREDIT_CARD'>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      const formatted = value.replace(/(\d{2})(\d{2})/, '$1/$2').trim();
      setFormData(prev => ({ ...prev, cardExpiry: formatted }));
    }
  };

  const handleCardCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setFormData(prev => ({ ...prev, cardCvv: value }));
    }
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFormData(prev => ({ 
      ...prev, 
      cardFocus: e.target.name as 'number' | 'name' | 'expiry' | 'cvc' | '' 
    }));
  };

  const handleSubmit = async () => {
    try {
      const result = await submitPayment(
        formData,
        user!,
        eventId,
        ticketData
      );
      
      if (result.billingType !== 'PIX' || result.status === 'CONFIRMED') {
        onPaymentSuccess(result.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar pagamento';
      onPaymentError(errorMessage);
    }
  };

  return (
    <Box 
      component="form" 
      noValidate 
      sx={{ 
        mt: 3,
        p: { xs: 2, sm: 3 },
        bgcolor: '#f8f9fa',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ p: { xs: 3, sm: 4 } }}>
        <PaymentSummary ticketData={ticketData} />
      </Box>

      <Box 
        sx={{ 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          width: '100%'
        }} 
      />

      <Box sx={{ p: { xs: 3, sm: 4 } }}>
        <Grid container spacing={2.5}>
          {paymentResult ? (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {paymentResult.billingType === 'PIX' && !showSuccessOverlay && (
                  <Box sx={{ textAlign: 'center', maxWidth: '500px', width: '100%', mx: 'auto' }}>
                    <img
                      src={`data:image/png;base64,${paymentResult.encodedImage}`}
                      alt="PIX QR Code"
                      style={{ maxWidth: 200 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => paymentResult.payload && navigator.clipboard.writeText(paymentResult.payload)}
                      sx={{ mt: 1 }}
                    >
                      Copiar código PIX
                    </Button>
                  </Box>
                )}

                {paymentResult.billingType === 'BOLETO' && paymentResult.bankSlipUrl && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      variant="contained"
                      href={paymentResult.bankSlipUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visualizar Boleto
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>
          ) : (
            <>
              <PaymentMethods
                formData={formData}
                onChange={handleChange}
                onSelectChange={handleSelectChange}
                disabled={loading}
              />

              {formData.paymentMethod === 'CREDIT_CARD' && (
                <CreditCardForm
                  formData={formData}
                  onCardNumberChange={handleCardNumberChange}
                  onCardHolderNameChange={(value) => setFormData(prev => ({ ...prev, cardHolderName: value }))}
                  onCardExpiryChange={handleCardExpiryChange}
                  onCardCVVChange={handleCardCVVChange}
                  onPostalCodeChange={(value) => setFormData(prev => ({ ...prev, postalCode: value }))}
                  onInputFocus={handleInputFocus}
                />
              )}

              {error && (
                <Grid item xs={12}>
                  <Alert severity="error">
                    {error}
                  </Alert>
                </Grid>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
                  sx={{ 
                    minWidth: 200,
                    py: 1.5,
                    px: 4,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {loading ? 'Processando...' : `Pagar ${formatPrice(totalAmount)}`}
                </Button>
              </Box>
            </>
          )}
        </Grid>
      </Box>

      {showSuccessModal && <PaymentSuccess />}
      {showSuccessOverlay && <PaymentSuccess />}
    </Box>
  );
}

const formatPrice = (price: number) => {
  return `R$ ${price.toFixed(2)}`;
};
