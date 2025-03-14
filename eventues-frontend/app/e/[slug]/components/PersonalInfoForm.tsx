import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  Grid,
  Alert,
  CircularProgress,
  Checkbox,
  FormHelperText,
  InputAdornment,
  Paper,
  Tabs,
  Tab,
  alpha,
} from '@mui/material';
import { FormField, UserProfile, getEventForm, getUserProfile } from '@/app/apis/api';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce } from 'lodash';
import { IMaskInput } from 'react-imask';

interface PersonalInfoFormProps {
  eventId: string;
  onFormDataChange: (data: Record<string, any>, isValid: boolean) => void;
  formIndex?: number;
  initialData?: Record<string, any>;
  ticketName?: string;
  ticketColor?: string;
  onParticipantChange?: (index: number) => void;
  totalParticipants?: number;
  participantLabels?: string[];
  localStorageKey?: string;
  activeParticipant?: number;
  activeStep?: number;
}

// Componente para formatação de telefone
interface CustomPhoneProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const PhoneMaskCustom = React.forwardRef<HTMLInputElement, CustomPhoneProps>(
  function PhoneMaskCustom(props, ref) {
    const { onChange, name, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="(00) 00000-0000"
        definitions={{
          '#': /[1-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) => onChange({ target: { name, value } })}
        overwrite
      />
    );
  },
);

export default function PersonalInfoForm({
  eventId,
  onFormDataChange,
  formIndex = 0,
  initialData,
  ticketName,
  ticketColor,
  onParticipantChange,
  totalParticipants = 1,
  participantLabels,
  localStorageKey,
  activeParticipant,
  activeStep,
}: PersonalInfoFormProps) {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForAnotherPerson, setIsForAnotherPerson] = useState(false);
  const [validationSchema, setValidationSchema] = useState<z.ZodObject<any>>(z.object({}));
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Criar o schema Zod dinamicamente com base nos campos do formulário
  const createValidationSchema = (fields: FormField[]) => {
    const schemaMap: Record<string, any> = {};
    
    fields.forEach((field) => {
      let fieldSchema;
      
      switch (field.type) {
        case 'text':
          fieldSchema = z.string();
          if (field.id === 'email') {
            fieldSchema = z.string().email('Email inválido');
          }
          if (field.id === 'fullName') {
            fieldSchema = z.string().min(3, 'Nome deve ter pelo menos 3 caracteres');
          }
          break;
        case 'number':
          fieldSchema = z.string().refine((val: string) => !isNaN(Number(val)), {
            message: 'Deve ser um número válido',
          });
          break;
        case 'date':
          fieldSchema = z.string().refine((val: string) => !val || !isNaN(Date.parse(val)), {
            message: 'Data inválida',
          });
          break;
        case 'select':
          fieldSchema = z.string();
          break;
        case 'checkbox':
          fieldSchema = z.boolean();
          break;
        default:
          fieldSchema = z.string();
      }
      
      if (field.required) {
        if (field.type === 'checkbox') {
          fieldSchema = z.boolean().refine((val) => val === true, {
            message: 'Este campo é obrigatório',
          });
        } else if (field.type === 'text' || field.type === 'select') {
          fieldSchema = z.string().min(1, 'Este campo é obrigatório');
        } else if (field.type === 'date') {
          fieldSchema = z.string().min(1, 'Este campo é obrigatório');
        } else if (field.type === 'number') {
          fieldSchema = z.string().min(1, 'Este campo é obrigatório');
        }
      }
      
      schemaMap[field.id] = fieldSchema;
    });
    
    return z.object(schemaMap);
  };

  // Configuração do formulário com React Hook Form e Zod
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    getValues
  } = useForm<Record<string, any>>({
    resolver: zodResolver(validationSchema),
    mode: 'onBlur',
    defaultValues: {},
  });

  // Salvar no localStorage com debounce mais longo
  const saveToLocalStorage = useCallback(
    debounce((key: string, data: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }, 3000), // Aumentado para 3 segundos
    []
  );

  // Notificar mudanças ao componente pai com debounce
  const notifyParent = useCallback(
    debounce((data: any, isValid: boolean) => {
      onFormDataChange(data, isValid);
    }, 1000),
    [onFormDataChange]
  );

  // Handler para mudanças no formulário
  const handleFormChange = useCallback(() => {
    const formData = getValues();
    const isFormValid = Object.keys(errors).length === 0;

    // Notificar o componente pai
    notifyParent(formData, isFormValid);

    // Salvar no localStorage se necessário
    if (localStorageKey && isDirty) {
      saveToLocalStorage(localStorageKey, formData);
    }
  }, [getValues, errors, isDirty, localStorageKey, saveToLocalStorage, notifyParent]);

  // Observar mudanças no formulário
  useEffect(() => {
    const subscription = watch(() => {
      handleFormChange();
    });
    
    return () => {
      subscription.unsubscribe();
      saveToLocalStorage.cancel();
      notifyParent.cancel();
    };
  }, [watch, handleFormChange, saveToLocalStorage, notifyParent]);

  // Carregar dados do localStorage no mount
  useEffect(() => {
    if (localStorageKey) {
      try {
        const savedData = localStorage.getItem(localStorageKey);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          reset(parsedData);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    }
  }, [localStorageKey, reset]);

  // Efeito para carregar campos do formulário e perfil do usuário
  useEffect(() => {
    // Usar uma referência para controlar se o componente está montado
    let isMounted = true;
    
    console.log('PersonalInfoForm useEffect triggered', { eventId, formFields: formFields.length, loading });
    
    // Função para buscar dados
    const fetchData = async () => {
      if (!eventId) {
        console.error('Event ID is empty or undefined');
        setError('ID do evento não fornecido. Não é possível carregar o formulário.');
        setLoading(false);
        return;
      }
      
      // Definir loading state
      setLoading(true);
      
      try {
        // Buscar campos do formulário apenas se não tivermos campos ainda
        let fields: FormField[] = formFields;
        if (!fields || fields.length === 0) {
          try {
            fields = await getEventForm(eventId);
            console.log('API Response for form fields:', fields);
          } catch (error) {
            console.error('Error fetching form fields:', error);
            fields = getDefaultFormFields();
            console.warn('Using default form fields due to API error');
          }
        }
        
        // Verificar se os campos são válidos
        if (!fields || !Array.isArray(fields) || fields.length === 0) {
          console.warn('Using default form fields');
          fields = getDefaultFormFields();
        }
        
        // Buscar perfil do usuário apenas se necessário
        let profile = userProfile;
        if (!profile && !isForAnotherPerson) {
          try {
            profile = await getUserProfile();
            console.log('User profile loaded:', profile);
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        }
        
        // Verificar se o componente ainda está montado antes de atualizar o estado
        if (!isMounted) return;
        
        // Ordenar campos por ordem
        const sortedFields = [...fields].sort((a, b) => a.order - b.order);
        
        setFormFields(sortedFields);
        setUserProfile(profile);
        
        // Construir schema de validação baseado nos campos
        const schema = createValidationSchema(sortedFields);
        setValidationSchema(schema);
        
        // Preencher formulário com dados iniciais
        if (initialData && Object.keys(initialData).length > 0) {
          console.log('Using initialData to populate form:', initialData);
          reset(initialData);
        } else if (profile && !isForAnotherPerson) {
          // Preencher com dados do perfil do usuário
          const profileData = mapProfileToFormData(profile, sortedFields);
          console.log('Using user profile to populate form:', profileData);
          reset(profileData);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError('Ocorreu um erro ao carregar os dados do formulário. Por favor, tente novamente.');
        
        // Usar campos padrão em caso de erro
        const defaultFields = getDefaultFormFields();
        setFormFields(defaultFields);
        setValidationSchema(createValidationSchema(defaultFields));
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
  }, [eventId, isForAnotherPerson, initialData]);

  // Alternar inscrição para outra pessoa
  const handleToggleForAnotherPerson = () => {
    setIsForAnotherPerson((prev) => {
      const newValue = !prev;
      
      if (newValue) {
        // Limpar formulário se for para outra pessoa
        const emptyData: Record<string, any> = {};
        formFields.forEach((field) => {
          emptyData[field.id] = field.type === 'checkbox' ? false : '';
        });
        reset(emptyData);
      } else if (userProfile) {
        // Restaurar dados do perfil
        const profileData = mapProfileToFormData(userProfile, formFields);
        reset(profileData);
      }
      
      return newValue;
    });
  };

  // Criar função para mapear campos do perfil do usuário para o formulário
  const mapProfileToFormData = (profile: UserProfile, fields: FormField[]): Record<string, any> => {
    const mappedData: Record<string, any> = {};
    
    fields.forEach((field) => {
      let value = '';
      
      // Mapear IDs de campo para propriedades do perfil
      switch (field.id) {
        case 'fullName':
          value = profile.name || '';
          break;
        case 'email':
          value = profile.email || '';
          break;
        case 'phone':
          value = profile.phone || '';
          break;
        case 'birthDate':
          value = profile.birthDate || '';
          break;
        case 'gender':
          value = profile.gender || '';
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
          // Tentar encontrar uma correspondência no perfil
          value = profile[field.id as keyof UserProfile] as string || '';
      }
      
      // Definir valor inicial
      mappedData[field.id] = field.type === 'checkbox' ? false : value;
    });
    
    return mappedData;
  };

  // Renderizar campo com base no tipo
  const renderField = (field: FormField) => {
    const isRequired = field.required;
    const hasError = !!errors[field.id];
    const errorMessage = errors[field.id]?.message as string;
    
    switch (field.type) {
      case 'text':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                fullWidth
                label={field.label}
                value={value || ''}
                onChange={onChange}
                inputRef={ref}
                error={hasError}
                helperText={errorMessage}
                required={isRequired}
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                fullWidth
                label={field.label}
                type="date"
                value={value || ''}
                onChange={onChange}
                inputRef={ref}
                error={hasError}
                helperText={errorMessage}
                required={isRequired}
                InputLabelProps={{ shrink: true }}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <FormControl fullWidth error={hasError} required={isRequired}>
                <Select
                  value={value || ''}
                  onChange={onChange}
                  inputRef={ref}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>Selecione {field.label}</em>
                  </MenuItem>
                  {field.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {hasError && (
                  <FormHelperText>{errorMessage}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <FormControl error={hasError} required={isRequired}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={value || false}
                      onChange={onChange}
                      inputRef={ref}
                    />
                  }
                  label={field.label}
                />
                {hasError && (
                  <FormHelperText>{errorMessage}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        );

      case 'phone':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                fullWidth
                label={field.label}
                value={value || ''}
                onChange={onChange}
                inputRef={ref}
                error={hasError}
                helperText={errorMessage}
                required={isRequired}
                InputProps={{
                  inputComponent: PhoneMaskCustom as any,
                }}
              />
            )}
          />
        );

      default:
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: { onChange, value, ref } }) => (
              <TextField
                fullWidth
                label={field.label}
                value={value || ''}
                onChange={onChange}
                inputRef={ref}
                error={hasError}
                helperText={errorMessage}
                required={isRequired}
              />
            )}
          />
        );
    }
  };

  // Mudar participante ativo
  const handleParticipantChange = (event: React.SyntheticEvent, newValue: number) => {
    if (onParticipantChange) {
      onParticipantChange(newValue);
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
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      {totalParticipants > 1 && (
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={formIndex}
            onChange={handleParticipantChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {Array.from({ length: totalParticipants }).map((_, index) => (
              <Tab
                key={index}
                label={participantLabels ? participantLabels[index] : `Participante ${index + 1}`}
                sx={{ 
                  backgroundColor: index === formIndex ? alpha(ticketColor || '#1976d2', 0.1) : 'transparent',
                  borderRadius: '4px',
                  '&.Mui-selected': {
                    color: ticketColor || 'primary.main',
                    fontWeight: 'bold'
                  }
                }}
              />
            ))}
          </Tabs>
        </Box>
      )}

      <Typography variant="h6" gutterBottom>
        {ticketName ? `Informações Pessoais - ${ticketName}` : 'Informações Pessoais'}
      </Typography>
      
      <Box mb={3}>
        <FormControlLabel
          control={
            <Switch
              checked={isForAnotherPerson}
              onChange={handleToggleForAnotherPerson}
              color="primary"
            />
          }
          label="Inscrição para outra pessoa"
        />
        {!isForAnotherPerson && userProfile && (
          <Typography variant="body2" color="textSecondary">
            Os campos estão preenchidos com suas informações
          </Typography>
        )}
      </Box>

      <Grid container spacing={2}>
        {formFields.length > 0 ? (
          formFields.map((field) => (
            <Grid 
              item 
              xs={12} 
              sm={field.type === 'checkbox' ? 12 : 6} 
              key={field.id}
            >
              {renderField(field)}
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="warning">
              Nenhum campo de formulário encontrado. Por favor, verifique a configuração do evento.
            </Alert>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
}

// Função para retornar campos padrão
function getDefaultFormFields(): FormField[] {
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
      id: "email",
      label: "Email",
      type: "text",
      required: true,
      options: [],
      order: 4
    },
    {
      id: "phone",
      label: "Telefone",
      type: "phone",
      required: true,
      options: [],
      order: 5
    },
    {
      id: "emergencyContact",
      label: "Contato de Emergência",
      type: "phone",
      required: true,
      options: [],
      order: 6
    },
    {
      id: "termsAccepted",
      label: "Aceito os Termos e Condições",
      type: "checkbox",
      required: true,
      options: [],
      order: 7
    }
  ];
}
