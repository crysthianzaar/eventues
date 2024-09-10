import React, { useState } from 'react';
import { Box, Typography, Button, Card, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material'; // Ícone de "X" para excluir

const colors = {
  primary: "#5A67D8",
  secondary: "#68D391", // Cor verde
  grayDark: "#2D3748",
  grayLight: "#F7FAFC",
  border: "#E2E8F0",
  textMuted: "#718096",
};

const BannerDocumentCard: React.FC = () => {
  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({
    banner: null,
    regulamento: null,
    termoTerceiros: null,
    termoMenores: null,
  });

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    setDocuments((prev) => ({ ...prev, [docType]: files[0] }));
  };

  const handleDocumentRemove = (docType: string) => {
    setDocuments((prev) => ({ ...prev, [docType]: null }));
  };

  return (
    <>
      <Card
        sx={{
          padding: "20px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          border: `1px solid ${colors.border}`,
          position: "relative", // Adiciona posicionamento relativo para o botão "Salvar"
        }}
      >
        {/* Seção de Imagens do Evento */}
        <Typography variant="h6" sx={{ marginBottom: "10px", color: colors.grayDark }}>
          Imagens do Evento
        </Typography>

        <Box
          sx={{
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "15px",
            backgroundColor: colors.grayLight,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "background-color 0.3s ease",
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },
            "&:hover": {
              backgroundColor: "#EDF2F7",
            },
          }}
        >
          {/* Parte Esquerda: Label e Nome da Imagem */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            width: { xs: '100%', sm: "70%" }, 
            marginBottom: { xs: "10px", sm: "0" }
          }}>
            <Typography sx={{ color: colors.grayDark, marginRight: "10px", fontWeight: "bold" }}>
              Banner do evento:
            </Typography>
            {documents.banner && (
              <>
                <Typography sx={{ color: colors.grayDark, marginRight: "10px" }}>
                  {documents.banner?.name}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleDocumentRemove("banner")}
                  sx={{ color: colors.primary }}
                >
                  <CloseIcon />
                </IconButton>
              </>
            )}
          </Box>

          {/* Parte Direita: Botão de Carregar */}
          <Box sx={{ 
            display: "flex", 
            justifyContent: { xs: 'center', sm: 'flex-end' }, 
            width: { xs: '100%', sm: "30%" } 
          }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleDocumentUpload(e as React.ChangeEvent<HTMLInputElement>, "banner")}
              style={{ display: "none" }}
              id="banner-upload"
            />
            <label htmlFor="banner-upload">
              <Button
                variant="contained"
                component="span"
                sx={{
                  backgroundColor: colors.primary,
                  "&:hover": {
                    backgroundColor: colors.primary,
                  },
                }}
              >
                Carregar
              </Button>
            </label>
          </Box>
        </Box>

        {/* Seção de Documentos do Evento */}
        <Typography variant="h6" sx={{ marginBottom: "10px", color: colors.grayDark }}>
          Documentos do Evento
        </Typography>

        {[
          { label: "Regulamento do evento", type: "regulamento" },
          { label: "Termo de retirada", type: "termoTerceiros" },
          { label: "Termo para menores de 18 anos", type: "termoMenores" }
        ].map((doc) => (
          <Box
            key={doc.type}
            sx={{
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "15px",
              backgroundColor: colors.grayLight,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "background-color 0.3s ease",
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
              "&:hover": {
                backgroundColor: "#EDF2F7",
              },
            }}
          >
            {/* Parte Esquerda: Label e Nome do Documento */}
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              width: { xs: '100%', sm: "70%" }, 
              marginBottom: { xs: "10px", sm: "0" }
            }}>
              <Typography sx={{ color: colors.grayDark, marginRight: "10px", fontWeight: "bold" }}>
                {doc.label}:
              </Typography>
              {documents[doc.type] && (
                <>
                  <Typography sx={{ color: colors.grayDark, marginRight: "10px" }}>
                    {documents[doc.type]?.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleDocumentRemove(doc.type)}
                    sx={{ color: colors.primary }}
                  >
                    <CloseIcon />
                  </IconButton>
                </>
              )}
            </Box>

            {/* Parte Direita: Botão de Carregar */}
            <Box sx={{ 
              display: "flex", 
              justifyContent: { xs: 'center', sm: 'flex-end' }, 
              width: { xs: '100%', sm: "30%" } 
            }}>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleDocumentUpload(e as React.ChangeEvent<HTMLInputElement>, doc.type)}
                style={{ display: "none" }}
                id={`${doc.type}-upload`}
              />
              <label htmlFor={`${doc.type}-upload`}>
                <Button
                  variant="contained"
                  component="span"
                  sx={{
                    backgroundColor: colors.primary,
                    "&:hover": {
                      backgroundColor: colors.primary,
                    },
                  }}
                >
                  Carregar
                </Button>
              </label>
            </Box>
          </Box>
        ))}

        {/* Botão Salvar no canto direito */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: colors.secondary, // Cor verde
              color: "#fff",
              borderRadius: "20px", // Bordas arredondadas
              padding: "10px 20px", // Padding para aumentar o tamanho
              "&:hover": {
                backgroundColor: colors.secondary,
              },
            }}
          >
            Salvar
          </Button>
        </Box>
      </Card>
    </>
  );
};

export default BannerDocumentCard;
