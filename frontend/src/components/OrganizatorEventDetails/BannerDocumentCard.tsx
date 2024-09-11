import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const colors = {
  primary: "#5A67D8",
  green: "#48BB78",
  grayDark: "#2D3748",
  grayLight: "#F7FAFC",
  white: "#FFFFFF",
  border: "#E2E8F0",
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
    if (!files || files.length === 0) return;
    setDocuments((prev) => ({ ...prev, [docType]: files[0] }));
  };

  const handleDocumentRemove = (docType: string) => setDocuments((prev) => ({ ...prev, [docType]: null }));

  return (
    <Box sx={{ padding: { xs: '20px', md: '40px' }, maxWidth: { xs: '100%', md: '1400px' }, margin: '0 auto' }}>
      {/* Imagens do Evento */}
      <Typography variant="h6" sx={{ marginBottom: '20px', color: colors.primary, fontWeight: 'bold' }}>
        Imagens do Evento
      </Typography>

      <Box
        sx={{
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '15px',
          backgroundColor: colors.grayLight,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flexBasis: '70%' }}>
          <Typography sx={{ color: colors.grayDark, marginRight: '10px', fontWeight: 'bold' }}>
            Banner do evento:
          </Typography>
          {documents.banner && (
            <>
              <Typography sx={{ color: colors.grayDark, marginRight: '10px' }}>{documents.banner?.name}</Typography>
              <IconButton
                size="small"
                onClick={() => handleDocumentRemove('banner')}
                sx={{ color: colors.primary }}
              >
                <CloseIcon />
              </IconButton>
            </>
          )}
        </Box>

        <Box>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleDocumentUpload(e as React.ChangeEvent<HTMLInputElement>, 'banner')}
            style={{ display: 'none' }}
            id="banner-upload"
          />
          <label htmlFor="banner-upload">
            <Button
              variant="contained"
              component="span"
              sx={{
                backgroundColor: colors.primary,
                "&:hover": { backgroundColor: colors.primary },
                padding: '10px 20px',
              }}
            >
              Carregar
            </Button>
          </label>
        </Box>
      </Box>

      {/* Documentos do Evento */}
      <Typography variant="h6" sx={{ marginBottom: '20px', color: colors.primary, fontWeight: 'bold' }}>
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
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '15px',
            backgroundColor: colors.grayLight,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexBasis: '70%' }}>
            <Typography sx={{ color: colors.grayDark, marginRight: '10px', fontWeight: 'bold' }}>
              {doc.label}:
            </Typography>
            {documents[doc.type] && (
              <>
                <Typography sx={{ color: colors.grayDark, marginRight: '10px' }}>{documents[doc.type]?.name}</Typography>
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

          <Box>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleDocumentUpload(e as React.ChangeEvent<HTMLInputElement>, doc.type)}
              style={{ display: 'none' }}
              id={`${doc.type}-upload`}
            />
            <label htmlFor={`${doc.type}-upload`}>
              <Button
                variant="contained"
                component="span"
                sx={{
                  backgroundColor: colors.primary,
                  "&:hover": { backgroundColor: colors.primary },
                  padding: '10px 20px',
                }}
              >
                Carregar
              </Button>
            </label>
          </Box>
        </Box>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: colors.green,
            color: '#fff',
            padding: '10px 20px',
            "&:hover": { backgroundColor: "#38A169" },
          }}
        >
          Salvar
        </Button>
      </Box>
    </Box>
  );
};

export default BannerDocumentCard;
