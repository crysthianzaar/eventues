'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { checkPaymentStatus } from '../../../api/paymentApi';
import { PaymentResult } from '../types';

export function usePaymentStatus(paymentResult: PaymentResult | null, user: User | null, orderId?: string) {
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const checkStatus = async () => {
      if (!user || !paymentResult?.id || !mounted) {
        return;
      }
      
      if (paymentResult.billingType !== 'PIX' || 
          paymentResult.status === 'CONFIRMED' || 
          paymentResult.status === 'RECEIVED') {
        return;
      }

      try {
        setCheckingPayment(true);
        const status = await checkPaymentStatus(paymentResult.id, user);
        if (!mounted) return;
        
        if (status.status === 'CONFIRMED' || status.status === 'RECEIVED') {
          setShowSuccessModal(true);
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          setTimeout(() => {
            if (mounted) {
              if (orderId) {
                window.location.href = `/i/${orderId}`;
              }
            }
          }, 2000);
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      } finally {
        if (mounted) {
          setCheckingPayment(false);
        }
      }
    };

    if (paymentResult?.id && 
        paymentResult.billingType === 'PIX' && 
        paymentResult.status !== 'CONFIRMED' && 
        paymentResult.status !== 'RECEIVED') {
      checkStatus();
      intervalId = setInterval(checkStatus, 15000);
    }

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [paymentResult?.id, paymentResult?.status, paymentResult?.billingType, user]);

  useEffect(() => {
    if (
      (paymentResult?.status === 'CONFIRMED' && paymentResult?.transactionReceiptUrl) ||
      (paymentResult?.status === 'CONFIRMED' && paymentResult?.billingType === 'PIX')
    ) {
      setShowSuccessOverlay(true);
      const timer = setTimeout(() => {
        if (orderId) {
          window.location.href = `/i/${orderId}`;
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentResult]);

  return {
    checkingPayment,
    showSuccessModal,
    showSuccessOverlay,
    setShowSuccessModal,
    setShowSuccessOverlay
  };
}
