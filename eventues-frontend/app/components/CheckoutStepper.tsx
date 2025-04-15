'use client';

import { Step, StepLabel, Stepper, styled, Box, IconButton, Tooltip } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import { useRouter } from 'next/navigation';

const steps = [
  { label: 'Ingressos', path: 'tickets' },
  { label: 'Informações', path: 'infos' },
  { label: 'Pagamento', path: 'payment' }
];

const StyledStepper = styled(Stepper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: '#fff',
  borderBottom: '1px solid #eee',
  marginBottom: theme.spacing(3),
  '& .MuiStepLabel-root': {
    transition: 'transform 0.2s ease',
  },
  '& .Mui-active, & .Mui-completed': {
    '&:hover': {
      '& .MuiStepLabel-root': {
        transform: 'translateY(-2px)',
      },
      '& .MuiStepLabel-label': {
        color: theme.palette.primary.dark,
      }
    }
  }
}));

interface CheckoutStepperProps {
  activeStep: number;
  orderId?: string;
  eventSlug: string;
}

export default function CheckoutStepper({ activeStep, orderId, eventSlug }: CheckoutStepperProps) {
  const router = useRouter();

  const handleStepClick = (index: number, path: string) => {
    if (index <= activeStep) {
      // If we're on the first step or going back to it, don't include orderId
      if (path === 'tickets' || !orderId) {
        router.push(`/e/${eventSlug}/${orderId}/tickets`);
      } else {
        router.push(`/e/${eventSlug}/${orderId}/${path}`);
      }
    }
  };

  const canNavigateToPrevious = activeStep > 0;
  const canNavigateToNext = false; // Sempre false pois próximo step requer ação do usuário

  const handleNavigate = (direction: 'prev' | 'next') => {
    const targetIndex = direction === 'prev' ? activeStep - 1 : activeStep + 1;
    const targetStep = steps[targetIndex];
    handleStepClick(targetIndex, targetStep.path);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {canNavigateToPrevious && (
        <Box sx={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          ml: 1
        }}>
          <Tooltip title="Voltar" placement="left">
            <IconButton
              onClick={() => handleNavigate('prev')}
              sx={{
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <NavigateBeforeIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {canNavigateToNext && (
        <Box sx={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          mr: 1
        }}>
          <Tooltip title="Avançar" placement="right">
            <IconButton
              onClick={() => handleNavigate('next')}
              sx={{
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <NavigateNextIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <StyledStepper activeStep={activeStep} alternativeLabel>
      {steps.map((step, index) => (
        <Step 
          key={step.label}
          onClick={() => handleStepClick(index, step.path)}
          sx={{
            cursor: index <= activeStep ? 'pointer' : 'not-allowed',
            '& .MuiStepLabel-label': {
              color: index <= activeStep ? 'primary.main' : 'text.disabled',
              fontWeight: index === activeStep ? 600 : 400
            },
            '& .MuiStepIcon-root': {
              transition: 'all 0.2s ease',
              ...(index <= activeStep && {
                '&:hover': {
                  transform: 'scale(1.1)',
                  filter: 'brightness(0.9)'
                }
              })
            },
            '&:hover': index <= activeStep ? {
              '& .MuiStepLabel-label': {
                color: 'primary.dark'
              }
            } : {}
          }}
        >
          <StepLabel>{step.label}</StepLabel>
        </Step>
      ))}
    </StyledStepper>
    </Box>
  );
}
