'use client';
import React, { useEffect, useState } from 'react';
import { useForm, Controller, FieldError, Control, FieldErrors, Path } from 'react-hook-form';
import { 
  Card, 
  CardContent, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Checkbox, 
  Button, 
  Typography, 
  Box,
  FormHelperText,
  Grid,
  CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
}

interface FormData {
  fullName: string;
  birthDate: Date;
  gender: string;
  city?: string;
  state?: string;
  address?: string;
  email: string;
  phone: string;
  emergencyContact: string;
  shirtSize?: string;
  medicalInfo?: string;
  team?: string;
  termsAccepted: boolean;
  [key: string]: any; // For custom fields
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  [key: string]: any;
}

interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

const defaultFields: FormField[] = [
  { id: 'fullName', label: 'Nome Completo', type: 'text', required: true },
  { id: 'birthDate', label: 'Data de Nascimento', type: 'date', required: true },
  { id: 'gender', label: 'Gênero', type: 'select', required: true, options: ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'] },
  { id: 'city', label: 'Cidade', type: 'text', required: false },
  { id: 'state', label: 'Estado', type: 'text', required: false },
  { id: 'address', label: 'Endereço', type: 'text', required: false },
  { id: 'email', label: 'Email', type: 'text', required: true },
  { id: 'phone', label: 'Telefone', type: 'text', required: true },
  { id: 'emergencyContact', label: 'Contato de Emergência', type: 'text', required: true },
  { id: 'shirtSize', label: 'Tamanho da Camiseta', type: 'select', required: false, options: ['PP', 'P', 'M', 'G', 'GG', 'XG'] },
  { id: 'medicalInfo', label: 'Informações Médicas', type: 'text', required: false },
  { id: 'team', label: 'Equipe', type: 'text', required: false },
  { id: 'termsAccepted', label: 'Aceito os Termos e Condições', type: 'checkbox', required: true },
];

interface FormCardProps {
  eventId: string;
  onSubmit: (data: FormData) => Promise<void>;
  customFields?: FormField[];
}

const fetcher = async (url: string): Promise<UserData> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch user data');
  return res.json();
};

export default function FormCard({ eventId, onSubmit, customFields = [] }: FormCardProps) {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const { data: userData, error } = useSWR<UserData>(
    session?.user ? `/api/users/${session.user.id}` : null,
    fetcher,
    { 
      revalidateOnFocus: false,
      dedupingInterval: 600000 // 10 minutes
    }
  );

  const [isOtherPerson, setIsOtherPerson] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fields = [...defaultFields, ...customFields];
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: React.useMemo(() => {
      if (!userData || isOtherPerson) return {};
      return {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        // ... other fields
      };
    }, [userData, isOtherPerson])
  });

  useEffect(() => {
    if (userData && !isOtherPerson) {
      reset(userData);
    }
  }, [userData, isOtherPerson, reset]);

  const handleFormSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        eventId,
        submittedAt: new Date().toISOString()
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    field: FormField,
    fieldControl: Control<FormData>,
    fieldError?: FieldError
  ) => {
    const fieldName = field.id as Path<FormData>;
    
    switch (field.type) {
      case 'date':
        return (
          <Controller
            name={fieldName}
            control={fieldControl}
            rules={{ required: field.required ? `${field.label} é obrigatório` : false }}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                label={field.label}
                value={value}
                onChange={onChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: field.required,
                    error: !!fieldError,
                    helperText: fieldError?.message
                  }
                }}
              />
            )}
          />
        );
      case 'select':
        return (
          <Controller
            name={fieldName}
            control={fieldControl}
            rules={{ required: field.required ? `${field.label} é obrigatório` : false }}
            render={({ field: { onChange, value } }) => (
              <FormControl fullWidth error={!!fieldError}>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  value={value || ''}
                  onChange={(e: SelectChangeEvent<string>) => onChange(e.target.value)}
                  label={field.label}
                  required={field.required}
                >
                  {field.options?.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {fieldError && <FormHelperText>{fieldError.message}</FormHelperText>}
              </FormControl>
            )}
          />
        );
      case 'checkbox':
        return (
          <Controller
            name={fieldName}
            control={fieldControl}
            rules={{ required: field.required ? `${field.label} é obrigatório` : false }}
            render={({ field: { onChange, value } }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    required={field.required}
                  />
                }
                label={field.label}
              />
            )}
          />
        );
      default:
        return (
          <Controller
            name={fieldName}
            control={fieldControl}
            rules={{ required: field.required ? `${field.label} é obrigatório` : false }}
            render={({ field: { onChange, value } }) => (
              <TextField
                fullWidth
                label={field.label}
                value={value || ''}
                onChange={onChange}
                required={field.required}
                error={!!fieldError}
                helperText={fieldError?.message}
              />
            )}
          />
        );
    }
  };

  return (
    <Card sx={{ maxWidth: 800, margin: '0 auto', mt: 4, mb: 4 }}>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isOtherPerson}
                onChange={(e) => {
                  setIsOtherPerson(e.target.checked);
                  reset({});
                }}
              />
            }
            label="Inscrição para outra pessoa"
          />
        </Box>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid item xs={12} sm={field.type === 'checkbox' ? 12 : 6} key={field.id}>
                {renderField(
                  field,
                  control,
                  (errors[field.id as Path<FormData>] as FieldError | undefined)
                )}
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                minWidth: 200,
                backgroundColor: '#5A67D8',
                '&:hover': {
                  backgroundColor: '#434190',
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Confirmar Inscrição'
              )}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}
