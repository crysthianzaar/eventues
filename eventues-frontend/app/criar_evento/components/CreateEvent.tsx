// components/CreateEvent.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Card,
  CircularProgress,
  useMediaQuery,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useRouter } from "next/navigation";
import { useTheme } from "@mui/material/styles";

// Importando as funções de API
import { fetchEstados, fetchCidades, Estado, Cidade } from "../api/ibge";
import { createEvent } from "../api/events";

// Importando hooks do Firebase
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase";


// Interfaces
interface EventResponse {
  event_id: string;
}

const steps = ["Detalhes do Evento", "Tipo de Evento", "Localização e Contato"];

const modalidades = [
  { label: "Artes Marciais" },
  { label: "Atletismo" },
  { label: "Automobilismo" },
  { label: "Badminton" },
  { label: "Caminhada" },
  { label: "Canoagem" },
  { label: "Ciclismo" },
  { label: "Corrida de Rua" },
  { label: "Enduro" },
  { label: "Escalada Esportiva" },
  { label: "Kitesurf" },
  { label: "Motociclismo" },
  { label: "Motocross" },
  { label: "Mountain Bike" },
  { label: "Natação" },
  { label: "Off Road" },
  { label: "Parapente" },
  { label: "Parkour" },
  { label: "Rafting" },
  { label: "Skate" },
  { label: "Stand Up Paddle" },
  { label: "Surf" },
  { label: "Tênis" },
  { label: "Tiro com Arco" },
  { label: "Trail Run" },
  { label: "Triatlo" },
  { label: "Vôlei de Praia" },
  { label: "Windsurf" },
  { label: "Outras" },
];

const CreateEvent: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Uso do hook de autenticação
  const [user, loadingAuth, errorAuth] = useAuthState(auth);

  const [formValues, setFormValues] = useState({
    nomeEvento: "",
    categoria: "",
    dataInicio: "",
    dataTermino: "",
    event_type: "",
    estado: "",
    cidade: "",
    nomeOrganizador: "",
    telefone: "",
  });

  const [sameDayEvent, setSameDayEvent] = useState(false); // New state variable
  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingCidades, setLoadingCidades] = useState(false);

  useEffect(() => {
    const loadEstados = async () => {
      setLoadingEstados(true);
      try {
        const estadosData = await fetchEstados();
        setEstados(estadosData);
      } catch (error) {
        setErrors((prev) => [...prev, "Erro ao carregar os estados."]);
      } finally {
        setLoadingEstados(false);
      }
    };

    loadEstados();
  }, []);

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push("/login");
    }
  }, [user, loadingAuth, router]);

  const handleEstadoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormValues({ ...formValues, estado: value, cidade: "" });
    setCidades([]);
    setLoadingCidades(true);

    try {
      const cidadesData = await fetchCidades(value);
      setCidades(cidadesData);
    } catch (error) {
      setErrors((prev) => [...prev, "Erro ao carregar as cidades."]);
    } finally {
      setLoadingCidades(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: string[] = [];

    if (step === 0) {
      // Validação da Etapa 0: Detalhes do Evento
      if (!formValues.nomeEvento)
        newErrors.push("Nome do evento é obrigatório.");
      if (!formValues.dataInicio)
        newErrors.push("Data de início é obrigatória.");

      if (!sameDayEvent && !formValues.dataTermino) {
        newErrors.push("Data de término é obrigatória.");
      }

      if (
        formValues.dataInicio &&
        formValues.dataTermino &&
        !sameDayEvent
      ) {
        const startDate = new Date(formValues.dataInicio);
        const endDate = new Date(formValues.dataTermino);
        if (endDate < startDate) {
          newErrors.push(
            "A data de término não pode ser anterior à data de início."
          );
        }
      }
    } else if (step === 1) {
      // Validação da Etapa 1: Tipo de Evento
      if (!formValues.event_type)
        newErrors.push("Tipo de evento é obrigatório.");
      if (!formValues.categoria)
        newErrors.push("Categoria é obrigatória.");
    } else if (step === 2) {
      // Validação da Etapa 2: Localização e Contato
      if (!formValues.estado)
        newErrors.push("Estado é obrigatório.");
      if (!formValues.cidade)
        newErrors.push("Cidade é obrigatória.");
      if (!formValues.nomeOrganizador)
        newErrors.push("Nome do organizador é obrigatório.");
      if (!formValues.telefone)
        newErrors.push("Telefone é obrigatório.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formValues.nomeEvento)
      newErrors.push("Nome do evento é obrigatório.");
    if (!formValues.categoria)
      newErrors.push("Categoria é obrigatória.");
    if (!formValues.dataInicio)
      newErrors.push("Data de início é obrigatória.");

    if (!sameDayEvent && !formValues.dataTermino) {
      newErrors.push("Data de término é obrigatória.");
    }

    if (
      formValues.dataInicio &&
      formValues.dataTermino &&
      !sameDayEvent
    ) {
      const startDate = new Date(formValues.dataInicio);
      const endDate = new Date(formValues.dataTermino);
      if (endDate < startDate) {
        newErrors.push(
          "A data de término não pode ser anterior à data de início."
        );
      }
    }

    if (!formValues.estado)
      newErrors.push("Estado é obrigatório.");
    if (!formValues.cidade)
      newErrors.push("Cidade é obrigatória.");
    if (!formValues.nomeOrganizador)
      newErrors.push("Nome do organizador é obrigatório.");
    if (!formValues.telefone)
      newErrors.push("Telefone é obrigatório.");
    if (!formValues.event_type)
      newErrors.push("Tipo de evento é obrigatório.");

    setErrors(newErrors);

    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);

      // Obtenha o user_id do usuário autenticado
      const userId = user?.uid;

      if (!userId) {
        setErrors(["Erro: Usuário não autenticado."]);
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: formValues.nomeEvento,
        category: formValues.categoria,
        start_date: formValues.dataInicio,
        end_date: sameDayEvent ? formValues.dataInicio : formValues.dataTermino,
        event_type: formValues.event_type,
        event_category: formValues.categoria,
        state: formValues.estado,
        city: formValues.cidade,
        organization_name: formValues.nomeOrganizador,
        organization_contact: formValues.telefone,
        user_id: userId, // Utilize o userId do Firebase
      };

      try {
        const eventResponse = await createEvent(payload);
        const eventId = eventResponse.event_id;
        setSubmitted(true);
        // Navegar para a página de detalhes do evento
        router.push(`/event_detail/${eventId}`);
      } catch (error) {
        console.error("Erro ao criar evento:", error);
        setIsSubmitting(false);
        setErrors(["Erro ao criar o evento. Por favor, tente novamente."]);
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => {
      const updatedValues = { ...prevValues, [name]: value };
      // Se o evento é no mesmo dia, atualiza a data de término automaticamente
      if (name === "dataInicio" && sameDayEvent) {
        updatedValues.dataTermino = value;
      }
      return updatedValues;
    });
  };

  const handleSameDayEventChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const isChecked = e.target.checked;
    setSameDayEvent(isChecked);
    if (isChecked) {
      // Se marcado, define a data de término igual à data de início
      setFormValues((prevValues) => ({
        ...prevValues,
        dataTermino: prevValues.dataInicio,
      }));
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setErrors([]); // Limpa os erros ao avançar
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setErrors([]); // Limpa os erros ao voltar
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormValues({
      nomeEvento: "",
      categoria: "",
      dataInicio: "",
      dataTermino: "",
      event_type: "",
      estado: "",
      cidade: "",
      nomeOrganizador: "",
      telefone: "",
    });
    setSameDayEvent(false);
    setErrors([]);
  };

  // Função auxiliar para obter a data de hoje no formato YYYY-MM-DD
  const getToday = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (`0${today.getMonth() + 1}`).slice(-2);
    const day = (`0${today.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nome do Evento"
                variant="outlined"
                fullWidth
                required
                name="nomeEvento"
                value={formValues.nomeEvento}
                onChange={handleChange}
                autoComplete="new-event-name"
                error={!!errors.find((error) =>
                  error.includes("Nome do evento")
                )}
                helperText={errors.find((error) =>
                  error.includes("Nome do evento")
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Início"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                name="dataInicio"
                value={formValues.dataInicio}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: getToday() },
                }}
                autoComplete="new-start-date"
                error={!!errors.find((error) =>
                  error.includes("Data de início")
                )}
                helperText={errors.find((error) =>
                  error.includes("Data de início")
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Término"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                required={!sameDayEvent}
                disabled={sameDayEvent}
                name="dataTermino"
                value={sameDayEvent ? formValues.dataInicio : formValues.dataTermino}
                onChange={handleChange}
                InputProps={{
                  inputProps: {
                    min: formValues.dataInicio || getToday(),
                  },
                }}
                autoComplete="new-end-date"
                error={
                  !sameDayEvent &&
                  !!errors.find((error) =>
                    error.includes("Data de término")
                  )
                }
                helperText={
                  !sameDayEvent &&
                  errors.find((error) =>
                    error.includes("Data de término")
                  )
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={sameDayEvent}
                    onChange={handleSameDayEventChange}
                    color="primary"
                  />
                }
                label="O evento termina no mesmo dia"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                label="Tipo de Evento"
                variant="outlined"
                fullWidth
                required
                name="event_type"
                value={formValues.event_type}
                onChange={handleChange}
                autoComplete="new-event-type"
                error={!!errors.find((error) =>
                  error.includes("Tipo de evento")
                )}
                helperText={errors.find((error) =>
                  error.includes("Tipo de evento")
                )}
              >
                <MenuItem value="presencial">Presencial</MenuItem>
                <MenuItem value="virtual">Virtual</MenuItem>
                <MenuItem value="hibrido">Híbrido</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Categoria do Evento"
                variant="outlined"
                fullWidth
                required
                name="categoria"
                value={formValues.categoria}
                onChange={handleChange}
                autoComplete="new-categoria"
                error={!!errors.find((error) =>
                  error.includes("Categoria")
                )}
                helperText={errors.find((error) =>
                  error.includes("Categoria")
                )}
              >
                {modalidades.map((modalidade, index) => (
                  <MenuItem key={index} value={modalidade.label}>
                    {modalidade.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Estado"
                fullWidth
                required
                name="estado"
                value={formValues.estado}
                onChange={handleEstadoChange}
                autoComplete="new-estado"
                error={!!errors.find((error) =>
                  error.includes("Estado")
                )}
                helperText={errors.find((error) =>
                  error.includes("Estado")
                )}
                disabled={loadingEstados}
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
                disabled={!formValues.estado || loadingCidades}
                autoComplete="new-cidade"
                error={!!errors.find((error) =>
                  error.includes("Cidade")
                )}
                helperText={errors.find((error) =>
                  error.includes("Cidade")
                )}
              >
                {cidades.map((cidade) => (
                  <MenuItem key={cidade.id} value={cidade.nome}>
                    {cidade.nome}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Nome do Organizador"
                variant="outlined"
                fullWidth
                required
                name="nomeOrganizador"
                value={formValues.nomeOrganizador}
                onChange={handleChange}
                autoComplete="new-nome-organizador"
                error={!!errors.find((error) =>
                  error.includes("Nome do organizador")
                )}
                helperText={errors.find((error) =>
                  error.includes("Nome do organizador")
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Telefone (Whatsapp)"
                variant="outlined"
                fullWidth
                required
                name="telefone"
                value={formValues.telefone}
                onChange={handleChange}
                autoComplete="new-telefone"
                error={!!errors.find((error) =>
                  error.includes("Telefone")
                )}
                helperText={errors.find((error) =>
                  error.includes("Telefone")
                )}
              />
            </Grid>
          </Grid>
        );
      default:
        return "Desconhecido...";
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "40px 20px",
        backgroundColor: "#daecf9",
      }}
    >
      {loadingAuth ? (
        <CircularProgress />
      ) : user ? (
        submitted ? (
          <Box
            sx={{
              textAlign: "center",
              animation: "fadeIn 1s ease-in-out",
              color: "#68D391",
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 80 }} />
            <Typography variant="h4" sx={{ mt: 2 }}>
              Evento criado com sucesso!
            </Typography>
          </Box>
        ) : isSubmitting ? (
          <CircularProgress sx={{ color: "#68D391" }} />
        ) : (
          <Card
            sx={{
              width: "100%",
              maxWidth: "1100px",
              minHeight: "600px",
              padding: "40px",
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              boxShadow: "0 0 15px rgba(0, 0, 0, 0.2)",
              borderRadius: "15px",
              opacity: submitted ? 0 : 1,
              transition: "opacity 1s ease-in-out",
            }}
          >
            <Box
              sx={{
                width: isMobile ? "100%" : "50%",
                height: isMobile ? "200px" : "auto",
                background:
                  "url(https://img.freepik.com/vetores-gratis/ilustracao-de-execucao-de-mulher-geometrica-azul_1284-52845.jpg) center center / cover no-repeat",
                borderRadius: isMobile ? "15px 15px 0 0" : "15px 0 0 15px",
              }}
            />
            <Box
              sx={{
                width: isMobile ? "100%" : "50%",
                padding: "0 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                paddingTop: isMobile ? "20px" : "0",
              }}
            >
              <Stepper
                activeStep={activeStep}
                sx={{
                  marginBottom: "30px",
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                {steps.map((label) => (
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
                  <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                    <Box sx={{ flex: "1 1 auto" }} />
                    <Button onClick={handleReset} color="secondary">
                      Resetar
                    </Button>
                  </Box>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Box sx={{ mb: 2 }}>{getStepContent(activeStep)}</Box>
                  <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                    <Button
                      color="inherit"
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      Voltar
                    </Button>
                    <Box sx={{ flex: "1 1 auto" }} />
                    {activeStep === steps.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                      >
                        Finalizar
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNext}
                        variant="contained"
                        color="primary"
                      >
                        Próximo
                      </Button>
                    )}
                  </Box>
                </React.Fragment>
              )}
            </Box>
          </Card>
        )
      ) : (
        // Caso ocorra um erro na autenticação
        <Box sx={{ textAlign: "center" }}>
          <Typography color="error">
            {errorAuth?.message || "Erro na autenticação."}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CreateEvent;
