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
} from "@mui/material";
import { UploadFile, Delete } from "@mui/icons-material";
import loadingGif from "../../assets/aquecendo.gif";

const colors = {
  primary: "#5A67D8", // Azul antes de anexar
  green: "#48BB78", // Verde após anexar
  grayDark: "#2D3748",
  grayLight: "#F7FAFC",
  white: "#FFFFFF",
};

interface FileData {
  id: string; // Identificação única para garantir conformidade
  name: string;
  file: File | null;
  base64: string;
  title: string;
  required: boolean; // Arquivos obrigatórios como Banner e Regulamento
  url?: string; // URL do arquivo já existente no S3
  s3_key?: string; // Chave do S3 para deletar o arquivo
}

const LoadingOverlay: React.FC = () => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(255,255,255,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <img src={loadingGif} alt="Carregando..." style={{ width: "150px" }} />
  </Box>
);

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

  // Função para buscar arquivos já enviados ao carregar o componente
  const fetchExistingFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://127.0.0.1:8000/organizer_detail/${eventId}/get_document_files`
      );
      if (response.ok) {
        const data = await response.json();

        // Mapeia os arquivos existentes
        const existingFiles: FileData[] = data.map((file: any) => ({
          id: `${file.s3_key}`, // IDs únicos
          name: file.file_name,
          file: null, // Como o arquivo já está no S3, não temos o arquivo local
          base64: "", // Não precisamos da base64 para arquivos já enviados
          title:
            file.title || file.file_name.split(".")[0].replace(/_/g, " "), // Usa o título do backend ou extrai do nome do arquivo
          required:
            file.file_name.includes("Banner") ||
            file.file_name.includes("Regulamento"), // Determina se o arquivo é obrigatório
          url: file.url, // URL do arquivo existente no S3
          s3_key: file.s3_key, // Chave do S3 para deletar o arquivo
        }));

        // Verifica se os arquivos obrigatórios estão presentes
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
      setLoading(false); // Desativar o estado de carregamento
    }
  };

  // Função para enviar o arquivo ao backend
  const uploadFileToBackend = async (fileData: FileData) => {
    try {
      setIsSubmitting(true); // Inicia o estado de submissão
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

      // Recarregar os arquivos existentes após o envio
      await fetchExistingFiles();
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      setErrors((prev) => [...prev, "Erro ao enviar arquivo."]);
    } finally {
      setIsSubmitting(false); // Finaliza o estado de submissão
    }
  };

  // Função para atualizar o título no backend
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

      // Recarregar os arquivos existentes após a atualização
      await fetchExistingFiles();
    } catch (error) {
      console.error("Erro ao atualizar título do documento:", error);
      setErrors((prev) => [...prev, "Erro ao atualizar título do documento."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lidar com o upload de arquivo para um documento específico
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
      const file = uploadedFiles[0]; // Apenas um arquivo é permitido por input

      if (file.type.includes("image") || file.type.includes("pdf")) {
        try {
          const base64 = await convertToBase64(file);

          // Encontrar o arquivo no estado
          const fileIndex = files.findIndex((f) => f.id === id);

          if (fileIndex !== -1) {
            const updatedFile = {
              ...files[fileIndex],
              name: file.name,
              file: file,
              base64: base64,
            };

            if (updatedFile.title) {
              // Enviar o arquivo e título ao backend
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

  // Excluir um anexo específico, mantendo o item na lista
  const handleFileDelete = async (id: string, s3_key?: string) => {
    setDeletingFileId(id); // Inicia o loading apenas para o arquivo em questão

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

        // Atualizar o estado localmente sem recarregar o componente
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
        setDeletingFileId(null); // Finaliza o loading do arquivo
      }
    } else {
      // Se não houver chave S3 (para arquivos ainda não enviados), apenas limpa localmente
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === id ? { ...f, name: "", file: null, base64: "" } : f
        )
      );
      setDeletingFileId(null); // Finaliza o loading do arquivo
    }
  };

  // Excluir o item inteiro
  const handleItemDelete = async (id: string, s3_key?: string) => {
    setDeletingFileId(id); // Inicia o loading para este item

    if (s3_key) {
      // O item tem um anexo no S3
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

        // Remover o item da lista localmente
        setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
      } catch (error) {
        console.error("Erro ao deletar item:", error);
      } finally {
        setDeletingFileId(null); // Finaliza o loading do item
      }
    } else {
      // O item não tem anexo no S3
      // Remover o item da lista diretamente
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
      setDeletingFileId(null); // Finaliza o loading do item
    }
  };

  // Adicionar um novo arquivo à lista
  const addNewFile = () => {
    const newId = `${Date.now()}`; // Usa timestamp para garantir IDs únicos
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
  };

  useEffect(() => {
    // Buscar arquivos existentes quando o componente for montado
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
            sx={{ marginBottom: "20px", color: colors.primary, fontWeight: "bold" }}
          >
            Gerenciamento de Materiais Visuais e Documentos
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título do Documento</TableCell>
                  <TableCell>Arquivo</TableCell>
                  <TableCell>Ação sobre Anexo</TableCell>
                  <TableCell>Excluir Item</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file, index) => (
                  <TableRow key={file.id}>
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
                              // Arquivo já foi enviado ao backend, atualizar o título
                              await updateFileTitleInBackend({
                                ...fileData,
                                title: newTitle,
                              });
                            } else if (fileData.base64 && fileData.file) {
                              // Arquivo selecionado mas não enviado ainda
                              const updatedFileData = {
                                ...fileData,
                                title: newTitle,
                              };
                              await uploadFileToBackend(updatedFileData);
                            }
                          }
                        }}
                        disabled={
                          // Desabilita o campo se for obrigatório ou se o arquivo já foi enviado
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
                            file.name || file.url ? colors.green : colors.primary,
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
                        <IconButton
                          aria-label="delete file"
                          size="small"
                          sx={{ color: colors.primary }}
                          onClick={() => handleFileDelete(file.id, file.s3_key)}
                          disabled={deletingFileId === file.id || isSubmitting}
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
                      )}
                    </TableCell>
                    <TableCell>
                      {!file.required && (
                        <IconButton
                          aria-label="delete item"
                          size="small"
                          sx={{ color: "red" }}
                          onClick={() => handleItemDelete(file.id, file.s3_key)}
                          disabled={deletingFileId === file.id || isSubmitting}
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
