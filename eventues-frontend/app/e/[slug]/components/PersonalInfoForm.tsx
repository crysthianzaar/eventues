import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { FormField, UserProfile, getEventForm, getUserProfile } from '@/app/apis/api';

interface PersonalInfoFormProps {
  eventId: string;
  onFormDataChange: (data: Record<string, any>) => void;
}

export default function PersonalInfoForm({ eventId, onFormDataChange }: PersonalInfoFormProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isForAnotherPerson, setIsForAnotherPerson] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fields, profile] = await Promise.all([
          getEventForm(eventId),
          getUserProfile(),
        ]);

        setFormFields(fields);
        setUserProfile(profile);

        // Preenche o formulário com os dados do usuário
        const initialData = fields.reduce<Record<string, any>>((acc, field) => {
          const key = field.label.toLowerCase().replace(/\s/g, '');
          const value = profile[key] || '';
          return { ...acc, [field.label]: value };
        }, {});

        setFormData(initialData);
        onFormDataChange(initialData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Erro ao carregar informações. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, onFormDataChange]);

  const handleInputChange = (fieldLabel: string, value: any) => {
    const newFormData = {
      ...formData,
      [fieldLabel]: value,
    };
    setFormData(newFormData);
    onFormDataChange(newFormData);
  };

  const handleToggleForAnotherPerson = () => {
    setIsForAnotherPerson(!isForAnotherPerson);
    if (!isForAnotherPerson) {
      // Se estiver mudando para outra pessoa, limpa os campos
      const emptyData = formFields.reduce<Record<string, any>>((acc, field) => ({
        ...acc,
        [field.label]: '',
      }), {});
      setFormData(emptyData);
      onFormDataChange(emptyData);
    } else {
      // Se estiver voltando para o usuário atual, preenche com os dados do perfil
      const profileData = formFields.reduce<Record<string, any>>((acc, field) => {
        const key = field.label.toLowerCase().replace(/\s/g, '');
        const value = userProfile?.[key] || '';
        return { ...acc, [field.label]: value };
      }, {});
      setFormData(profileData);
      onFormDataChange(profileData);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'Texto':
        return (
          <TextField
            fullWidth
            label={field.label}
            value={formData[field.label] || ''}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            required={field.required}
          />
        );

      case 'Número':
        return (
          <TextField
            fullWidth
            label={field.label}
            type="number"
            value={formData[field.label] || ''}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            required={field.required}
          />
        );

      case 'Data':
        return (
          <TextField
            fullWidth
            label={field.label}
            type="date"
            value={formData[field.label] || ''}
            onChange={(e) => handleInputChange(field.label, e.target.value)}
            required={field.required}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'Seleção':
        return (
          <FormControl fullWidth required={field.required}>
            <Select
              value={formData[field.label] || ''}
              onChange={(e) => handleInputChange(field.label, e.target.value)}
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
            <FormHelperText>{field.label}</FormHelperText>
          </FormControl>
        );

      case 'Verdadeiro/Falso':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={formData[field.label] || false}
                onChange={(e) => handleInputChange(field.label, e.target.checked)}
                required={field.required}
              />
            }
            label={field.label}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box>
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
        {!isForAnotherPerson && (
          <Typography variant="body2" color="textSecondary">
            Os campos estão preenchidos com suas informações
          </Typography>
        )}
      </Box>

      <Grid container spacing={2}>
        {formFields.map((field) => (
          <Grid item xs={12} sm={6} key={field.id}>
            {renderField(field)}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
