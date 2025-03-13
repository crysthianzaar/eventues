'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  Paper,
  Divider,
  Alert,
  SelectChangeEvent,
  useTheme,
  styled,
  alpha,
  Fade,
  Zoom,
  InputAdornment,
  Tooltip,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import { estados, Estado } from '@/utils/estados';
import { z } from 'zod';
import { debounce } from 'lodash';
import { getLocalStorageItem, setLocalStorageItem } from '@/app/utils/localStorage';
import InfoIcon from '@mui/icons-material/Info';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GroupsIcon from '@mui/icons-material/Groups';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Define form schema using Zod
const formSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  genero: z.string().min(1, 'Gênero é obrigatório'),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  endereco: z.string().optional(),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  contatoEmergencia: z.string().min(10, 'Contato de emergência deve ter pelo menos 10 dígitos'),
  tamanhoCamiseta: z.string().optional(),
  infoMedicas: z.string().optional(),
  equipe: z.string().optional(),
  termos: z.boolean().refine((val: boolean) => val === true, {
    message: 'Você deve aceitar os termos e condições'
  })
});

type FormData = z.infer<typeof formSchema>;

interface PersonalInfoFormProps {
  eventId: string;
  onFormDataChange: (data: FormData) => void;
  formIndex?: number;
  initialData?: Partial<FormData>;
  ticketName?: string;
  ticketColor?: string;
  allParticipants?: FormData[];
  onParticipantChange?: (index: number) => void;
  totalParticipants?: number;
  participantLabels?: string[];
}

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
  }
}));

const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: -8,
    width: 40,
    height: 4,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 2,
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  }
}));

const RequiredLabel = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: theme.spacing(0.5),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiTab-root': {
    minWidth: 'auto',
    padding: theme.spacing(1, 2),
    borderRadius: theme.spacing(1),
    margin: theme.spacing(0, 0.5),
    transition: 'all 0.2s ease',
    fontWeight: 500,
    '&.Mui-selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      color: theme.palette.primary.main,
    },
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: 1.5,
  },
}));

export default function PersonalInfoForm({ 
  eventId, 
  onFormDataChange, 
  formIndex = 0, 
  initialData = {}, 
  ticketName = 'Ingresso',
  ticketColor,
  allParticipants = [],
  onParticipantChange,
  totalParticipants = 1,
  participantLabels = []
}: PersonalInfoFormProps) {
  const theme = useTheme();
  const [formKey, setFormKey] = useState(Date.now());
  const [isForAnotherPerson, setIsForAnotherPerson] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    dataNascimento: '',
    genero: '',
    cidade: '',
    estado: '',
    endereco: '',
    email: '',
    telefone: '',
    contatoEmergencia: '',
    tamanhoCamiseta: '',
    infoMedicas: '',
    equipe: '',
    termos: false
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  
  // Load saved form data on mount (only for first participant)
  useEffect(() => {
    if (formIndex === 0 && !isForAnotherPerson) {
      const savedData = getLocalStorageItem<string>(`event_form_${eventId}`, '');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData((prevData: FormData) => ({
            ...prevData,
            ...parsedData
          }));
          // Notify parent of loaded data
          onFormDataChange({
            ...formData,
            ...parsedData
          });
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    }
  }, [eventId, isForAnotherPerson, formIndex]);

  // Update form when initialData changes
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData((prevData: FormData) => ({
        ...prevData,
        ...initialData
      }));
    }
  }, [initialData]);

  // Save form data to localStorage with debounce (only for first participant)
  const saveFormData = debounce((data: FormData) => {
    if (formIndex === 0) {
      setLocalStorageItem(`event_form_${eventId}`, JSON.stringify(data));
    }
  }, 500);

  // Validate a single field
  const validateField = (name: keyof FormData, value: any) => {
    try {
      const fieldSchema = z.object({ [name]: formSchema.shape[name] });
      fieldSchema.parse({ [name]: value });
      setErrors((prev: Partial<Record<keyof FormData, string>>) => ({ ...prev, [name]: undefined }));
      return true;
    } catch (e: unknown) {
      if (e instanceof z.ZodError) {
        const fieldError = e.errors.find((err: any) => err.path[0] === name);
        if (fieldError) {
          setErrors((prev: Partial<Record<keyof FormData, string>>) => ({ ...prev, [name]: fieldError.message }));
        }
      }
      return false;
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    validateField(name as keyof FormData, value);
    
    // Save to localStorage and notify parent
    const newData = { ...formData, [name]: value };
    onFormDataChange(newData);
    saveFormData(newData);
  };

  // Handle select input changes
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    validateField(name as keyof FormData, value);
    
    // Save to localStorage and notify parent
    const newData = { ...formData, [name]: value };
    onFormDataChange(newData);
    saveFormData(newData);
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: FormData) => ({ ...prev, [name]: checked }));
    validateField(name as keyof FormData, checked);
    
    // Save to localStorage and notify parent
    const newData = { ...formData, [name]: checked };
    onFormDataChange(newData);
    saveFormData(newData);
  };

  // Toggle "For Another Person" option
  const handleToggleForAnotherPerson = () => {
    setIsForAnotherPerson(!isForAnotherPerson);
    if (!isForAnotherPerson) {
      // Clear form when switching to "For Another Person"
      setFormData({
        nome: '',
        dataNascimento: '',
        genero: '',
        cidade: '',
        estado: '',
        endereco: '',
        email: '',
        telefone: '',
        contatoEmergencia: '',
        tamanhoCamiseta: '',
        infoMedicas: '',
        equipe: '',
        termos: false
      });
      setFormKey(Date.now()); // Reset form
    } else {
      // Load saved data when switching back
      const savedData = getLocalStorageItem<string>(`event_form_${eventId}`, '');
      if (savedData && formIndex === 0) {
        try {
          const parsedData = JSON.parse(savedData);
          setFormData((prevData: FormData) => ({
            ...prevData,
            ...parsedData
          }));
          // Notify parent
          onFormDataChange({
            ...formData,
            ...parsedData
          });
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    }
  };

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    // Format as (XX) XXXXX-XXXX
    if (numericValue.length <= 2) {
      return numericValue;
    } else if (numericValue.length <= 7) {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
    } else {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7, 11)}`;
    }
  };

  // Handle phone input with formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const formattedValue = formatPhoneNumber(value);
    
    setFormData((prev: FormData) => ({ ...prev, [name]: formattedValue }));
    validateField(name as keyof FormData, formattedValue);
    
    // Save to localStorage and notify parent
    const newData = { ...formData, [name]: formattedValue };
    onFormDataChange(newData);
    saveFormData(newData);
  };

  // Handle participant tab change
  const handleParticipantChange = (_: React.SyntheticEvent, newValue: number) => {
    if (onParticipantChange) {
      onParticipantChange(newValue);
    }
  };

  // Generate participant tabs
  const renderParticipantTabs = () => {
    if (totalParticipants <= 1) return null;
    
    return (
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <StyledTabs
          value={formIndex}
          onChange={handleParticipantChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="participantes"
        >
          {Array.from({ length: totalParticipants }).map((_, index) => {
            const label = participantLabels[index] || `Participante ${index + 1}`;
            const color = ticketColor || theme.palette.primary.main;
            
            return (
              <Tab 
                key={index} 
                label={label}
                icon={<PersonIcon fontSize="small" />}
                iconPosition="start"
                sx={{
                  borderBottom: formIndex === index ? `3px solid ${color}` : 'none',
                  color: formIndex === index ? color : 'inherit'
                }}
              />
            );
          })}
        </StyledTabs>
      </Box>
    );
  };

  return (
    <Fade in={true} timeout={500}>
      <StyledPaper key={formKey} sx={ticketColor ? {
        borderTop: `4px solid ${ticketColor}`,
      } : {}}>
        {renderParticipantTabs()}
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              bgcolor: ticketColor || theme.palette.primary.main, 
              color: 'white', 
              borderRadius: '50%', 
              width: 36, 
              height: 36, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <PersonIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: ticketColor || 'primary.main', lineHeight: 1.2 }}>
                {ticketName}
              </Typography>
            </Box>
          </Box>
          
          {formIndex === 0 && (
            <FormControlLabel
              control={
                <Checkbox 
                  checked={isForAnotherPerson}
                  onChange={handleToggleForAnotherPerson}
                  color="primary"
                />
              }
              label="Inscrição para outra pessoa"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
            />
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <FormSection>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Informações Pessoais
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <StyledTextField
                fullWidth
                label={<>Nome Completo<RequiredLabel>*</RequiredLabel></>}
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                error={!!errors.nome}
                helperText={errors.nome}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <StyledTextField
                fullWidth
                label={<>Data de Nascimento<RequiredLabel>*</RequiredLabel></>}
                name="dataNascimento"
                type="date"
                value={formData.dataNascimento}
                onChange={handleInputChange}
                error={!!errors.dataNascimento}
                helperText={errors.dataNascimento}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EventIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <StyledFormControl fullWidth error={!!errors.genero}>
                <InputLabel id="genero-label">
                  Gênero<RequiredLabel>*</RequiredLabel>
                </InputLabel>
                <Select
                  labelId="genero-label"
                  name="genero"
                  value={formData.genero}
                  onChange={handleSelectChange}
                  label="Gênero*"
                >
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Feminino">Feminino</MenuItem>
                  <MenuItem value="Não Binário">Não Binário</MenuItem>
                  <MenuItem value="Prefiro não informar">Prefiro não informar</MenuItem>
                </Select>
                {errors.genero && <FormHelperText>{errors.genero}</FormHelperText>}
              </StyledFormControl>
            </Grid>
          </Grid>
        </FormSection>
        
        <FormSection>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Endereço
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <StyledTextField
                fullWidth
                label="Cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleInputChange}
                error={!!errors.cidade}
                helperText={errors.cidade}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <StyledFormControl fullWidth error={!!errors.estado}>
                <InputLabel id="estado-label">Estado</InputLabel>
                <Select
                  labelId="estado-label"
                  name="estado"
                  value={formData.estado}
                  onChange={handleSelectChange}
                  label="Estado"
                >
                  {estados.map((estado) => (
                    <MenuItem key={estado.value} value={estado.value}>
                      {estado.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.estado && <FormHelperText>{errors.estado}</FormHelperText>}
              </StyledFormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <StyledTextField
                fullWidth
                label="Endereço"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                error={!!errors.endereco}
                helperText={errors.endereco}
              />
            </Grid>
          </Grid>
        </FormSection>
        
        <FormSection>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Contato
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <StyledTextField
                fullWidth
                label={<>Email<RequiredLabel>*</RequiredLabel></>}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <StyledTextField
                fullWidth
                label={<>Telefone<RequiredLabel>*</RequiredLabel></>}
                name="telefone"
                value={formData.telefone}
                onChange={handlePhoneChange}
                error={!!errors.telefone}
                helperText={errors.telefone || 'Formato: (XX) XXXXX-XXXX'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <StyledTextField
                fullWidth
                label={<>Contato de Emergência<RequiredLabel>*</RequiredLabel></>}
                name="contatoEmergencia"
                value={formData.contatoEmergencia}
                onChange={handlePhoneChange}
                error={!!errors.contatoEmergencia}
                helperText={errors.contatoEmergencia || 'Formato: (XX) XXXXX-XXXX'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </FormSection>
        
        <FormSection>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Informações Adicionais
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <StyledFormControl fullWidth>
                <InputLabel id="tamanho-camiseta-label">Tamanho da Camiseta</InputLabel>
                <Select
                  labelId="tamanho-camiseta-label"
                  name="tamanhoCamiseta"
                  value={formData.tamanhoCamiseta}
                  onChange={handleSelectChange}
                  label="Tamanho da Camiseta"
                >
                  <MenuItem value="PP">PP</MenuItem>
                  <MenuItem value="P">P</MenuItem>
                  <MenuItem value="M">M</MenuItem>
                  <MenuItem value="G">G</MenuItem>
                  <MenuItem value="GG">GG</MenuItem>
                  <MenuItem value="XGG">XGG</MenuItem>
                </Select>
              </StyledFormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <StyledTextField
                fullWidth
                label="Informações Médicas"
                name="infoMedicas"
                value={formData.infoMedicas}
                onChange={handleInputChange}
                multiline
                rows={2}
                placeholder="Alergias, condições médicas, medicamentos..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalHospitalIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <StyledTextField
                fullWidth
                label="Equipe"
                name="equipe"
                value={formData.equipe}
                onChange={handleInputChange}
                placeholder="Nome da sua equipe (se aplicável)"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupsIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </FormSection>
        
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox 
                checked={formData.termos}
                onChange={handleCheckboxChange}
                name="termos"
                color="primary"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2">
                  Li e aceito os termos e condições do evento
                </Typography>
                <RequiredLabel>*</RequiredLabel>
                <Tooltip title="Ao aceitar os termos, você concorda com as regras do evento, política de privacidade e uso de imagem.">
                  <IconButton size="small">
                    <InfoIcon fontSize="small" color="action" />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          />
          {errors.termos && (
            <FormHelperText error>{errors.termos}</FormHelperText>
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.75rem' }}>
          <RequiredLabel>*</RequiredLabel> Campos obrigatórios
        </Typography>
      </StyledPaper>
    </Fade>
  );
}
