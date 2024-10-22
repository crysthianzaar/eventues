import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Modal,
  CircularProgress,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import { Save, Cancel, ZoomIn, ZoomOut, PhotoCamera } from "@mui/icons-material";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css"; // Importando os estilos do Cropper
import { Cropper as ReactCropper, ReactCropperElement } from "react-cropper";

const colors = {
  primary: "#5A67D8",
  secondary: "#68D391",
  white: "#FFFFFF",
  grayLight: "#F7FAFC",
  grayDark: "#2D3748",
};

const ImageCropperModal = ({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (croppedImage: string) => Promise<void>;
}) => {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleZoomChange = (zoomType: "in" | "out") => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const zoomFactor = zoomType === "in" ? 0.1 : -0.1;
      cropper.zoom(zoomFactor);
    }
  };

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      return cropper.getCroppedCanvas().toDataURL();
    }
    return null;
  };

  const handleSave = async () => {
    const croppedImage = handleCrop();
    if (croppedImage) {
      setSubmitting(true);
      try {
        await onSave(croppedImage);
        onClose();
        setPreviewImage(null);
      } catch (error) {
        console.error("Erro ao salvar a imagem cortada:", error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleReset = () => {
    setPreviewImage(null);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: 320, sm: 500, md: 600 },
          bgcolor: colors.white,
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" color={colors.primary} mb={2}>
          Ajuste a imagem do seu banner
        </Typography>

        {/* Recorte de imagem */}
        {previewImage ? (
          <Cropper
            src={previewImage}
            style={{ height: 300, width: "100%" }}
            aspectRatio={16 / 5}
            guides={false}
            viewMode={1}
            dragMode="move"
            scalable={true}
            cropBoxMovable={false}
            cropBoxResizable={false}
            ref={cropperRef}
          />
        ) : (
          <Box
            onClick={() => document.getElementById("image-input")?.click()}
            sx={{
              height: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0f0f0",
              border: "1px dashed #ccc",
              cursor: "pointer",
              flexDirection: "column",
            }}
          >
            <PhotoCamera sx={{ fontSize: 40, color: colors.grayDark, mb: 1 }} />
            <Typography variant="body2" color={colors.grayDark}>
              Clique aqui para carregar uma imagem
            </Typography>
          </Box>
        )}

        {/* Controles de Zoom */}
        {previewImage && (
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            <IconButton
              onClick={() => handleZoomChange("out")}
              sx={{ color: colors.primary }}
            >
              <ZoomOut />
            </IconButton>
            <IconButton
              onClick={() => handleZoomChange("in")}
              sx={{ color: colors.primary }}
            >
              <ZoomIn />
            </IconButton>
          </Stack>
        )}

        {/* Botões de ação */}
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Cancel />}
            onClick={() => {
              onClose();
              setPreviewImage(null);
            }}
            sx={{ width: "48%" }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={submitting}
            sx={{ width: "48%", backgroundColor: colors.secondary }}
          >
            {submitting ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Salvar"
            )}
          </Button>
        </Box>

        {/* Input para seleção de imagem (oculto) */}
        {!previewImage && (
          <input
            id="image-input"
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        )}
      </Box>
    </Modal>
  );
};

export default ImageCropperModal;
