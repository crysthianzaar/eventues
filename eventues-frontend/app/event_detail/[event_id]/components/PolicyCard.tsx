// app/components/OrganizatorEventDetails/PolicyCard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
  Button,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { styled } from '@mui/system';

// Define your color palette
const colors = {
  primary: "#5A67D8",      // Azul
  secondary: "#68D391",    // Verde
  lightBlue: "#63B3ED",    // Azul Claro
  grayLight: "#EDF2F7",    // Cinza Claro
  grayDark: "#2D3748",     // Cinza Escuro
  white: "#FFFFFF",
  red: "#E53E3E",
};

// Styled Components
const SectionHeader = styled(Typography)(({ theme }) => ({
  color: colors.primary,
  fontWeight: 'bold',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.secondary,
  color: '#fff',
  padding: '10px 20px',
  "&:hover": {
    backgroundColor: '#56c078', // Verde mais escuro
  },
}));

const AgeInputContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '10px',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(3),
}));

// TypeScript Interfaces
interface EventPolicy {
  eventVisibility: boolean;
  participantListVisibility: 'public' | 'inscritos' | 'organizador';
  cpfValidation: boolean;
  allowThirdPartyRegistration: boolean;
  hasAgeLimit: boolean;
  ageMin?: string;
  ageMax?: string;
  allowTransfer: boolean;
}

interface GetPolicyResponse {
  id: number;
  policy_id: string;
  event_id: string;
  event_visibility: boolean;
  participant_list_visibility: 'public' | 'inscritos' | 'organizador';
  cpf_validation: boolean;
  allow_third_party_registration: boolean;
  has_age_limit: boolean;
  age_min: number | null;
  age_max: number | null;
  allow_transfer: boolean;
}

interface PolicyCardProps {
  eventId: string;
  onUpdate: () => void;
  handleNotify: (message: string, severity: "success" | "error" | "info" | "warning") => void;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ eventId, onUpdate, handleNotify }) => {
  const [formData, setFormData] = useState<EventPolicy>({
    eventVisibility: false,
    participantListVisibility: 'organizador',
    cpfValidation: false,
    allowThirdPartyRegistration: false,
    hasAgeLimit: false,
    ageMin: '',
    ageMax: '',
    allowTransfer: false,
  });

  const [errors, setErrors] = useState<{ ageMin?: string; ageMax?: string }>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // API Functions
  const fetchEventPolicy = async (eventId: string): Promise<GetPolicyResponse> => {
    const response = await axios.get(`http://127.0.0.1:8000/organizer_detail/${eventId}/get_policy`);
    return response.data as GetPolicyResponse;
  };

  const updateEventPolicy = async (eventId: string, policyData: any): Promise<void> => {
    await axios.patch(`http://127.0.0.1:8000/organizer_detail/${eventId}/policy`, policyData);
  };

  // Fetch Policy Data on Mount
  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const response = await fetchEventPolicy(eventId);
        // Update form data based on API response
        const policyData: EventPolicy = {
          eventVisibility: response.event_visibility,
          participantListVisibility: response.participant_list_visibility,
          cpfValidation: response.cpf_validation,
          allowThirdPartyRegistration: response.allow_third_party_registration,
          hasAgeLimit: response.has_age_limit,
          ageMin: response.age_min !== null ? String(response.age_min) : '',
          ageMax: response.age_max !== null ? String(response.age_max) : '',
          allowTransfer: response.allow_transfer,
        };
        setFormData(policyData);
      } catch (error) {
        setFetchError('Erro ao carregar as políticas do evento.');
        console.error('Erro ao carregar as políticas do evento:', error);
        handleNotify('Erro ao carregar as políticas do evento.', 'error');
      } finally {
        setLoading(false);
        validateForm();
      }
    };
    loadPolicy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Handle Toggle Switches
  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validate Form Data
  const validateForm = (): boolean => {
    const newErrors: { ageMin?: string; ageMax?: string } = {};
    if (formData.hasAgeLimit) {
      if (!formData.ageMin) {
        newErrors.ageMin = 'Idade mínima é obrigatória.';
      }
      if (!formData.ageMax) {
        newErrors.ageMax = 'Idade máxima é obrigatória.';
      }
      if (formData.ageMin && formData.ageMax) {
        const min = parseInt(formData.ageMin, 10);
        const max = parseInt(formData.ageMax, 10);
        if (isNaN(min) || isNaN(max)) {
          newErrors.ageMin = 'Idades devem ser números válidos.';
          newErrors.ageMax = 'Idades devem ser números válidos.';
        } else if (min > max) {
          newErrors.ageMin = 'Idade mínima não pode ser maior que a máxima.';
          newErrors.ageMax = 'Idade máxima não pode ser menor que a mínima.';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = async () => {
    if (validateForm()) {
      setSubmitting(true);
      try {
        const payload = {
          event_visibility: formData.eventVisibility,
          participant_list_visibility: formData.participantListVisibility,
          cpf_validation: formData.cpfValidation,
          allow_third_party_registration: formData.allowThirdPartyRegistration,
          has_age_limit: formData.hasAgeLimit,
          age_min: formData.ageMin ? parseInt(formData.ageMin, 10) : null,
          age_max: formData.ageMax ? parseInt(formData.ageMax, 10) : null,
          allow_transfer: formData.allowTransfer,
        };
        await updateEventPolicy(eventId, payload);
        handleNotify('Políticas do evento atualizadas com sucesso.', 'success');
        onUpdate(); // Trigger refetch or parent update
      } catch (error) {
        console.error('Erro ao salvar as políticas:', error);
        handleNotify('Erro ao salvar as políticas do evento.', 'error');
      } finally {
        setSubmitting(false);
      }
    } else {
      handleNotify('Por favor, corrija os erros no formulário.', 'error');
    }
  };

  // Loading State
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error State
  if (fetchError) {
    return (
      <Typography color="error">{fetchError}</Typography>
    );
  }

  return (
    <Box>
      <SectionHeader variant="h6">
        Definir Políticas do Evento
      </SectionHeader>

      {/* Visibilidade do Evento */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.eventVisibility}
            onChange={handleToggleChange}
            name="eventVisibility"
            color="primary"
          />
        }
        label="Visibilidade do evento"
      />
      <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '20px' }}>
        <span style={{ color: colors.red }}>*</span> Define se o evento será público ou privado, acessível apenas por link direto.
      </Typography>

      <Divider sx={{ margin: '20px 0' }} /> {/* Visual Separator */}

      {/* Visibilidade da Lista de Participantes */}
      <FormControl component="fieldset" sx={{ marginBottom: '20px' }}>
        <FormLabel component="legend" sx={{ fontSize: '14px', color: 'black' }}>
          Visibilidade da lista de participantes:
        </FormLabel>
        <RadioGroup
          row
          aria-label="participantListVisibility"
          name="participantListVisibility"
          value={formData.participantListVisibility}
          onChange={handleInputChange}
        >
          <FormControlLabel value="public" control={<Radio />} label={<Typography sx={{ fontSize: '14px' }}>Pública</Typography>} />
          <FormControlLabel value="inscritos" control={<Radio />} label={<Typography sx={{ fontSize: '14px' }}>Visível para os inscritos</Typography>} />
          <FormControlLabel value="organizador" control={<Radio />} label={<Typography sx={{ fontSize: '14px' }}>Visível apenas para o organizador</Typography>} />
        </RadioGroup>
      </FormControl>

      <Divider sx={{ margin: '20px 0' }} /> {/* Visual Separator */}

      {/* Validação de CPF Único */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.cpfValidation}
            onChange={handleToggleChange}
            name="cpfValidation"
            color="primary"
          />
        }
        label="Validação de CPF único"
      />
      <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '20px' }}>
        <span style={{ color: colors.red }}>*</span> Garante uma única inscrição por CPF, evitando duplicidades.
      </Typography>

      <Divider sx={{ margin: '20px 0' }} /> {/* Visual Separator */}

      {/* Permitir Inscrição por Terceiros */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.allowThirdPartyRegistration}
            onChange={handleToggleChange}
            name="allowThirdPartyRegistration"
            color="primary"
          />
        }
        label="Permitir inscrição por terceiros"
      />
      <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '20px' }}>
        <span style={{ color: colors.red }}>*</span> Permite que alguém realize a inscrição em nome de outra pessoa.
      </Typography>

      <Divider sx={{ margin: '20px 0' }} /> {/* Visual Separator */}

      {/* Limite de Idade */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.hasAgeLimit}
            onChange={handleToggleChange}
            name="hasAgeLimit"
            color="primary"
          />
        }
        label="Definir limite de idade"
      />
      {formData.hasAgeLimit && (
        <AgeInputContainer>
          <TextField
            label="Idade mínima"
            name="ageMin"
            fullWidth
            value={formData.ageMin}
            onChange={handleInputChange}
            error={!!errors.ageMin}
            helperText={errors.ageMin}
          />
          <TextField
            label="Idade máxima"
            name="ageMax"
            fullWidth
            value={formData.ageMax}
            onChange={handleInputChange}
            error={!!errors.ageMax}
            helperText={errors.ageMax}
          />
        </AgeInputContainer>
      )}

      <Divider sx={{ margin: '20px 0' }} /> {/* Visual Separator */}

      {/* Permitir Transferência de Inscrição */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.allowTransfer}
            onChange={handleToggleChange}
            name="allowTransfer"
            color="primary"
          />
        }
        label="Permitir transferência de inscrição"
      />
      <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '20px' }}>
        <span style={{ color: colors.red }}>*</span> Permite que a inscrição seja transferida para outra pessoa.
      </Typography>

      {/* Save Button */}
      <ButtonContainer>
        <SaveButton
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : 'Salvar'}
        </SaveButton>
      </ButtonContainer>
    </Box>
  );
};

export default PolicyCard;
