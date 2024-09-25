import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { TextField, MenuItem, Grid, Stack, Card, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from 'axios'; 
import { useNavigate } from "react-router-dom";

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
}

interface EventResponse {
  event_id: string;
}

const steps = ['Detalhes do Evento', 'Tipo de Evento', 'Localização e Contato'];

const modalidades = [
  { label: 'Artes Marciais' },
  { label: 'Badminton' },
  { label: 'Caminhada' },
  { label: 'Canoagem' },
  { label: 'Ciclismo' },
  { label: 'Corrida de Rua' },
  { label: 'Escalada Esportiva' },
  { label: 'Mountain Bike' },
  { label: 'Natação' },
  { label: 'Skate' },
  { label: 'Surf' },
  { label: 'Tênis' },
  { label: 'Tiro com Arco' },
  { label: 'Triatlo' },
  { label: 'Vôlei de Praia' },
  { label: 'Outro' },
];

export default function CreateEventStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false); 
  const [isSubmitting, setIsSubmitting] = React.useState(false); 
  const [errors, setErrors] = React.useState<string[]>([]);
  const navigate = useNavigate();

  const [formValues, setFormValues] = React.useState({
    nomeEvento: '',
    categoria: '',
    dataInicio: '',
    dataTermino: '',
    event_type: '',
    estado: '',
    cidade: '',
    nomeOrganizador: '',
    telefone: ''
  });

  const [estados, setEstados] = React.useState<Estado[]>([]); 
  const [cidades, setCidades] = React.useState<Cidade[]>([]);

  React.useEffect(() => {
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        setEstados(response.data as Estado[]);
      })
      .catch(error => console.error('Erro ao carregar estados:', error));
  }, []);

  const handleEstadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormValues({ ...formValues, estado: value, cidade: '' }); // Limpa a cidade ao mudar o estado
    
    axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${value}/municipios`)
      .then(response => {
        setCidades(response.data as Cidade[]);
      })
      .catch(error => console.error('Erro ao carregar cidades:', error));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];

    if (step === 0) {
      // Validação da Etapa 0: Detalhes do Evento
      if (!formValues.nomeEvento) newErrors.push('Nome do evento é obrigatório.');
      if (!formValues.dataInicio) newErrors.push('Data de início é obrigatória.');
      if (!formValues.dataTermino) newErrors.push('Data de término é obrigatória.');

      if (formValues.dataInicio && formValues.dataTermino) {
        const startDate = new Date(formValues.dataInicio);
        const endDate = new Date(formValues.dataTermino);
        if (endDate < startDate) {
          newErrors.push('A data de término não pode ser anterior à data de início.');
        }
      }
    } else if (step === 1) {
      // Validação da Etapa 1: Tipo de Evento
      if (!formValues.event_type) newErrors.push('Tipo de evento é obrigatório.');
      if (!formValues.categoria) newErrors.push('Categoria é obrigatória.');
    } else if (step === 2) {
      // Validação da Etapa 2: Localização e Contato
      if (!formValues.estado) newErrors.push('Estado é obrigatório.');
      if (!formValues.cidade) newErrors.push('Cidade é obrigatória.');
      if (!formValues.nomeOrganizador) newErrors.push('Nome do organizador é obrigatório.');
      if (!formValues.telefone) newErrors.push('Telefone é obrigatório.');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formValues.nomeEvento) newErrors.push('Nome do evento é obrigatório.');
    if (!formValues.categoria) newErrors.push('Categoria é obrigatória.');
    if (!formValues.dataInicio) newErrors.push('Data de início é obrigatória.');
    if (!formValues.dataTermino) newErrors.push('Data de término é obrigatória.');
    if (!formValues.estado) newErrors.push('Estado é obrigatório.');
    if (!formValues.cidade) newErrors.push('Cidade é obrigatória.');
    if (!formValues.nomeOrganizador) newErrors.push('Nome do organizador é obrigatório.');
    if (!formValues.telefone) newErrors.push('Telefone é obrigatório.');
    if (!formValues.event_type) newErrors.push('Tipo de evento é obrigatório.');

    // Validação das datas
    if (formValues.dataInicio && formValues.dataTermino) {
      const startDate = new Date(formValues.dataInicio);
      const endDate = new Date(formValues.dataTermino);
      if (endDate < startDate) {
        newErrors.push('A data de término não pode ser anterior à data de início.');
      }
    }

    setErrors(newErrors);

    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setIsSubmitting(true);

      const userId = localStorage.getItem('user_id');

      if (!userId) {
        setErrors(['Erro: Usuário não autenticado.']);
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: formValues.nomeEvento,
        category: formValues.categoria,
        start_date: formValues.dataInicio,
        end_date: formValues.dataTermino,
        event_type: formValues.event_type,
        event_category: formValues.categoria,
        state: formValues.estado,
        city: formValues.cidade,
        organization_name: formValues.nomeOrganizador,
        organization_contact: formValues.telefone,
        user_id: userId.replace(/-/g, '')
      };

      axios.post<EventResponse>('http://127.0.0.1:8000/events', payload)
      .then(response => {
        const eventId = response.data.event_id;
        setSubmitted(true);
        navigate(`/event_detail/${eventId}`);
      })
      .catch(error => {
        console.error('Erro ao criar evento:', error);
        setIsSubmitting(false);
        setErrors(['Erro ao criar o evento. Por favor, tente novamente.']);
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormValues({
      nomeEvento: '',
      categoria: '',
      dataInicio: '',
      dataTermino: '',
      event_type: '',
      estado: '',
      cidade: '',
      nomeOrganizador: '',
      telefone: ''
    });
    setErrors([]);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={2}>
            <TextField
              label="Nome do evento"
              variant="outlined"
              fullWidth
              required
              name="nomeEvento"
              value={formValues.nomeEvento}
              onChange={handleChange}
              error={!!errors.find((error) => error.includes('Nome do evento'))}
              helperText={errors.find((error) => error.includes('Nome do evento'))}
            />
            <Grid container spacing={0}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data de início"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  name="dataInicio"
                  value={formValues.dataInicio}
                  onChange={handleChange}
                  error={!!errors.find((error) => error.includes('Data de início'))}
                  helperText={errors.find((error) => error.includes('Data de início'))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Data de término"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  name="dataTermino"
                  value={formValues.dataTermino}
                  onChange={handleChange}
                  // Definindo o valor mínimo como a data de início
                  InputProps={{
                    inputProps: { min: formValues.dataInicio }
                  }}
                  error={!!errors.find((error) => error.includes('Data de término'))}
                  helperText={errors.find((error) => error.includes('Data de término'))}
                />
              </Grid>
            </Grid>
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={3}>
            <TextField
              select
              label="Tipo de Evento"
              variant="outlined"
              fullWidth
              required
              name="event_type"
              value={formValues.event_type}
              onChange={handleChange}
              error={!!errors.find((error) => error.includes('Tipo de evento'))}
              helperText={errors.find((error) => error.includes('Tipo de evento'))}
            >
              <MenuItem value="presencial">Presencial</MenuItem>
              <MenuItem value="virtual">Virtual</MenuItem>
              <MenuItem value="hibrido">Híbrido</MenuItem>
            </TextField>

            <TextField
              select
              label="Categoria do evento"
              variant="outlined"
              fullWidth
              required
              name="categoria"
              value={formValues.categoria}
              onChange={handleChange}
              error={!!errors.find((error) => error.includes('Categoria'))}
              helperText={errors.find((error) => error.includes('Categoria'))}
            >
              {modalidades.map((modalidade, index) => (
                <MenuItem key={index} value={modalidade.label}>
                  {modalidade.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={3}>
            <Grid container spacing={0}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Estado"
                  fullWidth
                  required
                  name="estado"
                  value={formValues.estado}
                  onChange={handleEstadoChange}
                  error={!!errors.find((error) => error.includes('Estado'))}
                  helperText={errors.find((error) => error.includes('Estado'))}
                >
                  {estados.map((estado) => (
                    <MenuItem key={estado.id} value={estado.sigla}>
                      {estado.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Cidade"
                  fullWidth
                  required
                  name="cidade"
                  value={formValues.cidade}
                  onChange={handleChange}
                  disabled={!formValues.estado}
                  autoComplete="off" // Desativa o autocomplete para a cidade
                  error={!!errors.find((error) => error.includes('Cidade'))}
                  helperText={errors.find((error) => error.includes('Cidade'))}
                >
                  {cidades.map((cidade) => (
                    <MenuItem key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Nome do organizador"
              variant="outlined"
              fullWidth
              required
              name="nomeOrganizador"
              value={formValues.nomeOrganizador}
              onChange={handleChange}
              autoComplete="off" // Desativa o autocomplete para o nome do organizador
              error={!!errors.find((error) => error.includes('Nome do organizador'))}
              helperText={errors.find((error) => error.includes('Nome do organizador'))}
            />
            <TextField
              label="Telefone (Whatsapp)"
              variant="outlined"
              fullWidth
              required
              name="telefone"
              value={formValues.telefone}
              onChange={handleChange}
              autoComplete="off" // Desativa o autocomplete para o telefone
              error={!!errors.find((error) => error.includes('Telefone'))}
              helperText={errors.find((error) => error.includes('Telefone'))}
            />
          </Stack>
        );
      default:
        return 'Desconhecido...';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '40px 20px',
        backgroundColor: '#daecf9',
      }}
    >
      {submitted ? (
        <Box
          sx={{
            textAlign: 'center',
            animation: 'fadeIn 1s ease-in-out',
            color: '#68D391',
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 80 }} />
          <Typography variant="h4" sx={{ mt: 2 }}>
            Evento criado com sucesso!
          </Typography>
        </Box>
      ) : isSubmitting ? (
        <CircularProgress sx={{ color: '#68D391' }} />
      ) : (
        <Card
          sx={{
            width: '100%',
            maxWidth: '1100px',
            minHeight: '600px',
            padding: '40px',
            display: 'flex',
            flexDirection: 'row',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
            borderRadius: '15px',
            opacity: submitted ? 0 : 1,
            transition: 'opacity 1s ease-in-out',
            '@media (max-width: 600px)': {
              flexDirection: 'column',
              width: '95%', 
              minHeight: 'auto',
              padding: '20px',
            },
          }}
        >
          <Box
            sx={{
              width: '50%',
              background: 'url(https://img.freepik.com/vetores-gratis/ilustracao-de-execucao-de-mulher-geometrica-azul_1284-52845.jpg) center center / cover no-repeat',
              borderRadius: '15px 0 0 15px',
              '@media (max-width: 600px)': {
                width: '100%',
                height: '200px',
                borderRadius: '15px 15px 0 0',
              },
            }}
          />

          <Box
            sx={{
              width: '50%',
              padding: '0 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              '@media (max-width: 600px)': {
                width: '100%',
                padding: '10px',
              },
            }}
          >
            <Stepper 
              activeStep={activeStep} 
              sx={{ 
                marginBottom: '30px',
                '@media (max-width: 600px)': {
                  flexDirection: 'column',
                },
              }}
            >
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {errors.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {errors.map((error, index) => (
                  <Typography key={index} color="error">
                    {error}
                  </Typography>
                ))}
              </Box>
            )}

            {activeStep === steps.length ? (
              <React.Fragment>
                <Typography sx={{ mt: 2, mb: 1 }}>
                  Todos os passos foram concluídos - Evento criado com sucesso.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                  <Box sx={{ flex: '1 1 auto' }} />
                  <Button onClick={handleReset} color="secondary">
                    Resetar
                  </Button>
                </Box>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Box sx={{ mb: 2 }}>{getStepContent(activeStep)}</Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                  <Button
                    color="inherit"
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Voltar
                  </Button>
                  <Box sx={{ flex: '1 1 auto' }} />
                  {activeStep === steps.length - 1 ? (
                    <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isSubmitting}>
                      Finalizar
                    </Button>
                  ) : (
                    <Button onClick={handleNext} variant="contained" color="primary">
                      Próximo
                    </Button>
                  )}
                </Box>
              </React.Fragment>
            )}
          </Box>
        </Card>
      )}
    </Box>
  );
}
