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
} from "@mui/material";
import { UploadFile, Delete } from "@mui/icons-material";
import loadingGif from "../../assets/aquecendo.gif";
import LoadingOverlay from "../LoadingOverlay ";

const colors = {
  primary: "#5A67D8",
  green: "#48BB78",
  grayDark: "#2D3748",
  grayLight: "#F7FAFC",
  white: "#FFFFFF",
};

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

const BannerDocumentCard: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const isFormValid = () => {
    const newErrors: string[] = [];

    files.forEach((file) => {
      if (file.required && !file.url && !file.base64) {
        newErrors.push(`O arquivo "${file.title}" é obrigatório.`);
      }
      if (!file.title) {
        newErrors.push(`O título do documento é obrigatório.`);
      }
    });

    setErrors(newErrors);
  };

  const fetchExistingFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://127.0.0.1:8000/organizer_detail/${eventId}/get_document_files`
      );
      if (response.ok) {
        const data = await response.json();

        const existingFiles: FileData[] = data.map((file: any) => ({
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

        const mandatoryTitles = ["Banner do Evento", "Regulamento"];

        mandatoryTitles.forEach((mandatoryTitle) => {
          const exists = existingFiles.some(
            (file) => file.title === mandatoryTitle
          );
          if (!exists) {
            existingFiles.push({
              id: `mandatory-${mandatoryTitle}`,
              name: "",
              file: null,
              base64: "",
              title: mandatoryTitle,
              required: true,
            });
          }
        });

        setFiles(existingFiles);
      } else {
        console.error("Falha ao buscar arquivos existentes");
      }
    } catch (error) {
      console.error("Erro ao buscar arquivos existentes:", error);
    } finally {
      setLoading(false); 
      isFormValid();
    }
  };

  const uploadFileToBackend = async (fileData: FileData) => {
    try {
      setIsSubmitting(true);
      const data = {
        file: fileData.base64,
        title: fileData.title,
      };

      const response = await fetch(
        `http://127.0.0.1:8000/organizer_detail/${eventId}/upload_document_file`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao enviar arquivo");
      }

      const result = await response.json();

      await fetchExistingFiles();
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      setErrors((prev) => [...prev, "Erro ao enviar arquivo."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFileTitleInBackend = async (fileData: FileData) => {
    try {
      setIsSubmitting(true);
      const data = {
        s3_key: fileData.s3_key,
        title: fileData.title,
      };

      const response = await fetch(
        `http://127.0.0.1:8000/organizer_detail/${eventId}/update_document_title`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao atualizar título do documento");
      }

      await fetchExistingFiles();
    } catch (error) {
      console.error("Erro ao atualizar título do documento:", error);
      setErrors((prev) => [...prev, "Erro ao atualizar título do documento."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
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
              base64: base64,
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

  const handleFileDelete = async (id: string, s3_key?: string) => {
    setDeletingFileId(id);

    if (s3_key) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/organizer_detail/${eventId}/delete_document_file`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ s3_key }),
          }
        );

        if (!response.ok) {
          throw new Error("Falha ao deletar arquivo no backend");
        }

        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === id
              ? {
                  ...file,
                  url: undefined,
                  s3_key: undefined,
                  base64: "",
                  name: "",
                  file: null,
                }
              : file
          )
        );
      } catch (error) {
        console.error("Erro ao deletar arquivo:", error);
      } finally {
        setDeletingFileId(null);
        isFormValid();
      }
    } else {
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === id ? { ...f, name: "", file: null, base64: "" } : f
        )
      );
      setDeletingFileId(null);
      isFormValid();
    }
  };

  const handleItemDelete = async (id: string, s3_key?: string) => {
    setDeletingFileId(id);

    if (s3_key) {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/organizer_detail/${eventId}/delete_document_file`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ s3_key }),
          }
        );

        if (!response.ok) {
          throw new Error("Falha ao deletar arquivo no backend");
        }
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
      } catch (error) {
        console.error("Erro ao deletar item:", error);
      } finally {
        setDeletingFileId(null); 
        isFormValid();
      }
    } else {
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
      setDeletingFileId(null);
      isFormValid();
    }
  };

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
    isFormValid();
  };

  useEffect(() => {
    fetchExistingFiles();
  }, [eventId]);

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

          <TableContainer component={Paper} elevation={3}>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: colors.primary,
                  }}
                >
                  <TableCell sx={{ color: colors.white, fontWeight: "bold" }}>
                    Título do Documento
                  </TableCell>
                  <TableCell sx={{ color: colors.white, fontWeight: "bold" }}>
                    Arquivo
                  </TableCell>
                  <TableCell sx={{ color: colors.white, fontWeight: "bold" }}>
                    Ação sobre Anexo
                  </TableCell>
                  <TableCell sx={{ color: colors.white, fontWeight: "bold" }}>
                    Excluir Item
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file, index) => (
                  <TableRow
                    key={file.id}
                    sx={{
                      backgroundColor:
                        index % 2 === 0 ? colors.grayLight : colors.white,
                    }}
                  >
                    <TableCell>
                      <TextField
                        label="Título do Documento"
                        fullWidth
                        required={file.required}
                        value={file.title}
                        onChange={async (e) => {
                          const newTitle = e.target.value;
                          setFiles((prevFiles) =>
                            prevFiles.map((f, i) =>
                              i === index ? { ...f, title: newTitle } : f
                            )
                          );

                          const fileData = files[index];

                          if (fileData) {
                            if (fileData.url && fileData.s3_key) {
                              await updateFileTitleInBackend({
                                ...fileData,
                                title: newTitle,
                              });
                            } else if (fileData.base64 && fileData.file) {
                              const updatedFileData = {
                                ...fileData,
                                title: newTitle,
                              };
                              await uploadFileToBackend(updatedFileData);
                            }
                          }
                          isFormValid();
                        }}
                        disabled={
                          file.required ||
                          (file.url && !file.base64) ||
                          deletingFileId === file.id ||
                          isSubmitting
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        component="label"
                        disabled={deletingFileId === file.id || isSubmitting}
                        sx={{
                          backgroundColor:
                            file.name || file.url
                              ? colors.green
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
                    </TableCell>
                    <TableCell>
                      {(file.name || file.url) && (
                        <Tooltip title="Excluir Anexo">
                          <IconButton
                            aria-label="delete file"
                            size="small"
                            sx={{ color: colors.primary }}
                            onClick={() =>
                              handleFileDelete(file.id, file.s3_key)
                            }
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
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                      {!file.required && (
                        <Tooltip title="Excluir Item">
                          <IconButton
                            aria-label="delete item"
                            size="small"
                            sx={{ color: "red" }}
                            onClick={() =>
                              handleItemDelete(file.id, file.s3_key)
                            }
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
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {errors.length > 0 && (
            <Box sx={{ color: "red", marginTop: "20px" }}>
              {errors.map((error, index) => (
                <Typography key={index} variant="body2">
                  {error}
                </Typography>
              ))}
            </Box>
          )}

          <Button
            variant="outlined"
            onClick={addNewFile}
            disabled={deletingFileId !== null || isSubmitting}
            sx={{
              marginTop: "20px",
              color: colors.primary,
              borderColor: colors.primary,
              "&:hover": {
                backgroundColor: colors.grayLight,
                borderColor: colors.primary,
              },
            }}
          >
            Adicionar Novo Documento
          </Button>
        </>
      )}
    </Box>
  );
};

export default BannerDocumentCard;
