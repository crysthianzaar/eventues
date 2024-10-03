// src/components/InformationCard.jsx

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { styled } from "@mui/system";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useParams } from "react-router-dom";

// Define the color palette
const colors = {
  primary: "#5A67D8", // Blue
  secondary: "#68D391", // Green
  lightBlue: "#63B3ED", // Light Blue
  grayLight: "#F7FAFC",
  grayDark: "#2D3748",
  white: "#FFFFFF",
  red: "#E53E3E",
};

// Styled Components
const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: colors.white,
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  color: colors.primary,
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    marginBottom: theme.spacing(1),
  },
}));

const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.secondary,
  color: "#fff",
  "&:hover": {
    backgroundColor: "#56c078", // Darker Green
  },
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

// Quill Editor Modules and Formats
const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    [{ color: [] }],
    ["link", "image"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "align",
  "link",
  "image",
  "color",
];

// Interfaces
interface EventDetail {
  name: string;
  category: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  state: string;
  city: string;
  address: string;
  address_complement: string;
  address_detail: string;
  organization_name: string;
  organization_contact: string;
  event_status: string;
  event_type: string;
  event_category: string;
  event_description?: string;
}

interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

interface InformationCardProps {
  onNotify: (message: string, severity: "success" | "error" | "info" | "warning") => void;
  onUpdate: () => void;
}

const initialDescriptionTemplate = `
<h2>Informações do Evento</h2>
<ul>
  <li><b>Introdução:</b> Fale um pouco sobre o que é o seu evento</li>
  <li><b>Local:</b> Forneça detalhes sobre onde será o evento e como chegar</li>
  <li><b>Cronograma:</b> Especifique horários importantes (início, intervalos, fim)</li>
  <li><b>Contato:</b> Informe como os participantes podem tirar dúvidas</li>
  <li><b>Premiação:</b> Detalhe sobre prêmios ou brindes que serão oferecidos</li>
  <li><b>Entregas de kit:</b> Forneça informações sobre locais e horários de entrega de kits</li>
  <li><b>Categoria:</b> Enumere as categorias participantes do evento</li>
  <li><b>Viradas de lote:</b> Informações sobre as datas e preços de lotes de ingressos</li>
  <li><b>Informações adicionais:</b> Outras informações importantes</li>
</ul>
`;

const InformationCard: React.FC<InformationCardProps> = ({
  onNotify, onUpdate
}) => {
  const { event_id } = useParams<{ event_id: string }>();
  const [formData, setFormData] = useState({
    eventName: "",
    eventCategory: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    state: "",
    city: "",
    address: "",
    addressComplement: "",
    addressDetail: "",
    organizationName: "",
    organizationContact: "",
    eventType: "",
    eventStatus: "",
    eventDescription: initialDescriptionTemplate,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // To force re-render

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await axios.get<EventDetail>(
          `http://127.0.0.1:8000/organizer_detail/${event_id}`
        );
        const data = response.data;
        setFormData({
          eventName: data.name,
          eventCategory: data.event_category,
          startDate: data.start_date.split("T")[0],
          startTime: data.start_time,
          endDate: data.end_date.split("T")[0],
          endTime: data.end_time,
          state: data.state,
          city: data.city,
          address: data.address,
          addressComplement: data.address_complement,
          addressDetail: data.address_detail,
          organizationName: data.organization_name,
          organizationContact: data.organization_contact,
          eventType: data.event_type,
          eventStatus: data.event_status,
          eventDescription: data.event_description || initialDescriptionTemplate,
        });
      } catch (err) {
        setError("Erro ao carregar detalhes do evento.");
        onNotify("Erro ao carregar detalhes do evento.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();

    // Load Brazilian states from IBGE
    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => {
        setEstados(response.data as Estado[]);
      })
      .catch((error) => {
        console.error("Erro ao carregar estados:", error);
        onNotify("Erro ao carregar estados.", "error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event_id, key]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.eventName) newErrors.push("Nome do evento é obrigatório.");
    if (!formData.eventCategory)
      newErrors.push("Categoria do evento é obrigatória.");
    if (!formData.startDate)
      newErrors.push("Data de início é obrigatória.");
    if (!formData.startTime)
      newErrors.push("Hora de início é obrigatória.");
    if (!formData.endDate)
      newErrors.push("Data de término é obrigatória.");
    if (!formData.endTime)
      newErrors.push("Hora de término é obrigatória.");
    if (!formData.state) newErrors.push("Estado é obrigatório.");
    if (!formData.city) newErrors.push("Cidade é obrigatória.");
    if (!formData.address) newErrors.push("Endereço é obrigatório.");
    if (!formData.addressDetail)
      newErrors.push("Nome do local é obrigatório.");
    if (!formData.organizationName)
      newErrors.push("Nome do organizador é obrigatório.");
    if (!formData.organizationContact)
      newErrors.push("Contato do organizador é obrigatório.");

    // Validação das datas
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate < startDate) {
        newErrors.push(
          "A data de término não pode ser anterior à data de início."
        );
      }
    }

    setErrors(newErrors);

    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setSubmitting(true);

      try {
        await axios.patch(
          `http://127.0.0.1:8000/organizer_detail/${event_id}/details`,
          {
            name: formData.eventName,
            category: formData.eventCategory,
            start_date: formData.startDate,
            start_time: formData.startTime,
            end_date: formData.endDate,
            end_time: formData.endTime,
            state: formData.state,
            city: formData.city,
            address: formData.address,
            address_complement: formData.addressComplement,
            address_detail: formData.addressDetail,
            organization_name: formData.organizationName,
            organization_contact: formData.organizationContact,
            event_type: formData.eventType,
            event_status: formData.eventStatus,
            event_description: formData.eventDescription,
          }
        );

        setSubmitting(false);
        setKey((prevKey) => prevKey + 1);

        onNotify("Detalhes do evento atualizados com sucesso!", "success");
        onUpdate();
      } catch (err) {
        setSubmitting(false);
        console.error("Erro ao enviar formulário:", err);
        onNotify("Erro ao atualizar detalhes do evento.", "error");
      }
    } else {
      onNotify("Por favor, corrija os erros no formulário.", "error");
    }
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const estadoSigla = e.target.value;
    setFormData({ ...formData, state: estadoSigla });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, eventDescription: value });
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getToday = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (`0${today.getMonth() + 1}`).slice(-2);
    const day = (`0${today.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" color={colors.primary}>
          Carregando...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={6}>
        {/* Informações Básicas */}
        <Grid item xs={12} md={6}>
          <SectionHeader variant="h6">Informações Básicas</SectionHeader>
          <Typography
            variant="body2"
            sx={{ color: colors.grayDark, marginBottom: "20px" }}
          >
            <span style={{ color: colors.red }}>*</span> As informações podem
            ser editadas a qualquer momento.
          </Typography>
          <TextField
            label="Nome do Evento"
            fullWidth
            required
            name="eventName"
            value={formData.eventName}
            onChange={handleInputChange}
            sx={{ marginBottom: "20px" }}
            // Alteração para prevenir autocomplete
            autoComplete="new-event-name"
            error={!!errors.find((error) =>
              error.includes("Nome do evento")
            )}
            helperText={errors.find((error) =>
              error.includes("Nome do evento")
            )}
          />
          <TextField
            label="Categoria do Evento"
            fullWidth
            required
            name="eventCategory"
            value={formData.eventCategory}
            onChange={handleInputChange}
            sx={{ marginBottom: "20px" }}
            // Alteração para prevenir autocomplete
            autoComplete="new-event-category"
            error={!!errors.find((error) =>
              error.includes("Categoria do evento")
            )}
            helperText={errors.find((error) =>
              error.includes("Categoria do evento")
            )}
          />
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Início"
                type="date"
                fullWidth
                required
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                sx={{ marginBottom: "20px" }}
                // Restringe a data mínima para hoje
                InputProps={{
                  inputProps: { min: getToday() },
                }}
                // Alteração para prevenir autocomplete
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
                label="Hora de Início"
                type="time"
                fullWidth
                required
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                sx={{ marginBottom: "20px" }}
                // Alteração para prevenir autocomplete
                autoComplete="new-start-time"
                error={!!errors.find((error) =>
                  error.includes("Hora de início")
                )}
                helperText={errors.find((error) =>
                  error.includes("Hora de início")
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Data de Término"
                type="date"
                fullWidth
                required
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                sx={{ marginBottom: "20px" }}
                // Restringe a data mínima para a data de início ou hoje
                InputProps={{
                  inputProps: { min: formData.startDate || getToday() },
                }}
                // Alteração para prevenir autocomplete
                autoComplete="new-end-date"
                error={!!errors.find((error) =>
                  error.includes("Data de término")
                )}
                helperText={errors.find((error) =>
                  error.includes("Data de término")
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora de Término"
                type="time"
                fullWidth
                required
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                sx={{ marginBottom: "20px" }}
                // Alteração para prevenir autocomplete
                autoComplete="new-end-time"
                error={!!errors.find((error) =>
                  error.includes("Hora de término")
                )}
                helperText={errors.find((error) =>
                  error.includes("Hora de término")
                )}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Localização do Evento */}
        <Grid item xs={12}>
          <SectionHeader variant="h6">Onde o evento vai acontecer?</SectionHeader>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Estado"
                fullWidth
                required
                name="state"
                value={formData.state}
                onChange={handleEstadoChange}
                sx={{ marginBottom: "20px" }}
                // Alteração para prevenir autocomplete
                autoComplete="new-state"
                error={!!errors.find((error) =>
                  error.includes("Estado")
                )}
                helperText={errors.find((error) =>
                  error.includes("Estado")
                )}
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
                label="Cidade"
                fullWidth
                required
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                sx={{ marginBottom: "20px" }}
                // Alteração para prevenir autocomplete
                autoComplete="new-city"
                error={!!errors.find((error) =>
                  error.includes("Cidade")
                )}
                helperText={errors.find((error) =>
                  error.includes("Cidade")
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Endereço"
                fullWidth
                required
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                sx={{ marginBottom: "20px" }}
                // Alteração para prevenir autocomplete
                autoComplete="new-address"
                error={!!errors.find((error) =>
                  error.includes("Endereço")
                )}
                helperText={errors.find((error) =>
                  error.includes("Endereço")
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome do Local"
                fullWidth
                required
                name="addressDetail"
                value={formData.addressDetail}
                onChange={handleInputChange}
                sx={{ marginBottom: "20px" }}
                // Alteração para prevenir autocomplete
                autoComplete="new-address-detail"
                error={!!errors.find((error) =>
                  error.includes("Nome do local")
                )}
                helperText={errors.find((error) =>
                  error.includes("Nome do local")
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Complemento (opcional)"
                fullWidth
                name="addressComplement"
                value={formData.addressComplement}
                onChange={handleInputChange}
                sx={{ marginBottom: "20px" }}
                // Alteração para prevenir autocomplete
                autoComplete="new-address-complement"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Descrição do Evento */}
        <Grid item xs={12}>
          <SectionHeader variant="h6">Descrição do Evento</SectionHeader>
          <ReactQuill
            value={formData.eventDescription}
            onChange={handleDescriptionChange}
            modules={modules}
            formats={formats}
            placeholder="Adicione aqui as informações do seu evento..."
            style={{
              backgroundColor: colors.white,
              borderRadius: "8px",
              height: "300px",
              marginBottom: "30px",
            }}
          />
        </Grid>
      </Grid>

      {/* Botão de Salvar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      >
        <SaveButton
          variant="contained"
          onClick={handleSubmit}
          startIcon={<SaveIcon />}
          disabled={submitting}
        >
          {submitting ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            "Salvar"
          )}
        </SaveButton>
      </Box>
    </Box>
  );
};

export default InformationCard;
