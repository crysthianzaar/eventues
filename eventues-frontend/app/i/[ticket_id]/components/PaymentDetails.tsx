'use client';

import { Box, Typography, Button, Grid, Paper } from '@mui/material';

interface PaymentDetailsProps {
  paymentDetails: any;
}

const PaymentDetails = ({ paymentDetails }: PaymentDetailsProps) => {
  if (!paymentDetails) return null;

  const handleCopyPix = () => {
    if (paymentDetails.pixQrCode?.payload) {
      navigator.clipboard.writeText(paymentDetails.pixQrCode.payload);
    }
  };

  const handleOpenBoleto = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Grid container spacing={2}>
      {paymentDetails.billingType === 'PIX' && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                Pagamento via PIX
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {paymentDetails.description}
              </Typography>

              <Box sx={{ my: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(paymentDetails.value)}
                </Typography>
                
                {paymentDetails.pixQrCode?.expirationDate && (
                  <Typography variant="caption" color="error">
                    Expira em: {new Date(paymentDetails.pixQrCode.expirationDate).toLocaleString('pt-BR')}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {paymentDetails.pixQrCode?.encodedImage && (
                  <img
                    src={`data:image/png;base64,${paymentDetails.pixQrCode.encodedImage}`}
                    alt="PIX QR Code"
                    style={{ maxWidth: 200, marginBottom: 16 }}
                  />
                )}
                <Button
                  variant="contained"
                  onClick={handleCopyPix}
                  sx={{ mb: 1, width: '100%', maxWidth: 400 }}
                >
                  Copiar código PIX
                </Button>
                {paymentDetails.invoiceUrl && (
                  <Button
                    variant="outlined"
                    href={paymentDetails.invoiceUrl}
                    target="_blank"
                    sx={{ width: '100%', maxWidth: 400 }}
                  >
                    Ver comprovante
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      )}

      {paymentDetails.billingType === 'BOLETO' && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                Boleto Bancário
              </Typography>
              
              <Box sx={{ my: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(paymentDetails.value)}
                </Typography>
              </Box>
              
              {paymentDetails.bankSlipUrl && (
                <Button
                  variant="contained"
                  href={paymentDetails.bankSlipUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    width: '100%', 
                    py: 1.5, 
                    mb: 3
                  }}
                  onClick={() => handleOpenBoleto(paymentDetails.bankSlipUrl)}
                >
                  Visualizar Boleto
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      )}

      {paymentDetails.billingType === 'CREDIT_CARD' && (
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                Pagamento via Cartão de Crédito
              </Typography>
              
              {paymentDetails.status === 'CONFIRMED' &&
                paymentDetails.transactionReceiptUrl && (
                  <Button
                    variant="outlined"
                    href={paymentDetails.transactionReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ mt: 1 }}
                  >
                    Visualizar Recibo
                  </Button>
                )}
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};

export default PaymentDetails;
