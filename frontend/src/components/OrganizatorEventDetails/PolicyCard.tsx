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

// Definindo as cores
const colors = {
  primary: "#5A67D8",
  grayDark: "#2D3748",
  green: "#48BB78",
  red: "#F56565",
};

// Interfaces/Types
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

// Funções API
const fetchEventPolicy = async (eventId: string): Promise<GetPolicyResponse> => {
  const response = await axios.get(`http://127.0.0.1:8000/organizer_detail/${eventId}/get_policy`);
  return response.data as GetPolicyResponse;
};

const updateEventPolicy = async (eventId: string, policyData: any): Promise<void> => {
  await axios.patch(`http://127.0.0.1:8000/organizer_detail/${eventId}/policy`, policyData);
};

// Componente principal
const PolicyCard: React.FC<{ eventId: string }> = ({ eventId }) => {
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
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const response = await fetchEventPolicy(eventId);
        // Atualiza os dados do formulário com base no payload da API
        const policyData = {
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
      } finally {
        setLoading(false);
      }
    };
    loadPolicy();
  }, [eventId]);

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { ageMin?: string; ageMax?: string } = {};
    if (formData.hasAgeLimit && (!formData.ageMin || !formData.ageMax)) {
      newErrors.ageMin = 'Idade mínima e máxima são obrigatórias.';
      newErrors.ageMax = 'Idade mínima e máxima são obrigatórias.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        console.log('Políticas do evento atualizadas com sucesso.');
      } catch (error) {
        console.error('Erro ao salvar as políticas:', error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (fetchError) {
    return <Typography color="error">{fetchError}</Typography>;
  }

  return (
    <Box sx={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <Typography variant="h6" sx={{ color: colors.primary, marginBottom: '20px' }}>
        Definir Políticas do Evento
      </Typography>

      {/* Visibilidade do evento */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.eventVisibility}
            onChange={handleToggleChange}
            name="eventVisibility"
          />
        }
        label="Visibilidade do evento"
      />
      <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '20px' }}>
        <span style={{ color: colors.red }}>*</span> Define se o evento será público ou privado, acessível apenas por link direto.
      </Typography>

      <Divider sx={{ margin: '20px 0' }} /> {/* Separador visual */}

      {/* Visibilidade da lista de participantes */}
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

      <Divider sx={{ margin: '20px 0' }} /> {/* Separador visual */}

      {/* Validação de CPF único */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.cpfValidation}
            onChange={handleToggleChange}
            name="cpfValidation"
          />
        }
        label="Validação de CPF único"
      />
      <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '20px' }}>
        <span style={{ color: colors.red }}>*</span> Garante uma única inscrição por CPF, evitando duplicidades.
      </Typography>

      <Divider sx={{ margin: '20px 0' }} /> {/* Separador visual */}

      {/* Permitir inscrição por terceiros */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.allowThirdPartyRegistration}
            onChange={handleToggleChange}
            name="allowThirdPartyRegistration"
          />
        }
        label="Permitir inscrição por terceiros"
      />
      <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '20px' }}>
        <span style={{ color: colors.red }}>*</span> Permite que alguém realize a inscrição em nome de outra pessoa.
      </Typography>

      <Divider sx={{ margin: '20px 0' }} /> {/* Separador visual */}

      {/* Limite de idade */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.hasAgeLimit}
            onChange={handleToggleChange}
            name="hasAgeLimit"
          />
        }
        label="Definir limite de idade"
      />
      {formData.hasAgeLimit && (
        <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
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
        </Box>
      )}

      <Divider sx={{ margin: '20px 0' }} /> {/* Separador visual */}

      {/* Permitir transferência de inscrição */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.allowTransfer}
            onChange={handleToggleChange}
            name="allowTransfer"
          />
        }
        label="Permitir transferência de inscrição"
      />
      <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '20px' }}>
        <span style={{ color: colors.red }}>*</span> Permite que a inscrição seja transferida para outra pessoa.
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: colors.green,
            color: '#fff',
            padding: '10px 20px',
            "&:hover": { backgroundColor: "#38A169" },
          }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : 'Salvar'}
        </Button>
      </Box>
    </Box>
  );
};

export default PolicyCard;
