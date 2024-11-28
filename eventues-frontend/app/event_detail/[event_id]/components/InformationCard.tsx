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
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Save, PhotoCamera, Add, Edit, Delete } from "@mui/icons-material";
import { styled } from "@mui/system";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import ImageCropperModal from "./ImageCropperModal";
import AttachmentModal from "./AttachmentModal"; // Importando o AttachmentModal
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
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  color: colors.primary,
  fontWeight: "bold",
  marginBottom: theme.spacing(2),
}));

// Estilização do SaveButton para ser flutuante
const SaveButton = styled(Fab)(({ theme }) => ({
  backgroundColor: colors.secondary,
  color: "#fff",
  position: "fixed",
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  zIndex: 1000,
  "&:hover": {
    backgroundColor: "#56c078",
  },
}));

// Estilização do Add Attachment Button
const AddAttachmentButton = styled(Fab)(({ theme }) => ({
  backgroundColor: colors.primary,
  color: "#fff",
  position: "fixed",
  bottom: theme.spacing(4),
  left: theme.spacing(4),
  zIndex: 1000,
  "&:hover": {
    backgroundColor: "#4c51bf",
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

// Interface para anexos com nome personalizado
interface Attachment extends DocumentData {
  name: string;
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
  const rawEventId = params.event_id;

  // Garantir que event_id seja uma string
  const event_id = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;

  // Estados
  const [formData, setFormData] = useState({
    eventName: "",
    eventCategory: "",
    startDate: "",
    endDate: "",
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
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para o Menu de Opções
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  // Estados para o Modal de Anexo
  const [openAttachmentModal, setOpenAttachmentModal] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<Attachment | null>(null);

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

  // Função para abrir o modal de anexo
  const handleOpenAttachmentModal = () => {
      setEditingAttachment(null); // Resetar qualquer edição anterior
      setOpenAttachmentModal(true);
  };
  
  // Função para editar o banner
  const handleEditBanner = () => {
      setIsReplacingBanner(true);
      handleOpenModal();
  };

  // Função para excluir o banner
  const handleDeleteBanner = async () => {
    try {
      if (firebaseBannerPath) {
        await deleteDocumentFile(event_id, firebaseBannerPath);
        setBannerImage(null);
        setFirebaseBannerPath(null);
        setSnackbar({
          open: true,
          message: "Banner excluído com sucesso!",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Erro ao excluir o banner:", error);
      setSnackbar({
        open: true,
        message: "Erro ao excluir o banner. Tente novamente.",
        severity: "error",
      });
    }
  };

  // Função para fechar o modal de anexo
  const handleCloseAttachmentModal = () => {
    setOpenAttachmentModal(false);
    setEditingAttachment(null);
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
        endDate: eventData.end_date.split("T")[0],
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

      // Definir anexos excluindo o banner e mapear para incluir o nome personalizado
      const attachmentFiles: Attachment[] = files
        .filter((file) => file.file_name.toLowerCase() !== "banner")
        .map((file) => ({
          ...file,
          name: file.file_name, // Usando o nome do arquivo como nome personalizado
        }));
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

  // Função para adicionar anexos com nome personalizado
  const handleAddAttachment = async (name: string, file: File) => {
    try {
      // Upload do arquivo via backend
      const uploadResult = await uploadFile(file, name);
      if (uploadResult) {
        // Criar o objeto Attachment
        const newAttachment: Attachment = {
          file_name: name, // Usando o nome personalizado
          firebase_path: uploadResult.firebase_path,
          url: uploadResult.url,
          content_type: file.type,
          size: file.size,
          name: name, // Nome personalizado
        };
        setAttachments((prev) => [...prev, newAttachment]);
        setSnackbar({
          open: true,
          message: `Anexo "${name}" enviado com sucesso!`,
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar anexo:", error);
      setSnackbar({
        open: true,
        message: "Erro ao adicionar o anexo. Tente novamente.",
        severity: "error",
      });
    }
  };

  // Função para editar um anexo
  const handleEditAttachment = async (attachment: Attachment, newName: string, newFile?: File) => {
    try {
      let updatedPath = attachment.firebase_path;
      let updatedUrl = attachment.url;
      if (newFile) {
        // Excluir o arquivo antigo
        await deleteDocumentFile(event_id, attachment.firebase_path);

        // Fazer upload do novo arquivo
        const uploadResult = await uploadFile(newFile, newName);
        if (uploadResult) {
          updatedPath = uploadResult.firebase_path;
          updatedUrl = `${uploadResult.url}?t=${new Date().getTime()}`;
        }
      } else if (newName !== attachment.name) {
        // Atualizar apenas o nome (dependendo de como o backend trata isso)
        // Se o backend permite renomear, você pode implementar essa lógica aqui
        // Caso contrário, talvez seja necessário re-uploadar o arquivo com o novo nome
        // Neste exemplo, assumiremos que renomear não altera o caminho no Firebase
      }

      // Atualizar o estado dos anexos
      setAttachments((prev) =>
        prev.map((att) =>
          att.firebase_path === attachment.firebase_path
            ? { ...att, name: newName, firebase_path: updatedPath, url: updatedUrl }
            : att
        )
      );

      setSnackbar({
        open: true,
        message: `Anexo "${newName}" atualizado com sucesso!`,
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao editar anexo:", error);
      setSnackbar({
        open: true,
        message: "Erro ao editar o anexo. Tente novamente.",
        severity: "error",
      });
    }
  };

  // Função para remover um anexo
  const handleRemoveAttachment = async (attachment: Attachment) => {
    try {
      await deleteDocumentFile(event_id, attachment.firebase_path);
      setAttachments((prev) =>
        prev.filter((att) => att.firebase_path !== attachment.firebase_path)
      );
      setSnackbar({
        open: true,
        message: `Anexo "${attachment.name}" removido com sucesso!`,
        severity: "success",
      });
    } catch (error) {
      console.error("Erro ao remover anexo:", error);
      setSnackbar({
        open: true,
        message: "Erro ao remover o anexo. Tente novamente.",
        severity: "error",
      });
    }
  };

  // Função para salvar os dados do evento
  const handleSave = async () => {
    setSubmitting(true);
    try {
      const dataToSend = {
        event_id: event_id,
        name: formData.eventName,
        event_category: formData.eventCategory,
        start_date: formData.startDate,
        end_date: formData.endDate,
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
      };

      await updateEventDetails(event_id, dataToSend);

      setSnackbar({
        open: true,
        message: "Evento salvo com sucesso!",
        severity: "success",
      });
      // onUpdate(); // Se você tiver uma prop onUpdate para atualizar os dados
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

    // Adicionando listeners de eventos passivos
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
            <SectionHeader variant="h6">Anexos do Evento</SectionHeader>

            {/* Botão para adicionar novo anexo */}
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenAttachmentModal}
                color="primary"
              >
                Adicionar Anexo
              </Button>
            </Box>

            {/* Tabela de Anexos */}
            {attachments.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome do Anexo</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attachments.map((attachment) => (
                      <TableRow key={attachment.firebase_path}>
                        <TableCell>{attachment.name}</TableCell>
                        <TableCell>
                          {(attachment.content_type ?? "").startsWith("image/")
                            ? "Imagem"
                            : "PDF"}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            aria-label="Editar Anexo"
                            onClick={() => {
                              setEditingAttachment(attachment);
                              setOpenAttachmentModal(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            aria-label="Excluir Anexo"
                            onClick={() => handleRemoveAttachment(attachment)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Nenhum anexo adicionado.
              </Typography>
            )}
        </Grid>
      </Grid>

      {/* Botão de Salvar Flutuante */}
      <SaveButton
        variant="extended"
        color="primary"
        onClick={handleSave}
      >
        {submitting ? (
          <CircularProgress size={24} sx={{ color: "#fff" }} />
        ) : (
          "Salvar Detalhes"
        )}
      </SaveButton>

      {/* Modal para recorte de imagem */}
      <ImageCropperModal
        open={openModal}
        onClose={handleCloseModal}
        onSave={handleBannerSave}
      />

      {/* Modal para adicionar/editar anexos */}
      <AttachmentModal
        open={openAttachmentModal}
        onClose={handleCloseAttachmentModal}
        onSave={
          editingAttachment
            ? async (name, file) => {
                await handleEditAttachment(editingAttachment, name, file);
              }
            : handleAddAttachment
        }
        initialName={editingAttachment?.name}
        initialFile={undefined} // Opcional: Implementar pré-visualização de arquivo se necessário
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
