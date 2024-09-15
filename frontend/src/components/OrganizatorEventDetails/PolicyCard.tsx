import React, { useState } from 'react';
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

const colors = {
  primary: "#5A67D8",
  grayDark: "#2D3748",
  green: "#48BB78",
  red: "#F56565", // Adiciona a cor vermelha para o asterisco
};

const PolicyCard: React.FC = () => {
  const [formData, setFormData] = useState({
    eventVisibility: false,
    participantListVisibility: 'organizador', // valor inicial para o toggle
    cpfValidation: false,
    allowThirdPartyRegistration: false,
    hasAgeLimit: false,
    ageMin: '',
    ageMax: '',
    allowTransfer: false,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    if (formData.hasAgeLimit && (!formData.ageMin || !formData.ageMax)) {
      newErrors.push('Idade mínima e máxima são obrigatórias.');
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setSubmitting(true);
      try {
        console.log('Formulário enviado com sucesso:', formData);
      } catch (error) {
        console.error('Erro ao salvar as políticas:', error);
      } finally {
        setSubmitting(false);
      }
    }
  };

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
            onChange={handleInputChange}
            name="eventVisibility"
          />
        }
        label="Visibilidade do evento"
      />
      <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '20px' }}>
        <span style={{ color: colors.red }}>*</span> Define se o evento será público ou privado, acessível apenas por link direto.
      </Typography>

      <Divider sx={{ margin: '20px 0' }} /> {/* Separador visual */}

      {/* Visibilidade da lista de participantes - Usando RadioGroup para toggle */}
      <FormControl component="fieldset" sx={{ marginBottom: '20px' }}>
        <FormLabel component="legend" sx={{ fontSize: '14px', color: 'black' }}>
          Visibilidade da lista de participantes:
        </FormLabel>
        <RadioGroup
          row
          aria-label="visibility"
          name="participantListVisibility"
          value={formData.participantListVisibility}
          onChange={handleToggleChange}
        >
          <FormControlLabel value="public" control={<Radio />} label={<Typography sx={{ fontSize: '14px' }}>Pública</Typography>} />
          <FormControlLabel value="inscritos" control={<Radio />} label={<Typography sx={{ fontSize: '14px' }}>Visível para os inscritos</Typography>} />
          <FormControlLabel value="organizador" control={<Radio />} label={<Typography sx={{ fontSize: '14px' }}>Visível apenas para o organizador</Typography>} />
        </RadioGroup>
      </FormControl>
      <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '20px' }}>
        <span style={{ color: colors.red }}>*</span> Escolha se a lista de participantes será pública, visível para inscritos ou visível apenas para o organizador.
      </Typography>

      <Divider sx={{ margin: '20px 0' }} /> {/* Separador visual */}

      {/* Validação de CPF único */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.cpfValidation}
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
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
            error={!!errors.find((error) => error.includes('Idade mínima'))}
          />
          <TextField
            label="Idade máxima"
            name="ageMax"
            fullWidth
            value={formData.ageMax}
            onChange={handleInputChange}
            error={!!errors.find((error) => error.includes('Idade máxima'))}
          />
        </Box>
      )}
      <Typography variant="body2" sx={{ color: colors.grayDark, marginBottom: '20px' }}>
        <span style={{ color: colors.red }}>*</span> Define a idade mínima e/ou máxima permitida para participar.
      </Typography>

      <Divider sx={{ margin: '20px 0' }} /> {/* Separador visual */}

      {/* Permitir transferência de inscrição */}
      <FormControlLabel
        control={
          <Switch
            checked={formData.allowTransfer}
            onChange={handleInputChange}
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

      {errors.length > 0 && (
        <Box sx={{ marginTop: '20px' }}>
          {errors.map((error, index) => (
            <Typography key={index} color="error" variant="body2">
              {error}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PolicyCard;
