'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import 'react-credit-cards-2/dist/es/styles-compiled.css';
import PaymentIcon from '@mui/icons-material/Payment';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../../../firebase';

const getCardType = (number: string) => {
  const re = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/
  };
  
  if (re.visa.test(number.replace(/\s/g, ''))) return 'visa';
  if (re.mastercard.test(number.replace(/\s/g, ''))) return 'mastercard';
  return 'unknown';
};

const CardFlag = ({ type }: { type: string }) => {
  if (type === 'visa') {
    return (
      <svg width="65" height="40" viewBox="0 0 750 471" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M278.197 334.228L306.79 137.384H352.512L323.919 334.228H278.197Z" fill="white"/>
        <path d="M524.308 142.688C515.991 139.296 502.924 135.603 486.707 135.603C428.824 135.603 387.309 166.421 387.009 209.868C386.71 241.886 416.357 259.54 438.796 269.847C461.836 280.455 469.252 287.24 469.252 296.646C469.052 311.651 450.668 318.436 433.551 318.436C409.61 318.436 396.843 314.442 376.906 305.337L369.789 301.944L362.073 342.732C372.243 347.327 392.779 351.321 414.319 351.622C475.953 351.622 516.869 321.105 517.269 275.344C517.569 250.09 502.025 230.854 465.459 214.763C443.32 204.456 430.253 197.37 430.253 186.762C430.453 177.055 441.522 167.048 467.916 167.048C489.756 167.048 505.573 170.441 517.569 174.435L522.632 176.727L530.347 137.241L524.308 142.688Z" fill="white"/>
        <path d="M661.544 137.384H625.577C612.81 137.384 603.294 141.077 598.231 155.181L513.512 334.228H559.534C559.534 334.228 569.649 307.092 571.807 301.595C578.024 301.595 622.592 301.595 630.607 301.595C632.366 308.681 637.729 334.228 637.729 334.228H678.345L661.544 137.384ZM587.54 268.476C591.703 257.868 609.419 211.069 609.419 211.069C609.119 211.671 613.882 198.769 616.64 191.082L620.503 208.275C620.503 208.275 631.572 260.659 633.631 268.476H587.54Z" fill="white"/>
        <path d="M223.229 137.384L179.661 272.47L175.198 252.032C166.881 223.176 139.987 191.984 110.041 176.075L150.357 334.228H196.679L273.134 137.384H223.229Z" fill="white"/>
        <path d="M110.041 137.384H36.782L36.183 140.175C89.392 153.078 124.459 183.595 141.576 220.885L121.339 155.181C118.581 142.087 110.34 137.685 110.041 137.384Z" fill="white"/>
      </svg>
    );
  }
  if (type === 'mastercard') {
    return (
      <svg width="65" height="40" viewBox="0 0 750 471" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="284" cy="235" r="157" fill="#EB001B"/>
        <circle cx="466" cy="235" r="157" fill="#F79E1B"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M375 147.841C418.703 176.765 447.318 225.017 447.318 279.5C447.318 333.983 418.703 382.235 375 411.159C331.297 382.235 302.682 333.983 302.682 279.5C302.682 225.017 331.297 176.765 375 147.841Z" fill="#FF5F00"/>
      </svg>
    );
  }
  return null;
};

const cardStyle = `
  .rccs__card {
    width: 100%;
    max-width: 364px;
    height: 210px;
    border-radius: 12px;
    background: linear-gradient(135deg, #3b6e8f 0%, #2c3e50 100%);
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.2),
      inset 0 1px 1px rgba(255, 255, 255, 0.3),
      inset 0 -1px 1px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }
  .rccs__card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
    pointer-events: none;
  }
  .rccs__card__number {
    font-size: 20px;
    font-weight: 500;
    letter-spacing: 3px;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3),
                 0 0 4px rgba(255, 255, 255, 0.2);
    margin-bottom: 20px;
  }
  .rccs__name {
    font-size: 14px;
    font-weight: 500;
    color: white;
    text-transform: uppercase;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3),
                 0 0 4px rgba(255, 255, 255, 0.2);
    margin-bottom: 4px;
  }
  .rccs__expiry {
    font-size: 14px;
    font-weight: 500;
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3),
                 0 0 4px rgba(255, 255, 255, 0.2);
  }
  .rccs__issuer {
    position: absolute;
    top: 24px;
    right: 24px;
  }
  .rccs__chip {
    display: none;
  }
`;

interface PaymentComponentProps {
  eventId: string;
  ticketId: string;
  quantity: number;
  customerData: {
    name: string;
    email: string;
    cpf: string;
    phone?: string;
  };
  ticketData: {
    price: number;
    name: string;
  };
  onPaymentSuccess: (orderId: string) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentFormData {
  name: string;
  email: string;
  cpfCnpj: string;
  paymentMethod: 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardHolderName: string;
  cardFocus: 'number' | 'name' | 'expiry' | 'cvc' | '';
  cardType: string;
  phone?: string;
  postalCode?: string;
}

interface PaymentResult {
  id: string;
  status: string;
  value: number;
  payment_url?: string;
  invoiceUrl?: string;
  transactionReceiptUrl?: string;
  billingType: string;
  bankSlipUrl?: string;
  pixQrCode?: {
    encodedImage: string;
    payload: string;
    expirationDate: string;
  };
  encodedImage?: string;
  payload?: string;
  expirationDate?: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://127.0.0.1:8000'
  : (process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://obc5v0hl83.execute-api.sa-east-1.amazonaws.com');

const formatPrice = (price: number) => {
  return `R$ ${price.toFixed(2)}`;
};

const detectCardType = (number: string) => {
  const cleanNumber = number.replace(/\D/g, '');
  if (cleanNumber) {
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^(6011|65|64[4-9]|622)/.test(cleanNumber)) return 'discover';
    if (/^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/.test(cleanNumber)) return 'elo';
    if (/^(606282|3841)/.test(cleanNumber)) return 'hipercard';
  }
  return 'unknown';
};

export default function PaymentComponent({
  eventId,
  ticketId,
  quantity,
  customerData,
  ticketData,
  onPaymentSuccess,
  onPaymentError
}: PaymentComponentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user] = useAuthState(auth);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  
  const [formData, setFormData] = useState<PaymentFormData>({
    name: customerData.name,
    email: customerData.email,
    cpfCnpj: customerData.cpf,
    paymentMethod: 'PIX',
    phone: customerData.phone,
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardHolderName: '',
    cardFocus: '',
    cardType: '',
    postalCode: '', // Added postalCode field
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent<'PIX' | 'BOLETO' | 'CREDIT_CARD'>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, cardFocus: e.target.name as 'number' | 'name' | 'expiry' | 'cvc' | '' }));
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.replace(/(\d{4})/g, '$1 ').trim();
    const cardType = detectCardType(value);
    
    // Validate card number length based on type
    let maxLength = 16;
    if (cardType === 'amex') maxLength = 15;
    else if (cardType === 'discover' || cardType === 'mastercard') maxLength = 16;
    
    if (value.length <= maxLength) {
      setFormData(prev => ({ ...prev, cardNumber: formatted, cardType }));
    }
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

  const handleSubmit = async () => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      setLoading(true);
      setError(null);
      setPaymentResult(null);

      const token = await user.getIdToken();

      // Create customer first
      const customerResponse = await fetch(`${API_BASE_URL}/create-customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          cpfCnpj: formData.cpfCnpj,
          phone: formData.phone,
          postalCode: formData.postalCode, // Added postalCode
        }),
      });

      if (!customerResponse.ok) {
        throw new Error('Falha ao criar cliente');
      }

      const customer = await customerResponse.json();

      // Handle credit card tokenization if needed
      let creditCardToken;
      if (formData.paymentMethod === 'CREDIT_CARD') {
        // Parse expiry date (MM/YY format)
        const [expiryMonth, expiryYear] = (formData.cardExpiry || '').split('/').map(s => s.trim());
        
        // Validate expiration date
        if (!expiryMonth || !expiryYear || 
            isNaN(Number(expiryMonth)) || isNaN(Number(expiryYear)) ||
            Number(expiryMonth) < 1 || Number(expiryMonth) > 12) {
          throw new Error('Data de expiração do cartão inválida. Use o formato MM/YY (ex: 12/25)');
        }

        const cardData = {
          customer: customer.id,
          creditCard: {
            holderName: formData.cardHolderName,
            number: formData.cardNumber?.replace(/\D/g, ''),
            expiryMonth,
            expiryYear: `20${expiryYear}`, // Convert YY to YYYY
            ccv: formData.cardCvv,
          },
          creditCardHolderInfo: {
            name: formData.name,
            email: formData.email,
            cpfCnpj: formData.cpfCnpj,
            phone: formData.phone,
            postalCode: formData.postalCode, // Added postalCode
            addressNumber: '0',
            addressComplement: '',
            mobilePhone: formData.phone || '',
          },
        };

        console.log('[DEBUG] Tokenization request data:', JSON.stringify(cardData, null, 2));

        const tokenResponse = await fetch(`${API_BASE_URL}/tokenize-card`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cardData),
        });

        console.log('[DEBUG] Tokenization response status:', tokenResponse.status);
        const responseData = await tokenResponse.json();
        console.log('[DEBUG] Tokenization response:', JSON.stringify(responseData, null, 2));

        if (!tokenResponse.ok) {
          throw new Error(responseData.error || 'Falha ao tokenizar cartão');
        }

        creditCardToken = responseData;
      }

      // Create payment session
      const paymentResponse = await fetch(`${API_BASE_URL}/create_payment_session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customer: customer.id,
          event_id: eventId,
          ticket_id: ticketId,
          quantity: quantity,
          payment: {
            billingType: formData.paymentMethod,
            value: ticketData.price * quantity,
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            creditCard: creditCardToken ? {
              token: creditCardToken.creditCardToken,
              holderName: formData.cardHolderName,
              expiryMonth: formData.cardExpiry?.split('/')[0],
              expiryYear: formData.cardExpiry?.split('/')[1],
            } : undefined,
          }
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Falha no pagamento');
      }

      const result = await paymentResponse.json();
      
      // For PIX payments, fetch QR code
      if (result.billingType === 'PIX' && result.id) {
        const qrCodeResponse = await fetch(`${API_BASE_URL}/pix-qrcode/${result.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (qrCodeResponse.ok) {
          const qrCodeData = await qrCodeResponse.json();
          result.encodedImage = qrCodeData.encodedImage;
          result.payload = qrCodeData.payload;
          result.expirationDate = qrCodeData.expirationDate;
        }
      }

      setPaymentResult(result);
      // Only call onPaymentSuccess for non-PIX payments or when payment is confirmed
      if (result.billingType !== 'PIX' || result.status === 'CONFIRMED') {
        onPaymentSuccess(result.id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar pagamento';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" noValidate sx={{ mt: 3 }}>
      <Box sx={{ mt: 3 }}>
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>{ticketData.name}</Typography>
            <Typography>{formatPrice(ticketData.price)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Quantidade</Typography>
            <Typography>{quantity}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {formatPrice(ticketData.price * quantity)}
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Nome Completo"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
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
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="CPF/CNPJ"
              name="cpfCnpj"
              value={formData.cpfCnpj}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Telefone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Método de Pagamento</InputLabel>
              <Select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleSelectChange}
                disabled={loading}
              >
                <MenuItem value="PIX">PIX</MenuItem>
                <MenuItem value="BOLETO">Boleto</MenuItem>
                <MenuItem value="CREDIT_CARD">Cartão de Crédito</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formData.paymentMethod === 'CREDIT_CARD' && (
            <Box sx={{ mt: 4, mb: 4 }}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={7}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          name="number"
                          label="Número do cartão"
                          value={formData.cardNumber}
                          onChange={handleCardNumberChange}
                          onFocus={handleInputFocus}
                          placeholder="0000 0000 0000 0000"
                          inputProps={{ maxLength: 19 }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#F0F7FF',
                              '&.Mui-focused': {
                                bgcolor: '#F0F7FF',
                              }
                            },
                            '& .MuiOutlinedInput-input': {
                              letterSpacing: '2px'
                            }
                          }}
                        />
                        {formData.cardType !== 'unknown' && formData.cardType && (
                          <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block', textTransform: 'capitalize' }}>
                            Cartão {formData.cardType}
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          name="name"
                          label="Nome no cartão"
                          value={formData.cardHolderName}
                          onChange={(e) => setFormData(prev => ({ ...prev, cardHolderName: e.target.value.toUpperCase() }))}
                          onFocus={handleInputFocus}
                          placeholder="NOME COMO ESTÁ NO CARTÃO"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#F0F7FF',
                              '&.Mui-focused': {
                                bgcolor: '#F0F7FF',
                              }
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Conforme aparece no cartão
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          required
                          fullWidth
                          name="expiry"
                          label="Data de vencimento"
                          value={formData.cardExpiry}
                          onChange={handleCardExpiryChange}
                          onFocus={handleInputFocus}
                          placeholder="MM/AA"
                          inputProps={{ maxLength: 5 }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#F0F7FF',
                              '&.Mui-focused': {
                                bgcolor: '#F0F7FF',
                              }
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Mês / Ano
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          required
                          fullWidth
                          name="cvc"
                          label="Código de segurança"
                          value={formData.cardCvv}
                          onChange={handleCardCVVChange}
                          onFocus={handleInputFocus}
                          placeholder="***"
                          inputProps={{ maxLength: 4 }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#F0F7FF',
                              '&.Mui-focused': {
                                bgcolor: '#F0F7FF',
                              }
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          CVV
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          name="postalCode"
                          label="CEP"
                          value={formData.postalCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value.replace(/\D/g, '') }))}
                          placeholder="00000-000"
                          inputProps={{ maxLength: 9 }}
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              bgcolor: '#F0F7FF',
                              '&.Mui-focused': {
                                bgcolor: '#F0F7FF',
                              }
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          CEP
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                    <Box sx={{ width: '100%', maxWidth: 360, position: 'relative' }}>
                      <style>{cardStyle}</style>
                      <Box className="rccs__card">
                        <Box className="rccs__issuer">
                          <CardFlag type={getCardType(formData.cardNumber.replace(/\s/g, ''))} />
                        </Box>
                        <Box className="rccs__card__number">
                          {formData.cardNumber || '•••• •••• •••• ••••'}
                        </Box>
                        <Box>
                          <Box className="rccs__name">
                            {formData.cardHolderName || 'NOME NO CARTÃO'}
                          </Box>
                          <Box className="rccs__expiry">
                            {formData.cardExpiry || 'MM/AA'}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Processando...' : `Pagar ${formatPrice(ticketData.price * quantity)}`}
            </Button>
          </Box>

          {paymentResult && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                {paymentResult.status === 'CONFIRMED' ? 'Pagamento Confirmado' : 'Pagamento Pendente'}
              </Typography>

              {paymentResult.billingType === 'PIX' && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography gutterBottom>
                    Escaneie o QR Code ou copie o código PIX:
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <img
                      src={`data:image/png;base64,${paymentResult.encodedImage}`}
                      alt="PIX QR Code"
                      style={{ maxWidth: 200 }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={paymentResult.payload ?? ''}
                    InputProps={{ readOnly: true }}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => paymentResult.payload && navigator.clipboard.writeText(paymentResult.payload)}
                    sx={{ mt: 1 }}
                  >
                    Copiar código PIX
                  </Button>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Expira em: {paymentResult.expirationDate && new Date(paymentResult.expirationDate).toLocaleDateString()}
                  </Typography>
                </Box>
              )}

              {paymentResult.billingType === 'BOLETO' && paymentResult.bankSlipUrl && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography gutterBottom>
                    Clique no botão abaixo para visualizar o boleto:
                  </Typography>
                  <Button
                    variant="contained"
                    href={paymentResult.bankSlipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 1 }}
                  >
                    Visualizar Boleto
                  </Button>
                </Box>
              )}

              {paymentResult.status === 'CONFIRMED' && paymentResult.transactionReceiptUrl && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography gutterBottom color="success.main">
                    Pagamento realizado com sucesso!
                  </Typography>
                  <Button
                    variant="outlined"
                    href={paymentResult.transactionReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 1 }}
                  >
                    Visualizar Recibo
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Grid>
      </Box>
    </Box>
  );
}
