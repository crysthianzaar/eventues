"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { CameraAlt, Close } from "@mui/icons-material";
import dynamic from "next/dynamic";

// Importação dinâmica do scanner para evitar problemas SSR
const QrScanner = dynamic(() => import("react-qr-scanner"), {
  ssr: false,
});

interface QRCodeScannerProps {
  eventId: string;
  onScanSuccess: (participant: any) => void;
  onScanError: (error: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  eventId,
  onScanSuccess,
  onScanError,
}) => {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "info" | "warning",
  });

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  // Obter ID do usuário atual do localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem("user_id") : null;

  const handleOpen = () => {
    setOpen(true);
    setScanning(true);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setScanning(false);
    setProcessing(false);
  };

  const handleScan = async (data: any) => {
    if (data && data.text && scanning && !processing) {
      try {
        setProcessing(true);
        setScanning(false);
        
        // O QR code deve conter apenas o UUID do ingresso
        const qrCodeUuid = data.text;
        
        if (!userId) {
          setError("Você precisa estar logado para fazer check-in");
          setProcessing(false);
          return;
        }

        // Fazer a requisição ao backend
        const response = await fetch(`${API_BASE_URL}/events/${eventId}/qr-checkin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            qr_code_uuid: qrCodeUuid,
            checkin_status: true, // Sempre marcar como verdadeiro ao escanear
            user_id: userId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao processar QR code");
        }

        const responseData = await response.json();
        
        // Mostrar snackbar de sucesso
        setSnackbar({
          open: true,
          message: `Check-in de ${responseData.participant.fullName} realizado com sucesso!`,
          severity: "success",
        });
        
        // Fechar diálogo e passar o participante para o callback
        handleClose();
        onScanSuccess(responseData.participant);
        
      } catch (error: any) {
        console.error("Erro ao processar QR code:", error);
        setError(error.message || "Erro ao processar QR code");
        onScanError(error.message || "Erro ao processar QR code");
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleError = (err: any) => {
    console.error("Erro na leitura do QR code:", err);
    setError("Erro na leitura do QR code. Verifique as permissões da câmera.");
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<CameraAlt />}
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Ler QR Code
      </Button>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Escaneie o QR Code do Ingresso
          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {processing ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              p={4}
            >
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Processando QR code...</Typography>
            </Box>
          ) : (
            <Box sx={{ position: "relative", width: "100%" }}>
              {scanning && (
                <QrScanner
                  delay={300}
                  onError={handleError}
                  onScan={handleScan}
                  style={{ width: "100%" }}
                  constraints={{
                    video: { facingMode: "environment" }
                  }}
                />
              )}
              <Typography variant="caption" sx={{ mt: 2, display: "block", textAlign: "center" }}>
                Posicione o QR code do ingresso dentro da área de leitura
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default QRCodeScanner;
