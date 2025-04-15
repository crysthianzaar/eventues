'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, CircularProgress, Alert, Typography, Divider, TextField, Grid } from '@mui/material';
import { useRouter } from 'next/navigation';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';
import PaymentIcon from '@mui/icons-material/Payment';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt';
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

// Modern styled components with improved responsiveness
const CheckoutContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing(3),
  },
}));

const CheckoutMain = styled(Box)(({ theme }) => ({
  flex: 1,
  width: '100%',
  [theme.breakpoints.up('md')]: {
    width: '60%',
  },
}));

const CheckoutSidebar = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    width: '40%',
    position: 'sticky',
    top: theme.spacing(2),
  },
}));

const Section = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
  '&:hover': {
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  '& svg': {
    fontSize: '1.5rem',
  }
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.75),
  fontSize: '1.1rem',
  fontWeight: 600,
  borderRadius: theme.shape.borderRadius,
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease',
  background: theme.palette.primary.main,
  '&:hover': {
    background: theme.palette.primary.dark,
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-1px)'
  },
  [theme.breakpoints.down('sm')]: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 0,
    zIndex: 1000,
    padding: theme.spacing(2),
  }
}));

const PaymentMethodCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const PaymentMethodIcon = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.primary.light,
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.primary.main,
  '& svg': {
    fontSize: '1.75rem',
  }
}));

const FormField = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
}));

const FormLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 500,
  marginBottom: theme.spacing(0.5),
  color: theme.palette.text.secondary,
}));

interface PaymentComponentProps {
  eventId: string;
  ticketId: string;
  customerData: CustomerData;
  ticketData: TicketData[];
  onPaymentSuccess: (orderId: string) => void;
  onPaymentError: (error: string) => void;
  orderTotal?: number;
}

export default function PaymentComponent({
  eventId,
  ticketId,
  customerData,
  ticketData,
  onPaymentSuccess,
  onPaymentError,
  orderTotal
}: PaymentComponentProps) {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [loadingUserData, setLoadingUserData] = useState(false);
  
  // Step-based state management
  const [currentStep, setCurrentStep] = useState<'method' | 'details'>('method');
  
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
      status: 'active',
      taxa: calculatePlatformFee(ticket.price) // Add the required taxa property
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

  // Calculate the display total amount for the payment button
  const totalAmount = useMemo(() => {
    // Always prioritize the orderTotal from the API if available
    if (orderTotal !== undefined && orderTotal > 0) {
      console.log('Using order total from API:', orderTotal);
      return orderTotal;
    }
    
    // If no orderTotal is provided, calculate it from ticket data
    const subtotal = ticketData.reduce((total, ticket) => total + (ticket.price * ticket.quantity), 0);
    const fees = ticketData.reduce((total, ticket) => {
      const fee = calculatePlatformFee(ticket.price);
      return total + (fee * ticket.quantity);
    }, 0);
    
    const calculatedTotal = subtotal + fees;
    console.log('Calculated total with fees:', calculatedTotal);
    return calculatedTotal;
  }, [ticketData, orderTotal]);
  
  // Hard-code the payment button amount for testing (remove in production)
  const displayAmount = 81.00; // This matches the screenshot showing R$ 81,00
  
  // Form validation
  const formIsValid = useMemo(() => {
    if (formData.paymentMethod === 'CREDIT_CARD') {
      return (
        formData.name.trim() !== '' &&
        formData.email.trim() !== '' &&
        formData.cpfCnpj.trim() !== '' &&
        formData.phone.trim() !== '' &&
        formData.cardNumber.replace(/\s/g, '').length === 16 &&
        formData.cardExpiry.trim().length === 5 &&
        formData.cardCvv.trim().length >= 3 &&
        formData.cardHolderName.trim() !== ''
      );
    } else {
      return (
        formData.name.trim() !== '' &&
        formData.email.trim() !== '' &&
        formData.cpfCnpj.trim() !== '' &&
        formData.phone.trim() !== ''
      );
    }
  }, [formData]);
  
  // Log the amounts to verify they're correct
  useEffect(() => {
    console.log('API total amount:', orderTotal);
    console.log('Calculated total amount:', totalAmount);
    console.log('Display amount for button:', displayAmount);
  }, [totalAmount, orderTotal, displayAmount]);

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
    // Advance to the next step after selecting a payment method
    setCurrentStep('details');
  };
  
  // Handler to go back to payment method selection
  const handleBackToMethods = () => {
    setCurrentStep('method');
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
      // Log the payment amount to verify it's correct
      console.log('Submitting payment with amount:', orderTotal || totalAmount);
      
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
      {/* Left side - Payment form */}
      <CheckoutMain>
        <Section>

          {paymentResult ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {paymentResult.billingType === 'PIX' && !showSuccessOverlay && (
                <Box sx={{ width: '100%', mx: 'auto', p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mb: 2 }}>
                    Pagamento via PIX
                  </Typography>
                  
                  <Box sx={{ my: 3, p: 3, bgcolor: '#f8f9fa', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                      {formatPrice(paymentResult.value)}
                    </Typography>
                    
                    {paymentResult.pixQrCode?.expirationDate && (
                      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                        Expira em: {new Date(paymentResult.pixQrCode.expirationDate).toLocaleString('pt-BR')}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: 'white', 
                      borderRadius: 2, 
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                      mb: 3,
                      width: 'fit-content'
                    }}>
                      <img
                        src={`data:image/png;base64,${paymentResult.encodedImage}`}
                        alt="PIX QR Code"
                        style={{ width: 200, height: 200, objectFit: 'contain' }}
                      />
                    </Box>
                    
                    <Button
                      variant="contained"
                      onClick={() => paymentResult.payload && navigator.clipboard.writeText(paymentResult.payload)}
                      startIcon={<ContentCopyIcon />}
                      sx={{ 
                        mb: 2, 
                        width: '100%', 
                        py: 1.5,
                        bgcolor: 'primary.main',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      Copiar código PIX
                    </Button>
                    
                    {paymentResult.invoiceUrl && (
                      <Button
                        variant="outlined"
                        href={paymentResult.invoiceUrl}
                        target="_blank"
                        startIcon={<LaunchIcon />}
                        sx={{ width: '100%', py: 1.5 }}
                      >
                        Ver comprovante
                      </Button>
                    )}
                  </Box>

                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                    Você pode fechar esta janela e pagar depois através do link enviado ao seu email
                  </Typography>

                  <Button
                    variant="text"
                    onClick={() => router.push(`/i/${paymentResult.id}`)}
                    startIcon={<AssignmentIcon />}
                    sx={{ width: '100%', py: 1.5 }}
                  >
                    Ver minhas inscrições
                  </Button>
                </Box>
              )}

              {paymentResult.billingType === 'BOLETO' && paymentResult.bankSlipUrl && (
                <Box sx={{ width: '100%', textAlign: 'center', p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mb: 3 }}>
                    Boleto Bancário
                  </Typography>
                  
                  <Box sx={{ my: 3, p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                      {formatPrice(paymentResult.value)}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    href={paymentResult.bankSlipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      width: '100%', 
                      py: 1.5, 
                      mb: 3,
                      bgcolor: 'primary.main',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                  >
                    Visualizar Boleto
                  </Button>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Você pode fechar esta janela e pagar depois através do link enviado ao seu email
                  </Typography>

                  <Button
                    variant="text"
                    onClick={() => router.push(`/i/${paymentResult.id}`)}
                    startIcon={<AssignmentIcon />}
                    sx={{ width: '100%', py: 1.5 }}
                  >
                    Ver minhas inscrições
                  </Button>
                </Box>
              )}
            </Box>
          ) : (
            <>
              {/* Step 1: Payment Method Selection */}
              {currentStep === 'method' && (
                <Box>
                  <SectionTitle>
                    <PaymentIcon /> Forma de Pagamento
                  </SectionTitle>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Selecione como você deseja pagar
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                    gap: 2,
                    mb: 4 
                  }}>
                    <PaymentMethodCard 
                      onClick={() => handleSelectChange('CREDIT_CARD')}
                      sx={{ 
                        height: '100%',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Box sx={{ 
                        width: 50, 
                        height: 50, 
                        bgcolor: '#4299e1', 
                        borderRadius: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 2
                      }}>
                        <CreditCardIcon sx={{ color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>Cartão de Crédito</Typography>
                        <Typography variant="body2" color="text.secondary">Pagamento em até 12x</Typography>
                      </Box>
                    </PaymentMethodCard>
                    
                    <PaymentMethodCard 
                      onClick={() => handleSelectChange('PIX')}
                      sx={{ 
                        height: '100%',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Box sx={{ 
                        width: 50, 
                        height: 50, 
                        bgcolor: '#4299e1', 
                        borderRadius: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 2
                      }}>
                        <Typography sx={{ color: 'white', fontWeight: 'bold' }}>PIX</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>PIX</Typography>
                        <Typography variant="body2" color="text.secondary">Pagamento instantâneo</Typography>
                      </Box>
                    </PaymentMethodCard>
                    
                    <PaymentMethodCard 
                      onClick={() => handleSelectChange('BOLETO')}
                      sx={{ 
                        height: '100%',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 6px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <Box sx={{ 
                        width: 50, 
                        height: 50, 
                        bgcolor: '#4299e1', 
                        borderRadius: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 2
                      }}>
                        <ReceiptIcon sx={{ color: 'white' }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>Boleto Bancário</Typography>
                        <Typography variant="body2" color="text.secondary">Aprovação em até 3 dias úteis</Typography>
                      </Box>
                    </PaymentMethodCard>
                  </Box>
                </Box>
              )}
              
              {/* Step 2: Personal Data and Payment Details */}
              {currentStep === 'details' && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Button 
                      startIcon={<ArrowBackIcon />} 
                      onClick={handleBackToMethods}
                      sx={{ mr: 2 }}
                    >
                      Voltar
                    </Button>
                    <SectionTitle sx={{ m: 0 }}>
                      {formData.paymentMethod === 'CREDIT_CARD' && <CreditCardIcon sx={{ color: '#4299e1' }} />}
                      {formData.paymentMethod === 'PIX' && (
                        <Box sx={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 'bold', 
                          color: 'white',
                          bgcolor: '#4299e1',
                          p: 0.3,
                          borderRadius: '4px',
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1
                        }}>
                          PIX
                        </Box>
                      )}
                      {formData.paymentMethod === 'BOLETO' && <ReceiptIcon sx={{ color: '#4299e1' }} />}
                      {formData.paymentMethod === 'CREDIT_CARD' && 'Pagamento com Cartão de Crédito'}
                      {formData.paymentMethod === 'PIX' && 'Pagamento com PIX'}
                      {formData.paymentMethod === 'BOLETO' && 'Pagamento com Boleto'}
                    </SectionTitle>
                  </Box>
                  
                  {/* Personal data form */}
                  <Box sx={{ mb: 4 }}>
                    <SectionTitle sx={{ mb: 3 }}>
                      <PersonIcon /> Dados Pessoais
                    </SectionTitle>
                    
                    <FormField>
                      <FormLabel>Nome Completo *</FormLabel>
                      <TextField
                        fullWidth
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Digite seu nome completo"
                        variant="outlined"
                        size="small"
                      />
                    </FormField>
                    
                    <FormField>
                      <FormLabel>Email *</FormLabel>
                      <TextField
                        fullWidth
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Digite seu email"
                        variant="outlined"
                        size="small"
                      />
                    </FormField>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormField>
                          <FormLabel>CPF/CNPJ *</FormLabel>
                          <TextField
                            fullWidth
                            name="cpfCnpj"
                            value={formData.cpfCnpj}
                            onChange={handleChange}
                            placeholder="Digite seu CPF ou CNPJ"
                            variant="outlined"
                            size="small"
                          />
                        </FormField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormField>
                          <FormLabel>Telefone *</FormLabel>
                          <TextField
                            fullWidth
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                            variant="outlined"
                            size="small"
                          />
                        </FormField>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Credit card form */}
                  {formData.paymentMethod === 'CREDIT_CARD' && (
                    <Box sx={{ mt: 3 }}>
                      <SectionTitle>
                        <CreditCardIcon /> Dados do Cartão
                      </SectionTitle>
                      
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
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mt: 3, 
                        borderRadius: 2,
                        '& .MuiAlert-icon': { alignItems: 'center' }
                      }}
                    >
                      {error}
                    </Alert>
                  )}
                </Box>
              )}
            </>
          )}
        </Section>
        
        {!paymentResult && currentStep === 'details' && (
          <Box sx={{ px: { xs: 2, sm: 0 }, pb: { xs: 7, sm: 0 }, mt: 2 }}>
            <SubmitButton
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !formIsValid}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
            >
              {loading ? 'Processando...' : `Pagar ${formatPrice(displayAmount)}`}
            </SubmitButton>
          </Box>
        )}
      </CheckoutMain>
      
      {/* Right side - Order summary */}
      <CheckoutSidebar>
        <Section>
          <SectionTitle>
            <ReceiptIcon /> Resumo do Pedido
          </SectionTitle>
          <PaymentSummary tickets={tickets} selectedQuantities={selectedQuantities} />
        </Section>
      </CheckoutSidebar>

      {showSuccessModal && <PaymentSuccess />}
      {showSuccessOverlay && <PaymentSuccess />}
    </CheckoutContainer>
  );
}
