// src/components/AttachmentModal.tsx

import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Modal,
  CircularProgress,
  Typography,
  IconButton,
  TextField,
} from "@mui/material";
import { Save, Cancel, PhotoCamera } from "@mui/icons-material";

const colors = {
  primary: "#5A67D8",
  secondary: "#68D391",
  white: "#FFFFFF",
  grayLight: "#F7FAFC",
  grayDark: "#2D3748",
};

interface AttachmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, file: File) => Promise<void>;
  initialName?: string;
  initialFile?: File;
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({
  open,
  onClose,
  onSave,
  initialName = "",
  initialFile,
}) => {
  const [name, setName] = useState(initialName);
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert("Por favor, insira um nome para o anexo.");
      return;
    }
    if (!file) {
      alert("Por favor, selecione um arquivo.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave(name, file);
      onClose();
      setName("");
      setFile(null);
    } catch (error) {
      console.error("Erro ao salvar o anexo:", error);
      alert("Erro ao salvar o anexo. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
    setName("");
    setFile(null);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: 300, sm: 400 },
          bgcolor: colors.white,
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color={colors.primary} mb={2}>
          {initialName ? "Editar Anexo" : "Adicionar Anexo"}
        </Typography>

        <TextField
          label="Nome do Anexo"
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ marginBottom: "20px" }}
        />

        <Box
          component="label"
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            border: `1px dashed ${colors.primary}`,
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <PhotoCamera sx={{ color: colors.primary, mr: 2 }} />
          <Typography variant="body1">
            {file ? file.name : "Clique para selecionar um arquivo PDF"}
          </Typography>
          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={handleFileChange}
          />
        </Box>

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Cancel />}
            onClick={handleCancel}
            sx={{ marginRight: 2 }}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Salvar"
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AttachmentModal;
