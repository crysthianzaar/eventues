"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Modal,
} from "@mui/material";
import { Save, PhotoCamera } from "@mui/icons-material";
import { styled } from "@mui/system";
import axios from "axios";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css"; // Importando os estilos do Cropper
import ImageCropperModal from "./ImageCropperModal"; // Importando o modal de corte

// Carregamento dinâmico do ReactQuill
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const colors = {
  primary: "#5A67D8",
  secondary: "#68D391",
  white: "#FFFFFF",
};

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  color: colors.primary,
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
}));

const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.secondary,
  color: "#fff",
  "&:hover": {
    backgroundColor: "#56c078",
  },
}));

// Configurações do Quill Editor
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

const InformationCard: React.FC = () => {
  const params = useParams();
  const { event_id } = params;
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
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // Estado para controlar a renderização do Quill
  const [attachments, setAttachments] = useState<File[]>([]); // Estado para anexos

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!event_id) return;
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
        if (data.event_description) {
          setFormData((prev) => ({
            ...prev,
            eventDescription: data.event_description || initialDescriptionTemplate,
          }));
        }
      } catch (err) {
        setError("Erro ao carregar detalhes do evento.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();

    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => setEstados(response.data as Estado[]))
      .catch(() => setError("Erro ao carregar estados"));

    // Definir que o cliente foi montado
    setIsClient(true);
  }, [event_id]);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleBannerSave = (croppedImage: string) => {
    setBannerImage(croppedImage);
    handleCloseModal();
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

  // Função para adicionar arquivos
  const handleFiles = (files: File[]) => {
    // Filtrar arquivos já anexados para evitar duplicatas
    const newFiles = files.filter(
      (file) => !attachments.some((att) => att.name === file.name && att.size === file.size)
    );
    setAttachments((prev) => [...prev, ...newFiles]);
  };

  // Função para remover um anexo
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const formDataToSend = new FormData();
      // Adicionar os dados do formulário
      formDataToSend.append("name", formData.eventName);
      formDataToSend.append("event_category", formData.eventCategory);
      formDataToSend.append("start_date", formData.startDate);
      formDataToSend.append("start_time", formData.startTime);
      formDataToSend.append("end_date", formData.endDate);
      formDataToSend.append("end_time", formData.endTime);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("address_complement", formData.addressComplement);
      formDataToSend.append("address_detail", formData.addressDetail);
      formDataToSend.append("organization_name", formData.organizationName);
      formDataToSend.append("organization_contact", formData.organizationContact);
      formDataToSend.append("event_type", formData.eventType);
      formDataToSend.append("event_status", formData.eventStatus);
      formDataToSend.append("event_description", formData.eventDescription);
      
      // Adicionar anexos
      attachments.forEach((file) => {
        formDataToSend.append("attachments", file);
      });
      
      // Adicionar bannerImage se existir
      if (bannerImage) {
        const blob = await (await fetch(bannerImage)).blob();
        formDataToSend.append("banner_image", blob, "banner.png");
      }
      
      await axios.patch(
        `http://127.0.0.1:8000/organizer_detail/${event_id}/details`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      // Opcional: Feedback de sucesso ou redirecionamento
      alert("Evento salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar o evento:", error);
      setError("Erro ao salvar o evento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
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
      {/* Banner do Evento */}
      <StyledCard>
        {bannerImage ? (
          <>
            <Box
              component="img"
              src={bannerImage}
              alt="Banner do evento"
              sx={{ width: "100%", height: "auto" }}
            />
            <Box display="flex" justifyContent="center" mt={2} mb={2}>
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={handleOpenModal}
                sx={{ alignSelf: "center" }}
              >
                Editar Imagem
              </Button>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              height: 200,
              width: "100%",
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Nenhuma imagem selecionada como banner do evento
            </Typography>

            {/* Ícone de adicionar imagem logo abaixo do texto */}
            <IconButton
              component="label"
              sx={{
                backgroundColor: colors.white,
                borderRadius: "50%",
                boxShadow: 2,
                marginTop: 2, // Espaçamento entre o texto e o ícone
              }}
              onClick={handleOpenModal}
            >
              <PhotoCamera />
            </IconButton>
          </Box>
        )}
      </StyledCard>

      {/* Informações do Evento */}
      <Grid container spacing={6}>
        <Grid item xs={12} md={12}>
          <SectionHeader variant="h6">Informações Básicas</SectionHeader>
          <TextField
            label="Nome do Evento"
            fullWidth
            required
            name="eventName"
            value={formData.eventName}
            onChange={handleInputChange}
            sx={{ marginBottom: "20px" }}
            autoComplete="off"
          />
          <TextField
            label="Categoria do Evento"
            fullWidth
            required
            name="eventCategory"
            value={formData.eventCategory}
            onChange={handleInputChange}
            sx={{ marginBottom: "20px" }}
            autoComplete="off"
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
                onChange={handleInputChange}
                sx={{ marginBottom: "20px" }}
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
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Descrição do Evento */}
        <Grid item xs={12}>
          <SectionHeader variant="h6">Descrição do Evento</SectionHeader>
          {isClient && (
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
          )}
        </Grid>

        {/* Anexos do Evento */}
        <Grid item xs={12}>
          <StyledCard>
            <SectionHeader variant="h6">Anexos do Evento</SectionHeader>
            
            <Box
              sx={{
              border: `2px`,
              padding: "20px",
              textAlign: "center",
              cursor: "pointer"
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files);
              handleFiles(files);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
              type="file"
              multiple
              hidden
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files) {
                const files = Array.from(e.target.files);
                handleFiles(files);
                }
              }}
              />
              <PhotoCamera sx={{ fontSize: 40, color: colors.primary }} />
              <Typography variant="body1" sx={{ mt: 2 }}>
              Arraste e solte seus arquivos aqui ou clique para selecionar
              </Typography>
            </Box>

            {/* Lista de Anexos */}
            {attachments.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  {attachments.map((file, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card
                        variant="outlined"
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          padding: "10px",
                          backgroundColor: colors.white,
                        }}
                      >
                        <Box sx={{ mr: 2 }}>
                          {/* Ícone baseado no tipo de arquivo */}
                          {file.type.includes("image") ? (
                            <PhotoCamera />
                          ) : (
                            <Typography variant="h6">📄</Typography>
                          )}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" noWrap>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {(file.size / 1024).toFixed(2)} KB
                          </Typography>
                        </Box>
                        <IconButton
                          aria-label="Remover Anexo"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          ✕
                        </IconButton>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </StyledCard>
        </Grid>
      </Grid>

      {/* Botão de Salvar */}
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <SaveButton
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={submitting}
        >
          {submitting ? (
            <CircularProgress size={24} sx={{ color: "#fff" }} />
          ) : (
            "Salvar"
          )}
        </SaveButton>
      </Box>

      {/* Modal para recorte de imagem */}
      <ImageCropperModal
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleBannerSave}
      />
    </Box>
  );
};

export default InformationCard;
