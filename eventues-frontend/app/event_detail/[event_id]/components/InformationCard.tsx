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
import axios from "axios";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import ImageCropperModal from "./ImageCropperModal"; // Certifique-se de que este caminho está correto

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
  event_category: string;
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
  event_description?: string;
  banner_image?: string; // URL do banner
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
  const [bannerS3Key, setBannerS3Key] = useState<string | null>(null); // Armazenamento separado do s3_key
  const [openModal, setOpenModal] = useState(false);
  const [isReplacingBanner, setIsReplacingBanner] = useState(false); // Novo estado para rastrear substituição
  const [estados, setEstados] = useState<Estado[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // Controle para renderização do Quill
  const [attachments, setAttachments] = useState<any[]>([]); // Ajuste o tipo conforme necessário

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para o Menu de Opções
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Estado para Snackbar de Notificações
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

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
  const convertToBase64 = (file: File): Promise<string> => {
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
  const uploadFile = async (file: File, title: string) => {
    try {
      // Converter arquivo para base64
      const base64 = await convertToBase64(file);
      const payload = {
        file: base64,
        title: title,
      };
      const response = await axios.post(
        `http://127.0.0.1:8000/organizer_detail/${event_id}/upload_document_file`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // Deve retornar { url: string, s3_key: string }
    } catch (error) {
      console.error("Erro ao fazer upload do arquivo:", error);
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
      const eventResponse = await axios.get<EventDetail>(
        `http://127.0.0.1:8000/organizer_detail/${event_id}`
      );
      const data = eventResponse.data;
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

      // Definir banner image se existir
      if (data.banner_image) {
        setBannerImage(`${data.banner_image}?t=${new Date().getTime()}`);
        setBannerS3Key(data.banner_image.split('/').pop() || null); // Extrai o s3_key
      } else {
        setBannerImage(null);
        setBannerS3Key(null);
      }

      // Buscar documentos do evento
      const filesResponse = await axios.get(
        `http://127.0.0.1:8000/organizer_detail/${event_id}/get_document_files`
      );
      const files = filesResponse.data as any[];

      // Identificar o banner (supondo que o banner tenha um título específico, ex: 'banner')
      const banner = files.find((file: any) => file.file_name.toLowerCase() === 'banner');
      if (banner) {
        setBannerImage(`${banner.url}?t=${new Date().getTime()}`);
        setBannerS3Key(banner.s3_key); // Armazena o s3_key do banner
      }

      // Definir anexos excluindo o banner
      const attachmentFiles = files.filter((file: any) => file.file_name.toLowerCase() !== 'banner');
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
      if (isReplacingBanner && bannerS3Key) {
        const payload = { s3_key: bannerS3Key };
        await axios.post(
          `http://127.0.0.1:8000/organizer_detail/${event_id}/delete_document_file`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        // Atualizar o estado após exclusão
        setBannerImage(null);
        setBannerS3Key(null);
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
      const uploadResult = await uploadFile(file, "banner") as { url: string, s3_key: string } | null;
      if (uploadResult) {
        // Adicionar um parâmetro de cache-busting para forçar o reload
        const updatedUrl = `${uploadResult.url}?t=${new Date().getTime()}`;
        setBannerImage(updatedUrl);
        setBannerS3Key(uploadResult.s3_key); // Armazenar o s3_key do banner
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
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Função para lidar com mudanças na descrição do evento
  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, eventDescription: value });
  };

  // Função para adicionar arquivos (anexos)
  const handleFiles = async (files: File[]) => {
    // Filtrar arquivos já anexados para evitar duplicatas
    const newFiles = files.filter(
      (file) => !attachments.some((att) => att.s3_key === `${event_id}/${file.name}`)
    );

    for (const file of newFiles) {
      const uploadResult = await uploadFile(file, file.name);
      if (uploadResult) {
        setAttachments((prev) => [...prev, uploadResult]);
        setSnackbar({
          open: true,
          message: `Arquivo ${file.name} enviado com sucesso!`,
          severity: "success",
        });
      }
    }
  };

  // Função para remover um anexo
  const deleteFile = async (s3_key: string) => {
    try {
      const payload = { s3_key };
      await axios.post(
        `http://127.0.0.1:8000/organizer_detail/${event_id}/delete_document_file`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // Remover do estado
      setAttachments((prev) => prev.filter((att) => att.s3_key !== s3_key));
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

  // Função para remover um anexo a partir do UI
  const handleRemoveAttachment = (s3_key: string) => {
    deleteFile(s3_key);
  };

  // Função para deletar o banner
  const handleDeleteBannerFunction = async () => {
    try {
      if (!bannerS3Key) return;

      const payload = { s3_key: bannerS3Key };
      await axios.post(
        `http://127.0.0.1:8000/organizer_detail/${event_id}/delete_document_file`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setBannerImage(null);
      setBannerS3Key(null);
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
    }
  };

  // Função para editar o banner (substituir)
  const handleEditBanner = () => {
    setIsReplacingBanner(true); // Definir a flag de substituição
    handleOpenModal();
    handleMenuClose();
  };

  // Função para deletar o banner via menu
  const handleDeleteBanner = async () => {
    await handleDeleteBannerFunction();
    handleMenuClose();
  };

  // Função para salvar os dados do evento
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

      // Opcional: Adicionar banner_image se estiver atualizado
      if (bannerImage && bannerS3Key) {
        formDataToSend.append("banner_image", bannerS3Key);
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
    fetchEventData();

    // Buscar estados
    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => setEstados(response.data as Estado[]))
      .catch(() =>
        setSnackbar({
          open: true,
          message: "Erro ao carregar estados.",
          severity: "error",
        })
      );

    setIsClient(true);
  }, [fetchEventData]);

  // Função para fechar o Snackbar
  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
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
                  {attachments.map((file, index) => (
                    <Grid item xs={12} sm={6} md={4} key={file.s3_key}>
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
                          {file.content_type.startsWith("image") ? (
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
                            {(file.size / 1024).toFixed(2)} KB
                          </Typography>
                        </Box>
                        <IconButton
                          aria-label="Remover Anexo"
                          onClick={() => handleRemoveAttachment(file.s3_key)}
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
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Alterado para topo central
        sx={{ mt: 2 }} // Adiciona margem superior
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
