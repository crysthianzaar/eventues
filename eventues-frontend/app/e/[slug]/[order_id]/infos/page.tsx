'use client';

import { useParams } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import PersonalInfoForm from '../../tickets/components/infos/PersonalInfoForm';
import CheckoutStepper from '@/app/components/CheckoutStepper';
import { useState, useEffect } from 'react';
import { FormField, getEventForm } from '@/app/apis/api';
import { getDefaultFormFields } from '../../tickets/components/infos/PersonalInfoForm';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://obc5v0hl83.execute-api.sa-east-1.amazonaws.com';

export default function OrderInfoPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const order_id = params?.order_id as string;

  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<FormData | undefined>(undefined);

  type FormData = Record<string, string | boolean>;

  useEffect(() => {
    const loadInitialData = async () => {
      let formFields: FormField[] = [];
      try {
        const response = await fetch(`${API_BASE_URL}/get-order/${order_id}`);
        const orderData = await response.json();
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
        } else {
          const savedData = localStorage.getItem(`order_${order_id}_form_data`);
          if (savedData) {
            setInitialData(JSON.parse(savedData) as FormData);
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        const savedData = localStorage.getItem(`order_${order_id}_form_data`);
        if (savedData) {
          setInitialData(JSON.parse(savedData));
        }
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
    localStorage.setItem(`order_${order_id}_form_data`, JSON.stringify(data));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
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
