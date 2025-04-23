'use client';

import { type FC, forwardRef, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Paper,
  useTheme,
  CircularProgress,
  Alert,
  Button,
  Fade,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';
import {
  type FormField,
  type UserProfile,
  type Order,
  getEventForm,
  getUserProfile,
  getOrder,
} from '@/app/apis/api';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IMaskInput } from 'react-imask';
import LoadingOverlay from '@/app/components/LoadingOverlay';
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://obc5v0hl83.execute-api.sa-east-1.amazonaws.com';


interface PersonalInfoFormProps {
  orderId: string;
  onFormDataChange: (data: FormData, isValid: boolean) => void;
  formIndex?: number;
  initialData?: FormData;
  localStorageKey?: string;
  activeParticipant?: number;
  activeStep?: number;
}

type FormData = Record<string, string | boolean>;

interface CustomInputProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const PhoneMaskInput = forwardRef<HTMLInputElement, CustomInputProps>(
  function PhoneMaskInput(props, ref) {
    const { onChange, name, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="(00) 00000-0000"
        definitions={{ '#': /[1-9]/ }}
        inputRef={ref}
        onAccept={(value: string) => onChange({ target: { name, value } })}
        overwrite
      />
    );
  },
);

const PersonalInfoForm: FC<PersonalInfoFormProps> = ({
  orderId,
  onFormDataChange,
  formIndex = 0,
  initialData,
  localStorageKey,
  activeParticipant,
  activeStep,
}: PersonalInfoFormProps) => {
  const theme = useTheme();
  const router = useRouter();
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForAnotherPerson, setIsForAnotherPerson] = useState(false);
  const [validationSchema, setValidationSchema] = useState<z.ZodObject<any>>(z.object({}));
  const [order, setOrder] = useState<Order | null>(null);
  const [totalParticipants, setTotalParticipants] = useState(1);
  const [participantLabels, setParticipantLabels] = useState<string[]>([]);
  const [ticketColors, setTicketColors] = useState<string[]>([]);

  useEffect(() => {
    if (formFields.length > 0) {
      console.log('Updating validation schema for', totalParticipants, 'participants');
      const schema = createValidationSchema(formFields, totalParticipants);
      setValidationSchema(schema);
    }
  }, [formFields, totalParticipants]);
  const {
    register,
    formState: { errors },
    reset,
    getValues,
    handleSubmit,
    trigger,
    setValue
  } = useForm<FormData>({    
    resolver: zodResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: initialData
  });

  const consolidateParticipantInfo = (formData: FormData): Order => {
    const updatedOrder = { ...order } as Order;
    let participantIndex = 0;

    updatedOrder.tickets = updatedOrder.tickets.map(ticket => {
      const participants = [];
      for (let i = 0; i < ticket.quantity; i++) {
        const participant: Record<string, any> = {};
        formFields.forEach(field => {
          const fieldName = `participant${participantIndex}_${field.id}`;
          participant[field.id] = formData[fieldName];
        });
        participants.push(participant);
        participantIndex++;
      }
      return { ...ticket, participants };
    });

    return updatedOrder;
  };

  const handleContinue = useCallback(async () => {
    try {
      setIsSubmitting(true);
      console.log('Starting validation for all participants');
      const formData = getValues();
      console.log('Current form values:', formData);

      const requiredFields = formFields.filter(field => field.required);
      console.log('Required fields:', requiredFields.map(f => f.label));
      
      const allFields: string[] = [];
      const validationResults: Record<string, boolean> = {};
      let hasErrors = false;

      for (let i = 0; i < totalParticipants; i++) {
        console.log(`\nValidating Participant ${i + 1}:`);
        for (const field of formFields) {
          if (field.required) {
            const fieldName = `participant${i}_${field.id}`;
            allFields.push(fieldName);

            const value = formData[fieldName];
            const fieldError = errors[fieldName];
            console.log(`Field: ${field.label}`);
            console.log(`- Value: ${value === undefined ? 'undefined' : value}`);
            console.log(`- Required: ${field.required}`);
            console.log(`- Has Error: ${fieldError ? 'Yes' : 'No'}`);
            
            if (!value || fieldError) {
              hasErrors = true;
              console.log(`- Error Message: ${fieldError?.message || 'Campo obrigatório não preenchido'}`);
            }
          }
        }
      }

      const isValid = await trigger(allFields);
      console.log('\nValidation Summary:');
      console.log('Overall validation result:', isValid ? 'PASSED' : 'FAILED');

      if (!isValid || hasErrors) {
        console.log('\nValidation Errors:');
        Object.keys(errors).forEach(fieldName => {
          const [participantStr, fieldId] = fieldName.split('_');
          const participantIndex = parseInt(participantStr.replace('participant', ''));
          const field = formFields.find(f => f.id === fieldId);
          console.log(`- Participant ${participantIndex + 1}, ${field?.label}: ${errors[fieldName]?.message}`);
        });
        setIsSubmitting(false);
        return;
      }

      console.log('\nAll validations passed, proceeding to payment');
      if (order?.event_id) {
        const pathSegments = window.location.pathname.split('/');
        const eventSlug = pathSegments[2];

        const updatedOrder = consolidateParticipantInfo(formData);

        try {
          const response = await fetch(`${API_BASE_URL}/orders/${orderId}/participants`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedOrder),
          });

          if (!response.ok) {
            throw new Error('Failed to update order with participant information');
          }
          router.push(`/e/${eventSlug}/${orderId}/payment`);
        } catch (error) {
          console.error('Error updating order:', error);
          setError('Ocorreu um erro ao salvar as informações dos participantes. Por favor, tente novamente.');
          setIsSubmitting(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error during validation:', err);
      setError('Ocorreu um erro ao validar os campos. Por favor, tente novamente.');
      setIsSubmitting(false);
    }
  }, [trigger, order?.event_id, router, formFields, totalParticipants, getValues, errors, setError]);

  const createValidationSchema = (fields: FormField[], participantCount: number) => {
    const schemaMap: Record<string, z.ZodTypeAny> = {};

    for (let i = 0; i < participantCount; i++) {
      fields.forEach((field) => {
        const fieldName = `participant${i}_${field.id}`;
        console.log(`Creating validation for field: ${fieldName} (Participant ${i + 1})`);

        if (field.required) {
          switch (field.type) {
            case 'email':
              schemaMap[fieldName] = z.string()
                .min(1, `Email é obrigatório para Participante ${i + 1}`)
                .email(`Email inválido para Participante ${i + 1}`);
              break;
            case 'text':
              if (field.id === 'cpf') {
                schemaMap[fieldName] = z.string()
                  .min(1, `CPF é obrigatório para Participante ${i + 1}`)
                  .transform(val => val.replace(/[^0-9]/g, ''))
                  .refine(val => val.length === 11, `CPF inválido para Participante ${i + 1}`);
              } else {
                schemaMap[fieldName] = z.string()
                  .min(1, `${field.label} é obrigatório para Participante ${i + 1}`);
              }
              break;
            case 'date':
              schemaMap[fieldName] = z.string()
                .min(1, `Data é obrigatória para Participante ${i + 1}`);
              break;
            case 'phone':
              schemaMap[fieldName] = z.string()
                .min(1, `${field.label} é obrigatório para Participante ${i + 1}`)
                .regex(/^\(\d{2}\) \d{5}-\d{4}$/, `Telefone inválido para Participante ${i + 1}`);
              break;
            case 'select':
              schemaMap[fieldName] = z.string()
                .min(1, `${field.label} é obrigatório para Participante ${i + 1}`);
              break;
            case 'checkbox':
              schemaMap[fieldName] = z.boolean()
                .refine((val) => val === true, {
                  message: `Você precisa aceitar os termos para Participante ${i + 1}`,
                });
              break;
            default:
              schemaMap[fieldName] = z.string()
                .min(1, `${field.label} é obrigatório para Participante ${i + 1}`);
          }
        } else {
          switch (field.type) {
            case 'email':
              schemaMap[fieldName] = z.string().email(`Email inválido para Participante ${i + 1}`).optional();
              break;
            case 'phone':
              schemaMap[fieldName] = z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, `Telefone inválido para Participante ${i + 1}`).optional();
              break;
            case 'checkbox':
              schemaMap[fieldName] = z.boolean().optional();
              break;
            default:
              schemaMap[fieldName] = z.string().optional();
          }
        }
      });
    }

    console.log('Final validation schema:', Object.keys(schemaMap));
    return z.object(schemaMap);
  };

  const handleSaveAndNext = async () => {
    const formData = getValues();
    const isValid = Object.keys(errors).length === 0;

    if (!isValid) return;

    if (localStorageKey) {
      localStorage.setItem(`${localStorageKey}_${formIndex}`, JSON.stringify({
        values: formData,
        isValid: true,
        timestamp: new Date().toISOString()
      }));
    }

    onFormDataChange(formData, true);
  };

  useEffect(() => {
    if (localStorageKey) {
      try {
        const savedData = localStorage.getItem(`${localStorageKey}_${formIndex}`);
        if (savedData) {
          const { values } = JSON.parse(savedData);
          reset(values);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  }, [localStorageKey, formIndex, reset]);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0 && !loading) {
      Object.entries(initialData).forEach(([key, value]) => {
        const fieldId = key.split('_')[1];
        const field = formFields.find(f => f.id === fieldId);
        if (field && (field.type === 'select' || field.type === 'checkbox')) {
          console.log(`Re-setting ${field.type} field ${key} to:`, value);
          setValue(key, value, { shouldValidate: false });
        }
      });
    }
  }, [initialData, formFields, loading, setValue]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!orderId) {
        console.error('Order ID is empty or undefined');
        setError('ID do pedido não fornecido. Não é possível carregar o formulário.');
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const orderData = await getOrder(orderId);
        setOrder(orderData);

        const totalTickets = orderData.tickets.reduce((sum: number, ticket: { quantity: number }) => sum + ticket.quantity, 0);
        setTotalParticipants(totalTickets);

        const labels: string[] = [];
        const colors: string[] = [];
        orderData.tickets.forEach((ticket: { ticket_name: string; quantity: number; ticket_color?: string }) => {
          for (let i = 0; i < ticket.quantity; i++) {
            labels.push(`${ticket.ticket_name} - Participante ${labels.length + 1}`);
            colors.push(ticket.ticket_color || theme.palette.primary.main);
          }
        });
        setParticipantLabels(labels);
        setTicketColors(colors);

        let fields: FormField[] = formFields;
        if (!fields || fields.length === 0) {
          try {
            fields = await getEventForm(orderData.event_id);
          } catch (error) {
            console.error('Error fetching form fields:', error);
            fields = getDefaultFormFields();
            console.warn('Using default form fields due to API error');
          }
        }

        if (!fields || !Array.isArray(fields) || fields.length === 0) {
          console.warn('Using default form fields');
          fields = getDefaultFormFields();
        }

        let profile = userProfile;
        if (!profile && !isForAnotherPerson) {
          try {
            profile = await getUserProfile();
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        }

        if (!isMounted) return;

        const sortedFields = [...fields].sort((a, b) => a.order - b.order);

        setFormFields(sortedFields);
        setUserProfile(profile);

        const schema = createValidationSchema(sortedFields, totalParticipants);
        setValidationSchema(schema);

        if (initialData && Object.keys(initialData).length > 0) {
          console.log('Setting form values with initialData:', initialData);
          Object.entries(initialData).forEach(([key, value]) => {
            console.log(`Setting field ${key} to value:`, value);
            setValue(key, value, { shouldValidate: false, shouldDirty: true, shouldTouch: true });
          });
          setTimeout(() => {
            const formValues = getValues();
            console.log('Current form values after setting:', formValues);
          }, 100);
        } else if (profile && !isForAnotherPerson) {
          const profileData = mapProfileToFormData(profile, sortedFields);
          reset(profileData);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Ocorreu um erro ao carregar os dados do formulário. Por favor, tente novamente.');
        console.error('Error in fetchData:', error);
        setError('Ocorreu um erro ao carregar os dados do formulário. Por favor, tente novamente.');

        const defaultFields = getDefaultFormFields();
        setFormFields(defaultFields);
        setValidationSchema(createValidationSchema(defaultFields, totalParticipants));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [orderId, isForAnotherPerson, initialData]);

  const handleToggleForAnotherPerson = () => {
    setIsForAnotherPerson((prev) => {
      const newValue = !prev;

      if (newValue) {
        const emptyData: Record<string, any> = {};
        formFields.forEach((field) => {
          emptyData[field.id] = field.type === 'checkbox' ? false : '';
        });
        reset(emptyData);
      } else if (userProfile) {
        const profileData = mapProfileToFormData(userProfile, formFields);
        reset(profileData);
      }

      return newValue;
    });
  };

  const mapProfileToFormData = (profile: UserProfile, fields: FormField[]): Record<string, any> => {
    const mappedData: Record<string, any> = {};

    fields.forEach((field) => {
      let value = '';

      switch (field.id) {
        case 'fullName':
          value = profile.fullName || '';
          break;
        case 'email':
          value = profile.email || '';
          break;
        case 'city':
          value = profile.city || '';
          break;
        case 'state':
          value = profile.state || '';
          break;
        case 'address':
          value = profile.address || '';
          break;
        default:
          if (field.id === 'cpf' || field.label === 'CPF') {
            value = profile.cpf || '';
          } else {
            value = profile[field.id as keyof UserProfile] as string || '';
          }
      }

      mappedData[field.id] = field.type === 'checkbox' ? false : value;
    });

    return mappedData;
  };

  const renderField = (field: FormField, participantIndex: number) => {
    const fieldName = `participant${participantIndex}_${field.id}`;
    const error = errors[fieldName];

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <TextField
            {...register(fieldName)}
            label={field.label}
            type={field.type}
            required={field.required}
            fullWidth
            error={!!error}
            helperText={error?.message as string}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
                '& .MuiOutlinedInput-input': {
                  bgcolor: 'background.paper',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: theme.palette.primary.main,
              },
            }}
          />
        );
      case 'date':
        return (
          <TextField
            {...register(fieldName)}
            label={field.label}
            type="date"
            required={field.required}
            fullWidth
            error={!!error}
            helperText={error?.message as string}
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        );
      case 'select':
        return (
          <FormControl fullWidth required={field.required} error={!!error}>
            <InputLabel id={`${fieldName}-label`} size="small">{field.label}</InputLabel>
            <Select
              {...register(fieldName)}
              labelId={`${fieldName}-label`}
              id={`${fieldName}-select`}
              label={field.label}
              required={field.required}
              displayEmpty
              fullWidth
              size="small"
              defaultValue={getValues(fieldName) || ""}
              sx={{
                '& .MuiSelect-select': {
                  bgcolor: 'background.paper',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
              }}
            >
              <MenuItem value="" disabled>
                <em>Selecione uma opção</em>
              </MenuItem>
              {field.options?.map((option) => (
                <MenuItem 
                  key={option} 
                  value={option}
                  sx={{
                    '&.Mui-selected': {
                      bgcolor: `${alpha(theme.palette.primary.main, 0.1)} !important`,
                    },
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  {option}
                </MenuItem>
              ))}
            </Select>
            {error && (
              <FormHelperText>{error.message as string}</FormHelperText>
            )}
          </FormControl>
        );
      case 'checkbox':
        return (
          <FormControl required={field.required}>
            <FormControlLabel
              control={
                <Checkbox
                  {...register(fieldName)}
                  required={field.required}
                  defaultChecked={Boolean(getValues(fieldName))}
                />
              }
              label={field.label}
            />
            {error && (
              <FormHelperText error>{error.message as string}</FormHelperText>
            )}
          </FormControl>
        );
      case 'phone':
        return (
          <TextField
            {...register(fieldName)}
            label={field.label}
            required={field.required}
            fullWidth
            error={!!error}
            helperText={error?.message as string}
            size="small"
            InputProps={{
              inputComponent: PhoneMaskInput as any,
            }}
          />
        );
      default:
        return (
          <TextField
            {...register(fieldName)}
            label={field.label}
            required={field.required}
            fullWidth
            error={!!error}
            helperText={error?.message as string}
            size="small"
          />
        );
    }
  };



  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }


  return (
    <Box sx={{ position: 'relative' }}>
      {isSubmitting && <LoadingOverlay />}
      <Paper 
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 0, sm: 3 },
          border: { xs: 0, sm: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` },
          mb: { xs: 8, sm: 10 },
          background: `linear-gradient(to bottom right, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
          backdropFilter: 'blur(10px)',
          boxShadow: { xs: 'none', sm: `0 4px 24px ${alpha(theme.palette.primary.main, 0.1)}` },
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            mb: 3
          }}
        >
          Informações dos Participantes
        </Typography>

      <Box mb={3}>
        {!isForAnotherPerson && userProfile && (
          <Typography variant="body2" color="text.secondary">
            Os campos estão preenchidos com suas informações
          </Typography>
        )}
      </Box>

      <form onSubmit={handleSubmit(handleSaveAndNext)}>
        {Array.from({ length: totalParticipants }).map((_, participantIndex) => (
          <Box
            key={participantIndex}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: { xs: 1, sm: 2 },
              border: 1,
              borderColor: alpha(ticketColors[participantIndex] || theme.palette.primary.main, 0.2),
              backgroundColor: alpha(ticketColors[participantIndex] || theme.palette.primary.main, 0.02),
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: alpha(ticketColors[participantIndex] || theme.palette.primary.main, 0.05),
                transform: { xs: 'none', sm: 'translateY(-2px)' },
                boxShadow: { xs: 'none', sm: theme.shadows[2] },
              },
              position: 'relative',
              mb: { xs: 3, sm: 4 },
              boxShadow: { 
                xs: 'none',
                sm: `0 0 0 1px ${alpha(ticketColors[participantIndex] || theme.palette.primary.main, 0.05)}`,
              },
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                color: ticketColors[participantIndex] || 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 600,
                mb: { xs: 1.5, sm: 2 },
                pb: { xs: 1.5, sm: 2 },
                borderBottom: 1,
                borderColor: alpha(ticketColors[participantIndex] || theme.palette.primary.main, 0.1),
                '& .MuiSvgIcon-root': {
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }
              }}
            >
              <ConfirmationNumberIcon />
              {participantLabels ? participantLabels[participantIndex] : `Participante ${participantIndex + 1}`}
            </Typography>

            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {formFields.map((field) => (
                <Grid
                  item
                  xs={12}
                  sm={field.type === 'checkbox' ? 12 : 6}
                  key={`${participantIndex}-${field.id}`}
                >
                  {renderField(field, participantIndex)}
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}


      </form>
      </Paper>

      <Fade in={true}>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            py: { xs: 1.5, sm: 2 },
            zIndex: theme.zIndex.appBar,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 -4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
            '@supports (-webkit-touch-callout: none)': {
              paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
            }
          }}
        >
          <Box
            sx={{
              maxWidth: 'lg',
              mx: 'auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              px: { xs: 2, sm: 3, md: 4 }
            }}
          >
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Preencha todos os campos obrigatórios para continuar
            </Typography>
            <Button
              variant="contained"
              onClick={handleContinue}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: theme.palette.success.main,
                color: '#fff',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.4)}`,
                '&:hover': {
                  bgcolor: theme.palette.success.dark,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.5)}`,
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                minWidth: { xs: '100%', sm: 'auto' },
              }}
            >
              Ir para Pagamento
            </Button>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
};

export default PersonalInfoForm;

export function getDefaultFormFields(): FormField[] {
  return [
    {
      id: "fullName",
      label: "Nome Completo",
      type: "text",
      required: true,
      options: [],
      order: 1
    },
    {
      id: "birthDate",
      label: "Data de Nascimento",
      type: "date",
      required: true,
      options: [],
      order: 2
    },
    {
      id: "gender",
      label: "Gênero",
      type: "select",
      required: true,
      options: ["Masculino", "Feminino", "Não Binário", "Prefiro não informar"],
      order: 3
    },
    {
      id: "cpf",
      label: "CPF",
      type: "text",
      required: true,
      options: [],
      order: 4
    },
    {
      id: "email",
      label: "Email",
      type: "text",
      required: true,
      options: [],
      order: 5
    },
    {
      id: "phone",
      label: "Telefone",
      type: "phone",
      required: true,
      options: [],
      order: 6
    },
    {
      id: "emergencyContact",
      label: "Contato de Emergência",
      type: "phone",
      required: true,
      options: [],
      order: 7
    },
    {
      id: "termsAccepted",
      label: "Aceito os Termos e Condições",
      type: "checkbox",
      required: true,
      options: [],
      order: 8
    }
  ];
}
