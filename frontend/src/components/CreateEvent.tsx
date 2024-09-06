import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { TextField, MenuItem, Grid, Stack, FormControlLabel, Switch, Card, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from 'axios'; 
import { useNavigate } from "react-router-dom";

// Definindo interfaces para os estados e cidades
interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
}

const steps = ['Detalhes do Evento', 'Tipo de Evento', 'Localização e Contato'];

export default function CreateEventStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false); // Estado para animação após submissão
  const [isSubmitting, setIsSubmitting] = React.useState(false); // Controle de estado do botão
  const [errors, setErrors] = React.useState<string[]>([]); // Armazena mensagens de erro
  const router = useNavigate(); // Para redirecionar para a página inicial

  const [formValues, setFormValues] = React.useState({
    nomeEvento: '',
    categoria: '',
    dataInicio: '',
    horaInicio: '',
    dataTermino: '',
    horaTermino: '',
    presencial: false,
    virtual: false,
    hibrido: false,
    estado: '',
    cidade: '',
    nomeOrganizador: '',
    telefone: ''
  });

  const [estados, setEstados] = React.useState<Estado[]>([]); // Definir array de estados como Estado[]
  const [cidades, setCidades] = React.useState<Cidade[]>([]); // Definir array de cidades como Cidade[]

  React.useEffect(() => {
    // Carregar a lista de estados ao montar o componente
    axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        setEstados(response.data as Estado[]);
      })
      .catch(error => console.error('Erro ao carregar estados:', error));
  }, []);

  const handleEstadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormValues({ ...formValues, estado: value });
    
    // Carregar as cidades do estado selecionado
    axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${value}/municipios`)
      .then(response => {
        setCidades(response.data as Cidade[]);
      })
      .catch(error => console.error('Erro ao carregar cidades:', error));
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Validações para cada campo
    if (!formValues.nomeEvento) newErrors.push('Nome do evento é obrigatório.');
    if (!formValues.categoria) newErrors.push('Categoria é obrigatória.');
    if (!formValues.dataInicio) newErrors.push('Data de início é obrigatória.');
    if (!formValues.horaInicio) newErrors.push('Hora de início é obrigatória.');
    if (!formValues.dataTermino) newErrors.push('Data de término é obrigatória.');
    if (!formValues.horaTermino) newErrors.push('Hora de término é obrigatória.');
    if (!formValues.estado) newErrors.push('Estado é obrigatório.');
    if (!formValues.cidade) newErrors.push('Cidade é obrigatória.');
    if (!formValues.nomeOrganizador) newErrors.push('Nome do organizador é obrigatório.');
    if (!formValues.telefone) newErrors.push('Telefone é obrigatório.');

    // Validação dos tipos de evento (pelo menos um deve ser true)
    if (!formValues.presencial && !formValues.virtual && !formValues.hibrido) {
      newErrors.push('Pelo menos um tipo de evento (presencial, virtual ou híbrido) deve ser selecionado.');
    }

    setErrors(newErrors);

    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      setIsSubmitting(true);
      setTimeout(() => {
        setSubmitted(true); // Animação de sucesso

        setTimeout(() => {
          router('/'); // Redireciona para a página inicial
        }, 2000);
      }, 1000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: checked
    });
  };


  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
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
      horaInicio: '',
      dataTermino: '',
      horaTermino: '',
      presencial: false,
      virtual: false,
      hibrido: false,
      estado: '',
      cidade: '',
      nomeOrganizador: '',
      telefone: ''
    });
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
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  label="Hora de início"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  name="horaInicio"
                  value={formValues.horaInicio}
                  onChange={handleChange}
                  error={!!errors.find((error) => error.includes('Hora de início'))}
                  helperText={errors.find((error) => error.includes('Hora de início'))}
                />
              </Grid>
            </Grid>
            <Grid container spacing={0}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Data de término"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  name="dataTermino"
                  value={formValues.dataTermino}
                  onChange={handleChange}
                  error={!!errors.find((error) => error.includes('Data de término'))}
                  helperText={errors.find((error) => error.includes('Data de término'))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Hora de término"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  name="horaTermino"
                  value={formValues.horaTermino}
                  onChange={handleChange}
                  error={!!errors.find((error) => error.includes('Hora de término'))}
                  helperText={errors.find((error) => error.includes('Hora de término'))}
                />
              </Grid>
            </Grid>
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={3}>
            <FormControlLabel
              control={<Switch checked={formValues.presencial} onChange={handleSwitchChange} name="presencial" />}
              label="Presencial"
              sx={{ color: '#2D3748' }}
            />
            <FormControlLabel
              control={<Switch checked={formValues.virtual} onChange={handleSwitchChange} name="virtual" />}
              label="Virtual"
              sx={{ color: '#2D3748' }}
            />
            <FormControlLabel
              control={<Switch checked={formValues.hibrido} onChange={handleSwitchChange} name="hibrido" />}
              label="Híbrido"
              sx={{ color: '#2D3748' }}
            />
            {errors.find((error) => error.includes('Pelo menos um tipo de evento')) && (
              <Typography color="error">Pelo menos um tipo de evento deve ser selecionado.</Typography>
            )}
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
              <MenuItem value="Ciclismo">Ciclismo</MenuItem>
              <MenuItem value="Corrida">Corrida</MenuItem>
              <MenuItem value="Workshop">Workshop</MenuItem>
            </TextField>
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={3}>
            <Grid container spacing={0}>
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Cidade"
                  fullWidth
                  required
                  name="cidade"
                  value={formValues.cidade}
                  onChange={handleChange}
                  disabled={!formValues.estado}
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
          }}
        >
          <Box
            sx={{
              width: '50%',
              background: 'url(https://img.freepik.com/vetores-gratis/ilustracao-de-execucao-de-mulher-geometrica-azul_1284-52845.jpg) center center / cover no-repeat',
              borderRadius: '15px 0 0 15px',
            }}
          />

          <Box
            sx={{
              width: '50%',
              padding: '0 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Stepper activeStep={activeStep} sx={{ marginBottom: '30px' }}>
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
