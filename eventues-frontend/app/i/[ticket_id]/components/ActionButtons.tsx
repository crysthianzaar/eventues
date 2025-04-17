'use client';

import { Button, Stack } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import { TicketDetails } from '../types';

interface ActionButtonsProps {
  router: any; // Using any for both Next.js Pages Router and App Router
  handlePrint: () => void;
  handleShare: () => void;
  showShareButton: boolean;
  ticketDetails?: TicketDetails;
  isPending?: boolean;
}

const ActionButtons = ({ 
  router, 
  handlePrint, 
  handleShare, 
  showShareButton,
  ticketDetails,
  isPending = false
}: ActionButtonsProps) => {
  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{
          mb: 3,
          justifyContent: 'center',
          width: '100%',
          '& .MuiButton-root': {
            flex: { xs: '1', sm: '0 auto' },
            minWidth: { sm: '160px' }
          }
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          startIcon={<HomeIcon />}
          onClick={() => router.push('/minha_conta')}
          fullWidth
        >
          Minhas Inscrições
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          fullWidth
        >
          Imprimir
        </Button>
        {showShareButton && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            fullWidth
          >
            Compartilhar
          </Button>
        )}
      </Stack>

      {isPending && ticketDetails?.status === 'pending' && ticketDetails?.payment_url && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => {
              if (ticketDetails.payment_url) {
                window.location.href = ticketDetails.payment_url;
              }
            }}
          >
            Finalizar Pagamento
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => router.push('/minha_conta')}
          >
            Ver Minhas Inscrições
          </Button>
        </Stack>
      )}
    </>
  );
};

export default ActionButtons;
