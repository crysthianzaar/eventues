'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, CircularProgress, Alert, Typography, Divider } from '@mui/material';
import { useRouter } from 'next/navigation';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { styled } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../../../../firebase';
import { fetchUserData } from '../../api/userApi';
import { PaymentFormData, CustomerData, TicketData, PaymentTicket, PaymentResult } from './types';
import { PaymentMethods } from './PaymentMethods';
import { CreditCardForm } from './CreditCardForm';
import { PaymentSuccess } from './PaymentSuccess';
import { usePaymentSubmit } from './hooks/usePaymentSubmit';
import { usePaymentStatus } from './hooks/usePaymentStatus';
import PaymentSummary from './PaymentSummary';
import { Ingresso } from '@/app/apis/api';
import { calculatePlatformFee } from '../../utils/calculateFee';
import { formatPrice } from '@/app/utils/formatPrice';

const CheckoutContainer = styled(Box)(({ theme }) => ({
  maxWidth: 800,
  margin: '0 auto',
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2, 0)
  }
}));

const Section = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: 0,
    boxShadow: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  fontSize: '1.1rem',
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-1px)'
  },
  [theme.breakpoints.down('sm')]: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 0,
    zIndex: 1000
  }
}));

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
  const router = useRouter();
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

  const tickets: Ingresso[] = useMemo(() => 
    ticketData.map(ticket => ({
      id: ticket.id,
      nome: ticket.name,
      descricao: '',
      valor: ticket.price,
      totalIngressos: ticket.quantity,
      fimVendas: new Date().toISOString(),
      status: 'active'
    }))
  , [ticketData]);

  const selectedQuantities = useMemo(() => 
    ticketData.reduce((acc, ticket) => ({
      ...acc,
      [ticket.id]: ticket.quantity
    }), {})
  , [ticketData]);

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

  const totalAmount = useMemo(() => {
    const subtotal = ticketData.reduce((total, ticket) => total + (ticket.price * ticket.quantity), 0);
    const fees = ticketData.reduce((total, ticket) => {
      const fee = calculatePlatformFee(ticket.price);
      return total + (fee * ticket.quantity);
    }, 0);
    return subtotal + fees;
  }, [ticketData]);

  useEffect(() => {
    let mounted = true;

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

  const handleSelectChange = (value: 'PIX' | 'BOLETO' | 'CREDIT_CARD') => {
    setFormData({ ...formData, paymentMethod: value });
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
    <CheckoutContainer>
      <Section>
        <PaymentSummary tickets={tickets} selectedQuantities={selectedQuantities} />
      </Section>

      <Section>
        {paymentResult ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {paymentResult.billingType === 'PIX' && !showSuccessOverlay && (
              <Box sx={{ maxWidth: '500px', width: '100%', mx: 'auto', p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                  Pagamento via PIX
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pagamento para {ticketData[0]?.name}
                </Typography>

                <Box sx={{ my: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(paymentResult.value)}
                  </Typography>
                  
                  {paymentResult.pixQrCode?.expirationDate && (
                    <Typography variant="caption" color="error">
                      Expira em: {new Date(paymentResult.pixQrCode.expirationDate).toLocaleString('pt-BR')}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src={`data:image/png;base64,${paymentResult.encodedImage}`}
                    alt="PIX QR Code"
                    style={{ maxWidth: 200, marginBottom: 16 }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => paymentResult.payload && navigator.clipboard.writeText(paymentResult.payload)}
                    startIcon={<ContentCopyIcon />}
                    sx={{ mb: 1, width: '100%' }}
                  >
                    Copiar código PIX
                  </Button>
                  {paymentResult.invoiceUrl && (
                    <Button
                      variant="outlined"
                      href={paymentResult.invoiceUrl}
                      target="_blank"
                      startIcon={<LaunchIcon />}
                      sx={{ width: '100%' }}
                    >
                      Ver comprovante
                    </Button>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Você pode fechar esta janela e pagar depois através do link enviado ao seu email
                </Typography>

                <Button
                  variant="text"
                  onClick={() => router.push(`/i/${paymentResult.id}`)}
                  startIcon={<AssignmentIcon />}
                  sx={{ width: '100%' }}
                >
                  Ver minhas inscrições
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
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Você pode fechar esta janela e pagar depois através do link enviado ao seu email
                </Typography>

                <Button
                  variant="text"
                  onClick={() => router.push(`/i/${paymentResult.id}`)}
                  startIcon={<AssignmentIcon />}
                  sx={{ width: '100%' }}
                >
                  Ver minhas inscrições
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <>
            <PaymentMethods
              formData={formData}
              onChange={handleChange}
              onSelectChange={handleSelectChange}
              disabled={loading}
            />

            {formData.paymentMethod === 'CREDIT_CARD' && (
              <Box sx={{ mt: 3 }}>
                <CreditCardForm
                  formData={formData}
                  onCardNumberChange={handleCardNumberChange}
                  onCardHolderNameChange={(value) => setFormData(prev => ({ ...prev, cardHolderName: value }))}
                  onCardExpiryChange={handleCardExpiryChange}
                  onCardCVVChange={handleCardCVVChange}
                  onPostalCodeChange={(value) => setFormData(prev => ({ ...prev, postalCode: value }))}
                  onInputFocus={handleInputFocus}
                />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </Section>

      {!paymentResult && (
        <Box sx={{ px: { xs: 2, sm: 0 }, pb: { xs: 7, sm: 0 } }}>
          <SubmitButton
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
          >
            {loading ? 'Processando...' : `Pagar ${formatPrice(totalAmount)}`}
          </SubmitButton>
        </Box>
      )}

      {showSuccessModal && <PaymentSuccess />}
      {showSuccessOverlay && <PaymentSuccess />}
    </CheckoutContainer>
  );
}
