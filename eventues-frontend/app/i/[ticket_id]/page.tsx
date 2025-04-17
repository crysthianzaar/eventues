'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Divider,
  Paper,
  styled,
  Theme
} from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebase';
import { getIdToken } from 'firebase/auth';
import axios from 'axios';

// Importando componentes modulares
import DigitalTicket from './components/DigitalTicket';
import PaymentDetails from './components/PaymentDetails';
import ActionButtons from './components/ActionButtons';
import OrderInfo from './components/OrderInfo';

// Componentes estilizados para a página
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(145deg, #f5f5f5 0%, #e8e8e8 100%)',
  padding: theme.spacing(3),
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  maxWidth: 900,
  marginBottom: theme.spacing(4),
}));

const PaymentSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  marginTop: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  background: '#fff',
}));

// Estilos de tipografia padronizados
const TypographyStyles = {
  h4: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '1.75rem',
    lineHeight: 1.2,
  },
  h5: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '1.5rem',
    lineHeight: 1.2,
  },
  h6: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 500,
    fontSize: '1.25rem',
    lineHeight: 1.2,
  },
  body1: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '0.875rem',
    lineHeight: 1.43,
  },
  caption: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontWeight: 400,
    fontSize: '0.75rem',
    lineHeight: 1.66,
  },
};

// Importando tipos
import { TicketDetails, ApiResponse } from './types';

export default function TicketPage() {
  const [user] = useAuthState(auth);
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticketDetails, setTicketDetails] = useState<TicketDetails | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const handlePrint = () => window.print();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ticketDetails?.event_name,
          text: `Minha inscrição para ${ticketDetails?.event_name}`,
          url: window.location.href,
        });
      } catch (error) {
        // Ignore share errors
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    const fetchTicketDetails = async () => {
      setLoading(true);
      setUnauthorized(false);
      setError(null);

      if (!user) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      try {
        const token = await getIdToken(user);
        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/tickets/${params.ticket_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (String(response.data.user_id).trim() !== String(user.uid).trim()) {
          setUnauthorized(true);
          setTicketDetails(null);
        } else {
          setTicketDetails(response.data);
        }
      } catch (err) {
        setError('Falha ao carregar detalhes do ingresso');
      } finally {
        setLoading(false);
      }
    };

    fetchTicketDetails();
  }, [user, params.ticket_id]);

  // Mostrar loading enquanto carrega ou enquanto user não está definido
  if (loading || !user) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 2,
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
        }}
      >
        <CircularProgress />
        <Typography color="text.secondary" sx={TypographyStyles.body1}>
          Carregando detalhes do ingresso...
        </Typography>
      </Box>
    );
  }

  if (unauthorized) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          gap: 2,
        }}
      >
        <Typography variant="h5" color="error" gutterBottom sx={TypographyStyles.h5}>
          Página Indisponível
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ ...TypographyStyles.body1, maxWidth: 400, mb: 2 }}>
          Você não tem permissão para visualizar este ingresso. Apenas o comprador pode acessar estas informações.
        </Typography>
        <ActionButtons 
          router={router}
          handlePrint={handlePrint}
          handleShare={handleShare}
          showShareButton={false}
        />
      </Box>
    );
  }

  if (error || !ticketDetails) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography color="error" sx={TypographyStyles.body1}>{error || 'Ingresso não encontrado'}</Typography>
      </Box>
    );
  }

  const hasShareSupport = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  
  return (
    <PageContainer>
      <ContentContainer maxWidth="md" id="print-container">
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <ActionButtons 
            router={router}
            handlePrint={handlePrint}
            handleShare={handleShare}
            showShareButton={hasShareSupport}
          />
        </Box>
        
        {/* Ticket digital com design de bilhete físico */}
        <Box className="digital-ticket-container">
          <DigitalTicket 
            ticketDetails={ticketDetails} 
            formatDate={formatDate} 
          />
        </Box>
        
        {/* Seção de informações do pedido */}
        <PaymentSection className="order-info-section">
          <OrderInfo 
            ticketDetails={ticketDetails} 
            formatDate={formatDate} 
          />
        </PaymentSection>
      </ContentContainer>
      <style jsx global>{`
        @media print {
          /* Reset da página */
          @page {
            size: auto;
            margin: 0;
          }
          
          /* Esconder elementos da página que não fazem parte do ingresso */
          body * {
            visibility: hidden;
          }
          
          /* Mostrar apenas o DigitalTicket */
          .digital-ticket-container {
            visibility: visible !important;
            position: absolute;
            left: 50%;
            top: 10px;
            transform: translateX(-50%);
            width: 100%;
            max-width: 600px;
            box-shadow: none !important;
            padding: 0;
            margin: 0;
          }
          
          /* Garantir que todo o conteúdo do ingresso seja visível */
          .digital-ticket-container * {
            visibility: visible !important;
            overflow: visible !important;
          }
          
          /* Manter cores e estilos originais */
          .digital-ticket-container .MuiPaper-root {
            box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            background-color: #fff !important;
            color: #000 !important;
          }
          
          /* Preservar o cabeçalho colorido */
          .digital-ticket-container [class*="TicketHeader"] {
            background-color: #1976d2 !important;
            color: white !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          /* Preservar o chip de status */
          .digital-ticket-container .MuiChip-root {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          
          /* Garantir que o QR code seja impresso corretamente */
          .digital-ticket-container svg {
            max-height: 150px !important;
          }
          
          /* Esconder botões de ação */
          .MuiButton-root, .no-print {
            display: none !important;
          }
          
          /* Esconder a seção de informações do pedido separada */
          .order-info-section {
            display: none !important;
          }
        }
        
        body {
          font-family: "Roboto", "Helvetica", "Arial", sans-serif;
        }
      `}</style>
    </PageContainer>
  );
}