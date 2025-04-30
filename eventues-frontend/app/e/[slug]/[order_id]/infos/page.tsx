'use client';

import { useParams, useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography, Alert, Button, Container } from '@mui/material';
import PersonalInfoForm from '../../tickets/components/infos/PersonalInfoForm';
import CheckoutStepper from '@/app/components/CheckoutStepper';
import { useState, useEffect } from 'react';
import { FormField, getEventForm } from '@/app/apis/api';
import { getDefaultFormFields } from '../../tickets/components/infos/PersonalInfoForm';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://obc5v0hl83.execute-api.sa-east-1.amazonaws.com';

// Status que não permitem edição (estados finais ou intermediários após geração do pagamento)
const FINAL_STATUSES = [
  'CONFIRMADO', 'CONFIRMADO', 'RECEIVED', 
  'CANCELADO', 'OVERDUE', 'REFUNDED', 'PARTIALLY_REFUNDED',
  'CHARGEBACK_REQUESTED', 'CHARGEBACK_DISPUTE', 'DELETED', 'RESTORED', 'CANCELADO', 'RECEIVED_IN_CASH_UNDONE'
];

export default function OrderInfoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const order_id = params?.order_id as string;

  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<FormData | undefined>(undefined);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [orderPaid, setOrderPaid] = useState(false);
  const [orderInfo, setOrderInfo] = useState<any>(null);

  type FormData = Record<string, string | boolean>;

  useEffect(() => {
    const loadInitialData = async () => {
      let formFields: FormField[] = [];
      try {
        const response = await fetch(`${API_BASE_URL}/get-order/${order_id}`);
        const orderData = await response.json();
        
        // Verificar se o pedido está em um status final
        const currentStatus = orderData.status || '';
        setOrderStatus(currentStatus);
        setOrderInfo(orderData);
        
        // Se o pedido já tiver sido pago ou cancelado, definir orderPaid como true
        if (FINAL_STATUSES.includes(currentStatus)) {
          setOrderPaid(true);
          setLoading(false);
          return; // Não carrega mais informações, já que não poderá ser editado
        }
        
        formFields = await getEventForm(orderData.event_id);
      } catch (error) {
        console.error('Error loading form fields:', error);
        formFields = getDefaultFormFields();
      }

      try {
        const response = await fetch(`${API_BASE_URL}/get-order/${order_id}`);
        const orderData = await response.json();
        console.log('API response data:', JSON.stringify(orderData, null, 2));

        if (orderData.tickets?.some((ticket: any) => ticket.participants?.length > 0)) {
          const participantData: FormData = {};
          let participantIndex = 0;

          orderData.tickets.forEach((ticket: any) => {
            ticket.participants?.forEach((participant: any) => {
              console.log('Processing participant:', participant);
              Object.entries(participant).forEach(([key, value]) => {
                const field = formFields.find(f => f.id === key);
                if (!field) {
                  console.log(`Field not found for key: ${key}, value: ${value}`);
                  return;
                }

                let convertedValue: string | boolean;
                const fieldName = `participant${participantIndex}_${key}`;
                
                switch (field.type) {
                  case 'checkbox':
                    convertedValue = value === true || value === 'true' || value === 1;
                    console.log(`Setting checkbox ${fieldName} to ${convertedValue}`);
                    break;
                  case 'select':
                    convertedValue = value !== null && value !== undefined ? String(value) : '';
                    console.log(`Setting select ${fieldName} to ${convertedValue}`);
                    break;
                  case 'date':
                    const date = value ? new Date(String(value)) : null;
                    convertedValue = date ? date.toISOString().split('T')[0] : '';
                    break;
                  default:
                    convertedValue = String(value || '');
                }
                participantData[fieldName] = convertedValue;
              });
              participantIndex++;
            });
          });
          
          console.log('Final participant data:', participantData);

          setInitialData(participantData);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [order_id]);

  const handleFormDataChange = (data: FormData, isValid: boolean) => {
    setFormData(data);
    if (!isValid) {
      console.log('Form validation failed');
      return;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Se o pedido estiver em um status final, mostrar mensagem explicativa
  if (orderPaid) {
    const isPaid = orderStatus === 'CONFIRMADO' || orderStatus === 'CONFIRMED' || orderStatus === 'RECEIVED' || orderStatus === 'ANTICIPATED';
    const statusMessage = isPaid 
      ? 'Este pedido já foi confirmado e não pode ser editado.' 
      : 'Este pedido foi cancelado ou expirado e não pode ser editado.';
    
    return (
      <Container maxWidth="lg">
        <CheckoutStepper 
          activeStep={1}
          orderId={order_id}
          eventSlug={slug}
        />
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 8,
          textAlign: 'center'
        }}>
          <Alert 
            severity={isPaid ? "success" : "warning"} 
            sx={{ mb: 4, width: '100%', maxWidth: 600 }}
          >
            {statusMessage}
          </Alert>
          
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            {isPaid ? 'Pedido já finalizado' : 'Pedido não disponível'}
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ maxWidth: 600, mb: 4 }}>
            {isPaid 
              ? 'Seu pedido já foi processado e confirmado. Você pode ver seus ingressos na página de detalhes do pedido.'
              : 'Este pedido não está mais disponível para edição ou pagamento.'
            }
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              component={Link} 
              href={`/i/${order_id}`}
            >
              VER INGRESSO
            </Button>
            
            <Button 
              variant="outlined" 
              component={Link} 
              href={`/e/${slug}`}
            >
              VOLTAR AO EVENTO
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      <CheckoutStepper 
        activeStep={1}
        orderId={order_id}
        eventSlug={slug}
      />
      <Box sx={{ p: 3 }}>
        <PersonalInfoForm 
          orderId={order_id}
          onFormDataChange={handleFormDataChange}
          localStorageKey={`order_${order_id}_form`}
          activeStep={1}
          initialData={initialData}
        />
      </Box>
    </Box>
  );
}
