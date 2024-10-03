// src/components/BannerDocumentCard.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Snackbar,
  Alert,
  AlertColor,
} from "@mui/material";
import { UploadFile, Delete, Add, Download } from "@mui/icons-material";
import { styled } from "@mui/system";
import loadingGif from "../../assets/aquecendo.gif";
import bannerTemplate from "../../assets/banner.jpg";
import regulamentoTemplate from "../../assets/Regulamento do Evento.pdf";
import LoadingOverlay from "../LoadingOverlay";
import axios from "axios";

// Define a paleta de cores
const colors = {
  primary: "#5A67D8",           // Azul
  secondary: "#68BB78",         // Verde
  lightBlue: "#63B3ED",         // Azul Claro
  grayLight: "#EDF2F7",
  grayDark: "#2D3748",
  white: "#FFFFFF",
  red: "#E53E3E",
  tableHeaderBg: "#E2E8F0",
  rowOddBg: "#F9FAFB",          // Cor de fundo para linhas ímpares
  rowEvenBg: "#FFFFFF",         // Cor de fundo para linhas pares
  template: "#F6AD55",          // Laranja para botões de template
};

// Componentes Estilizados
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  backgroundColor: colors.white,
}));

const StyledTableHeadCell = styled(TableCell)(() => ({
  backgroundColor: colors.tableHeaderBg,
  color: colors.primary,
  fontWeight: "bold",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  color: colors.grayDark,
}));

const AddButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.lightBlue,
  color: "#fff",
  "&:hover": {
    backgroundColor: "#4299e1", // Azul mais escuro
  },
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.secondary,
  color: "#fff",
  "&:hover": {
    backgroundColor: "#56c078", // Verde mais escuro
  },
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  color: colors.red,
}));

const TemplateDownloadButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.primary,
  color: "#fff",
  "&:hover": {
    backgroundColor: "#dd6b20", // Laranja mais escuro
  },
  marginRight: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    width: "100%",
    marginBottom: theme.spacing(2),
  },
}));

interface BannerDocumentCardProps {
  eventId: string;
  onNotify: (message: string, severity: AlertColor) => void;
  onUpdate: () => void;
}

const BannerDocumentCard: React.FC<BannerDocumentCardProps> = ({ eventId, onNotify, onUpdate }) => {
  interface FileData {
    id: string;
    name: string;
    file: File | null;
    base64: string;
    title: string;
    required: boolean;
    url?: string;
    s3_key?: string;
  }
  
  const [files, setFiles] = useState<FileData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success");

  // Função para converter arquivo para base64
  const convertToBase64 = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Função para validar o formulário
  const validateForm = () => {
    const newErrors: string[] = [];

    files.forEach((file) => {
      if (!file.title) {
        newErrors.push(`O título do documento é obrigatório.`);
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Função para buscar arquivos existentes
  const fetchExistingFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ s3_key: string; file_name: string; title?: string; url?: string; }[]>(
        `http://127.0.0.1:8000/organizer_detail/${eventId}/get_document_files`
      );

      let existingFiles: FileData[] = [];

      if (response.status === 200) {
        const data = response.data;

        if (data.length > 0) {
          existingFiles = data.map((file) => ({
            id: `${file.s3_key}`,
            name: file.file_name,
            file: null,
            base64: "",
            title: file.title || file.file_name.split(".")[0].replace(/_/g, " "),
            required:
              file.file_name.includes("Banner") ||
              file.file_name.includes("Regulamento"),
            url: file.url,
            s3_key: file.s3_key,
          }));
        } else {
          // Adiciona os arquivos padrão se a resposta for vazia
          const mandatoryTitles = ["Banner do Evento", "Regulamento"];
          existingFiles = mandatoryTitles.map((title) => ({
            id: `mandatory-${title}`,
            name: "",
            file: null,
            base64: "",
            title: title,
            required: true,
          }));
        }
      } else {
        console.error("Falha ao buscar arquivos existentes");
      }

      // Garante que os arquivos obrigatórios estejam presentes
      const mandatoryTitles = ["Banner do Evento", "Regulamento"];
      mandatoryTitles.forEach((title) => {
        const exists = existingFiles.some((file) => file.title === title);
        if (!exists) {
          existingFiles.push({
            id: `mandatory-${title}`,
            name: "",
            file: null,
            base64: "",
            title: title,
            required: true,
          });
        }
      });

      setFiles(existingFiles);
    } catch (error) {
      console.error("Erro ao buscar arquivos existentes:", error);
      setErrors((prev) => [...prev, "Erro ao buscar arquivos existentes."]);
    } finally {
      setLoading(false);
      validateForm();
    }
  };

  useEffect(() => {
    fetchExistingFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Função para enviar arquivo ao backend
  const uploadFileToBackend = async (fileData: FileData) => {
    try {
      setIsSubmitting(true);
      const data = {
        file: fileData.base64,
        title: fileData.title,
      };

      const response = await axios.post(
        `http://127.0.0.1:8000/organizer_detail/${eventId}/upload_document_file`,
        data
      );

      if (response.status === 200) {
        onNotify("Arquivo enviado com sucesso!", "success");
        onUpdate();
        await fetchExistingFiles();
      } else {
        throw new Error("Falha ao enviar arquivo");
      }
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      setErrors((prev) => [...prev, "Erro ao enviar arquivo."]);
      setSnackbarMessage("Erro ao enviar arquivo.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para atualizar título no backend
  const updateFileTitleInBackend = async (fileData: FileData) => {
    try {
      setIsSubmitting(true);
      const data = {
        s3_key: fileData.s3_key,
        title: fileData.title,
      };

      const response = await axios.post(
        `http://127.0.0.1:8000/organizer_detail/${eventId}/update_document_title`,
        data
      );

      if (response.status === 200) {
        setSnackbarMessage("Título do documento atualizado com sucesso!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        await fetchExistingFiles();
      } else {
        throw new Error("Falha ao atualizar título do documento");
      }
    } catch (error) {
      console.error("Erro ao atualizar título do documento:", error);
      setErrors((prev) => [...prev, "Erro ao atualizar título do documento."]);
      setSnackbarMessage("Erro ao atualizar título do documento.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para lidar com upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles && uploadedFiles.length > 0) {
      const file = uploadedFiles[0];

      if (file.type.includes("image") || file.type.includes("pdf")) {
        try {
          const base64 = await convertToBase64(file);
          const fileIndex = files.findIndex((f) => f.id === id);

          if (fileIndex !== -1) {
            const updatedFile = {
              ...files[fileIndex],
              name: file.name,
              file: file,
              base64: base64 as string,
            };

            if (updatedFile.title) {
              await uploadFileToBackend(updatedFile);
            } else {
              setErrors((prev) => [
                ...prev,
                `Por favor, preencha o título antes de fazer o upload do arquivo.`,
              ]);
            }
          }
        } catch (error) {
          setErrors((prev) => [
            ...prev,
            `Erro ao converter ${file.name} para base64.`,
          ]);
        }
      } else {
        setErrors((prev) => [
          ...prev,
          `${file.name} não é uma imagem ou PDF válido.`,
        ]);
      }
    }
  };

  // Função para deletar arquivo no backend
  const handleFileDelete = async (id: string, s3_key?: string) => {
    setDeletingFileId(id);

    if (s3_key) {
      try {
        const response = await axios.post(
          `http://127.0.0.1:8000/organizer_detail/${eventId}/delete_document_file`,
          { s3_key }
        );

        if (response.status === 200) {
          setSnackbarMessage("Arquivo deletado com sucesso!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          await fetchExistingFiles();
        } else {
          throw new Error("Falha ao deletar arquivo no backend");
        }
      } catch (error) {
        console.error("Erro ao deletar arquivo:", error);
        setErrors((prev) => [...prev, "Erro ao deletar arquivo."]);
        setSnackbarMessage("Erro ao deletar arquivo.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setDeletingFileId(null);
        validateForm();
      }
    } else {
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === id ? { ...f, name: "", file: null, base64: "" } : f
        )
      );
      setDeletingFileId(null);
      validateForm();
    }
  };

  // Função para deletar item (não obrigatório)
  const handleItemDelete = async (id: string, s3_key?: string) => {
    setDeletingFileId(id);

    if (s3_key) {
      try {
        const response = await axios.post(
          `http://127.0.0.1:8000/organizer_detail/${eventId}/delete_document_file`,
          { s3_key }
        );

        if (response.status === 200) {
          setSnackbarMessage("Item deletado com sucesso!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          await fetchExistingFiles();
        } else {
          throw new Error("Falha ao deletar item no backend");
        }
      } catch (error) {
        console.error("Erro ao deletar item:", error);
        setErrors((prev) => [...prev, "Erro ao deletar item."]);
        setSnackbarMessage("Erro ao deletar item.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setDeletingFileId(null);
        validateForm();
      }
    } else {
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
      setDeletingFileId(null);
      validateForm();
    }
  };

  // Função para adicionar novo documento
  const addNewFile = () => {
    const newId = `${Date.now()}`;
    setFiles([
      ...files,
      {
        id: newId,
        name: "",
        file: null,
        base64: "",
        title: "",
        required: false,
      },
    ]);
    validateForm();
  };

  return (
    <Box
      sx={{
        padding: { xs: "20px", md: "40px" },
        maxWidth: { xs: "100%", md: "1400px" },
        margin: "0 auto",
        position: "relative",
      }}
    >
      {(loading || isSubmitting) && <LoadingOverlay />}

      {!loading && (
        <>
          <Typography
            variant="h6"
            sx={{
              marginBottom: "20px",
              color: colors.primary,
              fontWeight: "bold",
            }}
          >
            Gerenciamento de Materiais Visuais e Documentos
          </Typography>

          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>Título do Documento</StyledTableHeadCell>
                  <StyledTableHeadCell>Arquivo</StyledTableHeadCell>
                  <StyledTableHeadCell>Ação sobre Anexo</StyledTableHeadCell>
                  <StyledTableHeadCell>Excluir Item</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file, index) => (
                  <TableRow
                    key={file.id}
                    sx={{
                      backgroundColor:
                        index % 2 === 0 ? colors.rowEvenBg : colors.rowOddBg,
                    }}
                  >
                    <StyledTableCell>
                      <TextField
                        label="Título do Documento"
                        fullWidth
                        required={file.required}
                        value={file.title}
                        onChange={async (e) => {
                          const newTitle = e.target.value;
                          setFiles((prevFiles) =>
                            prevFiles.map((f) =>
                              f.id === file.id ? { ...f, title: newTitle } : f
                            )
                          );

                          if (file.url && file.s3_key) {
                            await updateFileTitleInBackend({
                              ...file,
                              title: newTitle,
                            });
                          } else if (file.base64 && file.file) {
                            const updatedFileData = {
                              ...file,
                              title: newTitle,
                            };
                            await uploadFileToBackend(updatedFileData);
                          }
                          validateForm();
                        }}
                        disabled={
                          file.required ||
                          (file.url && !file.base64) ||
                          deletingFileId === file.id ||
                          isSubmitting
                        }
                        autoComplete="new-document-title"
                        error={!!errors.find((error) => error.includes("Título do documento"))}
                        helperText={errors.find((error) => error.includes("Título do documento"))}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <Button
                        variant="contained"
                        component="label"
                        disabled={deletingFileId === file.id || isSubmitting}
                        sx={{
                          backgroundColor:
                            file.name || file.url
                              ? colors.secondary
                              : colors.primary,
                          color: colors.white,
                          "&:hover": {
                            backgroundColor:
                              file.name || file.url ? "#38A169" : "#4c6ef5",
                          },
                        }}
                      >
                        <UploadFile sx={{ marginRight: "8px" }} />
                        {file.url ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "white", textDecoration: "none" }}
                          >
                            {file.name}
                          </a>
                        ) : (
                          file.name || "Anexar"
                        )}
                        <input
                          type="file"
                          hidden
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e, file.id)}
                        />
                      </Button>
                    </StyledTableCell>
                    <StyledTableCell>
                      {(file.name || file.url) && (
                        <Tooltip title="Excluir Anexo">
                          <DeleteButton
                            aria-label="delete file"
                            onClick={() => handleFileDelete(file.id, file.s3_key)}
                            disabled={
                              deletingFileId === file.id || isSubmitting
                            }
                          >
                            {deletingFileId === file.id ? (
                              <img
                                src={loadingGif}
                                alt="Excluindo..."
                                style={{ width: "24px" }}
                              />
                            ) : (
                              <Delete />
                            )}
                          </DeleteButton>
                        </Tooltip>
                      )}
                    </StyledTableCell>
                    <StyledTableCell>
                      {!file.required && (
                        <Tooltip title="Excluir Item">
                          <DeleteButton
                            aria-label="delete item"
                            onClick={() => handleItemDelete(file.id, file.s3_key)}
                            disabled={
                              deletingFileId === file.id || isSubmitting
                            }
                          >
                            {deletingFileId === file.id ? (
                              <img
                                src={loadingGif}
                                alt="Excluindo..."
                                style={{ width: "24px" }}
                              />
                            ) : (
                              <Delete />
                            )}
                          </DeleteButton>
                        </Tooltip>
                      )}
                    </StyledTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>

          {/* Contêiner para Botões de Download e Adicionar Novo Documento */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "flex-start",
              alignItems: "center",
              marginTop: "20px",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <AddButton
              variant="contained"
              startIcon={<Add />}
              onClick={addNewFile}
              disabled={isSubmitting}
            >
              Adicionar Novo Documento
            </AddButton>
            <TemplateDownloadButton variant="contained" startIcon={<Download />}>
              <a
                href={bannerTemplate}
                target="_blank"
                rel="noopener noreferrer"
                download="banner.jpg"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Baixar Template de Banner
              </a>
            </TemplateDownloadButton>
            <TemplateDownloadButton variant="contained" startIcon={<Download />}>
              <a
                href={regulamentoTemplate}
                target="_blank"
                rel="noopener noreferrer"
                download="Regulamento do Evento.pdf"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Baixar Template de Regulamento
              </a>
            </TemplateDownloadButton>
          </Box>

          {errors.length > 0 && (
            <Box sx={{ color: "red", marginTop: "20px" }}>
              {errors.map((error, index) => (
                <Typography key={index} variant="body2">
                  {error}
                </Typography>
              ))}
            </Box>
          )}

          {/* Snackbar para Feedback */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarSeverity}
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default BannerDocumentCard;
