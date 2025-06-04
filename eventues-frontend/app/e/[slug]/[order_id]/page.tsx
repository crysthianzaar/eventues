'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getOrder } from '@/app/apis/api';

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const orderId = params?.order_id as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOrderStatus = async () => {
      if (!orderId || !slug) {
        router.push(`/e/${slug}`);
        return;
      }

      try {
        const orderData = await getOrder(orderId);
        
        // Redirect based on order status
        if (!orderData.participants || orderData.participants.length === 0) {
          // If no participant info, redirect to info page
          router.push(`/e/${slug}/${orderId}/infos`);
        } else if (orderData.status === 'PAID') {
          // If already paid, redirect to confirmation
          router.push(`/i/${orderId}`);
        } else {
          // Otherwise redirect to payment
          router.push(`/i/${orderId}`);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        // If error, default to info page
        router.push(`/e/${slug}/${orderId}/infos`);
      } finally {
        setLoading(false);
      }
    };

    checkOrderStatus();
  }, [orderId, slug, router]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return null;
}