// src/components/InformationCard.tsx

"use client";

import React, { useState, useRef, useEffect, MouseEvent, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  Button,
  CircularProgress,
  Card,
  IconButton,
  MenuItem,
  Snackbar,
  Alert,
  Menu,
} from "@mui/material";
import { Save, PhotoCamera } from "@mui/icons-material";
import { styled } from "@mui/system";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import ImageCropperModal from "./ImageCropperModal";
import {
  uploadDocumentFile,
  deleteDocumentFile,
  getEventDetails,
  getEventDocuments,
  updateEventDetails,
  UploadResponse,
  DocumentData,
} from "../apis/api";

// Carregamento dinâmico do ReactQuill
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

// Definição de cores
const colors = {
  primary: "#5A67D8",
  secondary: "#68D391",
  white: "#FFFFFF",
};

// Estilização dos componentes
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
const quillModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    [{ color: [] }],
    ["link", "image"],
  ],
};

const quillFormats = [
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

// Interface para estados
interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

// Template inicial para descrição
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
  const rawEventId = params.event_id;

  // Garantir que event_id seja uma string
  const event_id = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;

  // Estados
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
  const [firebaseBannerPath, setFirebaseBannerPath] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [isReplacingBanner, setIsReplacingBanner] = useState(false);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });
  const [attachments, setAttachments] = useState<DocumentData[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para o Menu de Opções
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Funções para abrir e fechar o Menu
  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Função para abrir o modal de corte de imagem
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Função para fechar o modal de corte de imagem
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Função para converter arquivo para base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject("Erro ao converter arquivo para base64.");
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // Função para fazer upload de arquivos (banner ou anexos)
  const uploadFile = async (file: File, title: string): Promise<UploadResponse | null> => {
    try {
      // Converter arquivo para base64
      const base64 = await convertFileToBase64(file);
      const uploadResult = await uploadDocumentFile(event_id, base64, title);
      return uploadResult;
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erro ao fazer upload do arquivo.",
        severity: "error",
      });
      return null;
    }
  };

  // Função para buscar dados do evento
  const fetchEventData = useCallback(async () => {
    if (!event_id) return;
    try {
      setLoading(true);
      // Buscar detalhes do evento
      const eventData = await getEventDetails(event_id);
      setFormData({
        eventName: eventData.name,
        eventCategory: eventData.event_category,
        startDate: eventData.start_date.split("T")[0],
        startTime: eventData.start_time,
        endDate: eventData.end_date.split("T")[0],
        endTime: eventData.end_time,
        state: eventData.state,
        city: eventData.city,
        address: eventData.address,
        addressComplement: eventData.address_complement,
        addressDetail: eventData.address_detail,
        organizationName: eventData.organization_name,
        organizationContact: eventData.organization_contact,
        eventType: eventData.event_type,
        eventStatus: eventData.event_status,
        eventDescription: eventData.event_description || initialDescriptionTemplate,
      });

      // Definir banner image se existir
      if (eventData.banner_image) {
        setBannerImage(`${eventData.banner_image}?t=${new Date().getTime()}`);
        setFirebaseBannerPath(eventData.banner_image);
      } else {
        setBannerImage(null);
        setFirebaseBannerPath(null);
      }

      // Buscar documentos do evento
      const files = await getEventDocuments(event_id);
      const banner = files.find(
        (file) => file.file_name.toLowerCase() === "banner"
      );
      if (banner) {
        setBannerImage(`${banner.url}?t=${new Date().getTime()}`);
        setFirebaseBannerPath(banner.firebase_path);
      }

      // Definir anexos excluindo o banner
      const attachmentFiles = files.filter(
        (file) => file.file_name.toLowerCase() !== "banner"
      );
      setAttachments(attachmentFiles);
    } catch (err) {
      console.error("Erro ao carregar dados do evento:", err);
      setSnackbar({
        open: true,
        message: "Erro ao carregar detalhes do evento.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [event_id]);

  // Função para salvar o banner após o corte
  const handleBannerSave = async (croppedImage: string) => {
    try {
      if (!croppedImage) {
        setSnackbar({
          open: true,
          message: "Nenhuma imagem foi cortada.",
          severity: "error",
        });
        return;
      }

      // Se estamos substituindo o banner, exclua o atual antes de fazer o upload
      if (isReplacingBanner && firebaseBannerPath) {
        await deleteDocumentFile(event_id, firebaseBannerPath);
        setBannerImage(null);
        setFirebaseBannerPath(null);
        setIsReplacingBanner(false);
        setSnackbar({
          open: true,
          message: "Banner antigo excluído com sucesso!",
          severity: "success",
        });
      }

      // Converter base64 para arquivo
      const blob = await (await fetch(croppedImage)).blob();
      const file = new File([blob], "banner.png", { type: blob.type });

      // Fazer upload do banner
      const uploadResult = await uploadFile(file, "banner");
      if (uploadResult) {
        // Adicionar um parâmetro de cache-busting para forçar o reload
        const updatedUrl = `${uploadResult.url}?t=${new Date().getTime()}`;
        setBannerImage(updatedUrl);
        setFirebaseBannerPath(uploadResult.firebase_path);
        setSnackbar({
          open: true,
          message: "Banner atualizado com sucesso!",
          severity: "success",
        });

        // Re-fetchar os dados do evento para garantir que o estado está atualizado
        await fetchEventData();
      }
    } catch (error) {
      console.error("Erro ao salvar o banner:", error);
      setSnackbar({
        open: true,
        message: "Erro ao salvar o banner. Tente novamente.",
        severity: "error",
      });
    }
  };

  // Função para lidar com mudanças nos campos de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para lidar com mudanças na descrição do evento
  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, eventDescription: value }));
  };

  // Função para adicionar arquivos (anexos)
  const handleFiles = async (files: File[]) => {
    const newFiles = files.filter(
      (file) =>
        !attachments.some(
          (att) => att.firebase_path === `events/${event_id}/${file.name}`
        )
    );

    for (const file of newFiles) {
      const uploadResult = await uploadFile(file, file.name);
      if (uploadResult) {
        // **Correção Principal**: Criar um objeto DocumentData a partir de UploadResponse e File
        const document: DocumentData = {
          file_name: file.name,
          firebase_path: uploadResult.firebase_path,
          url: uploadResult.url,
          content_type: file.type,
          size: file.size,
        };
        setAttachments((prev) => [...prev, document]); // Agora, estamos adicionando DocumentData
        setSnackbar({
          open: true,
          message: `Arquivo ${file.name} enviado com sucesso!`,
          severity: "success",
        });
      }
    }
  };

  // Função para remover um anexo
  const deleteAttachment = async (firebasePath: string) => {
    try {
      await deleteDocumentFile(event_id, firebasePath);
      setAttachments((prev) =>
        prev.filter((att) => att.firebase_path !== firebasePath)
      );
      setSnackbar({
        open: true,
        message: "Anexo removido com sucesso!",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao remover o anexo:", error);
      setSnackbar({
        open: true,
        message: "Erro ao remover o anexo. Tente novamente.",
        severity: "error",
      });
    }
  };

  // Função para deletar o banner
  const handleDeleteBanner = async () => {
    try {
      if (!firebaseBannerPath) return;

      await deleteDocumentFile(event_id, firebaseBannerPath);

      setBannerImage(null);
      setFirebaseBannerPath(null);
      setSnackbar({
        open: true,
        message: "Banner excluído com sucesso!",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao excluir o banner:", error);
      setSnackbar({
        open: true,
        message: "Erro ao excluir o banner. Tente novamente.",
        severity: "error",
      });
    } finally {
      handleMenuClose();
    }
  };

  // Função para editar o banner (substituir)
  const handleEditBanner = () => {
    setIsReplacingBanner(true);
    handleOpenModal();
    handleMenuClose();
  };

  // Função para salvar os dados do evento
  const handleSave = async () => {
    setSubmitting(true);
    try {
      const dataToSend = {
        name: formData.eventName,
        event_category: formData.eventCategory,
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
        banner_image: firebaseBannerPath || undefined,
      };

      await updateEventDetails(event_id, dataToSend);

      setSnackbar({
        open: true,
        message: "Evento salvo com sucesso!",
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao salvar o evento:", error);
      setSnackbar({
        open: true,
        message: "Erro ao salvar o evento. Tente novamente.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // useEffect para buscar dados do evento e estados
  useEffect(() => {
    const fetchEstados = async () => {
      try {
        const response = await fetch(
          "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
        );
        const data = await response.json();
        setEstados(data);
      } catch (error) {
        console.error("Erro ao carregar estados:", error);
        setSnackbar({
          open: true,
          message: "Erro ao carregar estados.",
          severity: "error",
        });
      }
    };

    fetchEventData();
    fetchEstados();

    // Adding passive event listeners
    window.addEventListener('scroll', () => {}, { passive: true });
    window.addEventListener('touchstart', () => {}, { passive: true });

    return () => {
      window.removeEventListener('scroll', () => {});
      window.removeEventListener('touchstart', () => {});
    };
  }, [fetchEventData]);

  // Função para fechar o Snackbar
  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Renderização Condicional
  if (loading) {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress color="primary" />
        <Typography variant="h6" color={colors.primary} mt={2}>
          Carregando...
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
                onClick={handleMenuClick}
                sx={{ alignSelf: "center" }}
              >
                Editar Imagem
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
              >
                <MenuItem onClick={handleEditBanner}>Substituir Imagem</MenuItem>
                <MenuItem onClick={handleDeleteBanner}>Excluir Imagem</MenuItem>
              </Menu>
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
          <ReactQuill
            value={formData.eventDescription}
            onChange={handleDescriptionChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder="Adicione aqui as informações do seu evento..."
            style={{
              backgroundColor: colors.white,
              borderRadius: "8px",
              height: "300px",
              marginBottom: "30px",
            }}
          />
        </Grid>

        {/* Anexos do Evento */}
        <Grid item xs={12}>
          <StyledCard>
            <SectionHeader variant="h6">Anexos do Evento</SectionHeader>

            <Box
              sx={{
                border: `2px dashed ${colors.primary}`,
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
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
                  {attachments.map((file) => (
                    <Grid item xs={12} sm={6} md={4} key={file.firebase_path}>
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
                          {file.content_type?.startsWith("image") ? (
                            <PhotoCamera />
                          ) : (
                            <Typography variant="h6">📄</Typography>
                          )}
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" noWrap>
                            {file.file_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {file.size ? `${(file.size / 1024).toFixed(2)} KB` : ""}
                          </Typography>
                        </Box>
                        <IconButton
                          aria-label="Remover Anexo"
                          onClick={() => deleteAttachment(file.firebase_path)}
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

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ mt: 2 }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InformationCard;
