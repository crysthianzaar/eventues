'use client';

import { type FC, forwardRef, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Select,
  MenuItem,
  Checkbox,
  Paper,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import {
  type FormField,
  type UserProfile,
  getEventForm,
  getUserProfile,
} from '@/app/apis/api';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IMaskInput } from 'react-imask';
import { useAuthState } from 'react-firebase-hooks/auth';

interface PersonalInfoFormProps {
  eventId: string;
  onFormDataChange: (data: FormData, isValid: boolean) => void;
  formIndex?: number;
  initialData?: FormData;
  ticketName?: string;
  ticketColor?: string;
  onParticipantChange?: (index: number) => void;
  totalParticipants?: number;
  participantLabels?: string[];
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

const CpfMaskInput = forwardRef<HTMLInputElement, CustomInputProps>(
  function CpfMaskInput(props, ref) {
    const { onChange, name, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="000.000.000-00"
        definitions={{ '#': /[1-9]/ }}
        inputRef={ref}
        onAccept={(value: string) => onChange({ target: { name, value } })}
        overwrite
      />
    );
  },
);

const PersonalInfoForm: FC<PersonalInfoFormProps> = ({
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
}: PersonalInfoFormProps) => {
  const theme = useTheme();
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isForAnotherPerson, setIsForAnotherPerson] = useState(false);
  const [validationSchema, setValidationSchema] = useState<z.ZodObject<any>>(z.object({}));

  // Criar o schema Zod dinamicamente com base nos campos do formulário
  const createValidationSchema = (fields: FormField[]) => {
    const schemaMap: Record<string, z.ZodTypeAny> = {};

    fields.forEach((field) => {
      const fieldName = `participant${formIndex}_${field.id}`;

      switch (field.type) {
        case 'email':
          schemaMap[fieldName] = field.required
            ? z.string().min(1, 'Email é obrigatório').email('Email inválido')
            : z.string().email('Email inválido').optional();
          break;
        case 'text':
          if (field.id === 'cpf') {
            schemaMap[fieldName] = field.required
              ? z.string().min(1, 'CPF é obrigatório').regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido')
              : z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido').optional();
          } else {
            schemaMap[fieldName] = field.required
              ? z.string().min(1, 'Este campo é obrigatório')
              : z.string().optional();
          }
          break;
        case 'date':
          schemaMap[fieldName] = field.required
            ? z.string().min(1, 'Data é obrigatória')
            : z.string().optional();
          break;
        case 'select':
          schemaMap[fieldName] = field.required
            ? z.string().min(1, `Selecione ${field.label.toLowerCase()}`)
            : z.string().optional();
          break;
        case 'checkbox':
          schemaMap[fieldName] = field.required
            ? z.boolean().refine((val) => val === true, { message: 'Este campo é obrigatório' })
            : z.boolean().optional();
          break;
        case 'phone':
          schemaMap[fieldName] = field.required
            ? z.string().min(1, 'Telefone é obrigatório').regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido')
            : z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido').optional();
          break;
      }
    });

    return z.object(schemaMap);
  };

  const {
    register,
    formState: { errors },
    reset,
    getValues,
    handleSubmit
  } = useForm<FormData>({
    resolver: zodResolver(validationSchema),
    mode: 'onBlur'
  });

  // Salvar e avançar para o próximo participante
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

    if (formIndex < totalParticipants - 1 && onParticipantChange) {
      onParticipantChange(formIndex + 1);
    }
  };

  // Carregar dados do localStorage no mount ou mudança de tab
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

  // Efeito para carregar campos do formulário e perfil do usuário
  useEffect(() => {
    // Usar uma referência para controlar se o componente está montado
    let isMounted = true;

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
          reset(initialData);
        } else if (profile && !isForAnotherPerson) {
          // Preencher com dados do perfil do usuário
          const profileData = mapProfileToFormData(profile, sortedFields);
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

      // Mapear campos específicos
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
          // Se for campo CPF, buscar pelo ID ou label
          if (field.id === 'cpf' || field.label === 'CPF') {
            value = profile.cpf || '';
          } else {
            // Tentar encontrar uma correspondência no perfil
            value = profile[field.id as keyof UserProfile] as string || '';
          }
      }

      // Definir valor inicial
      mappedData[field.id] = field.type === 'checkbox' ? false : value;
    });

    return mappedData;
  };

  // Renderizar campo com base no tipo
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
          <FormControl fullWidth required={field.required}>
            <Select
              {...register(fieldName)}
              label={field.label}
              required={field.required}
              fullWidth
              size="small"
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
            {error && (
              <FormHelperText error>{error.message as string}</FormHelperText>
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
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
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
        {Array.from({ length: totalParticipants }).map((_, index) => (
          <Box 
            key={index}
            sx={{ 
              mb: 4,
              p: 3,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              backgroundColor: alpha(ticketColor || theme.palette.primary.main, 0.05),
              position: 'relative'
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                color: ticketColor || 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <ConfirmationNumberIcon />
              {participantLabels ? participantLabels[index] : `Participante ${index + 1}`}
            </Typography>

            <Grid container spacing={2}>
              {formFields.map((field) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={field.type === 'checkbox' ? 12 : 6} 
                  key={`${index}-${field.id}`}
                >
                  {renderField(field, index)}
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </form>
    </Paper>
  );
};

export default PersonalInfoForm;

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
