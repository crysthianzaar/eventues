import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { UploadFile, Delete } from '@mui/icons-material';

const colors = {
  primary: "#5A67D8",  // Azul antes de anexar
  green: "#48BB78",    // Verde após anexar
  grayDark: "#2D3748",
  grayLight: "#F7FAFC",
  white: "#FFFFFF",
};

interface FileData {
  name: string;
  file: File | null; // Store actual file object
  base64: string;    // Base64 encoded string
  title: string;
  required: boolean; // Mark required files like Banner and Regulamento
}

const BannerDocumentCard: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [files, setFiles] = useState<FileData[]>([
    { name: '', file: null, base64: '', title: 'Banner do Evento', required: true },
    { name: '', file: null, base64: '', title: 'Regulamento', required: true },
  ]);
  const [errors, setErrors] = useState<string[]>([]);

  // Function to convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file upload for a specific file title
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, title: string) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
      const file = uploadedFiles[0]; // Only one file is allowed per input

      if (file.type.includes('image') || file.type.includes('pdf')) {
        try {
          const base64 = await convertToBase64(file);
          setFiles(files.map(f =>
            f.title === title
              ? { ...f, name: file.name, file: file, base64: base64 }
              : f
          ));
        } catch (error) {
          setErrors(prev => [...prev, `Erro ao converter ${file.name} para base64.`]);
        }
      } else {
        setErrors(prev => [...prev, `${file.name} não é uma imagem ou PDF válido.`]);
      }
    }
  };

  // Handle deleting a specific file, but keeping the item in the list
  const handleFileDelete = (title: string) => {
    setFiles(files.map(f => (f.title === title ? { ...f, name: '', file: null, base64: '' } : f)));
  };

  // Handle deleting the entire item from the list (only for non-required items)
  const handleItemDelete = (title: string) => {
    setFiles(files.filter(file => file.title !== title));
  };

  // Add a new file item to the list
  const addNewFile = () => {
    setFiles([...files, { name: '', file: null, base64: '', title: '', required: false }]);
  };

  // Handle changing the title of a new file
  const handleTitleChange = (index: number, title: string) => {
    setFiles(files.map((file, i) => (i === index ? { ...file, title } : file)));
  };

  // Validate that required files are uploaded before submitting
  const isFormValid = () => {
    const missingFiles = files
      .filter(file => file.required && !file.name)
      .map(file => `${file.title} é obrigatório.`);

    if (missingFiles.length > 0) {
      setErrors(missingFiles);
      return false;
    }

    return true;
  };

  // Handle form submission with file upload to backend
  const handleSubmit = async () => {
    if (!isFormValid()) return;

    // Prepare JSON to send
    const data = {
      files: files.map(file => ({
        file: file.base64,
        title: file.title
      }))
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/organizator_detail/${eventId}/document_files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar arquivos');
      }

      console.log('Arquivos enviados com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar arquivos:', error);
    }
  };

  return (
    <Box sx={{ padding: { xs: '20px', md: '40px' }, maxWidth: { xs: '100%', md: '1400px' }, margin: '0 auto' }}>
      <Typography variant="h6" sx={{ marginBottom: '20px', color: colors.primary, fontWeight: 'bold' }}>
        Upload e Gerenciamento de Materiais Visuais e Documentos
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título do Documento</TableCell>
              <TableCell>Arquivo</TableCell>
              <TableCell>Ação sobre Arquivo</TableCell>
              <TableCell>Excluir Item</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file, index) => (
              <TableRow key={index}>
                <TableCell>
                  <TextField
                    label="Título do Documento"
                    fullWidth
                    required={file.required}
                    value={file.title}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                    disabled={file.required} // Disable editing for required fields
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{
                      backgroundColor: file.name ? colors.green : colors.primary, // Azul antes de anexar, verde depois
                      color: colors.white,
                      "&:hover": { backgroundColor: file.name ? "#38A169" : "#4c6ef5" }, // Azul mais escuro no hover antes de anexar
                    }}
                  >
                    <UploadFile sx={{ marginRight: '8px' }} />
                    {file.name ? file.name : 'Upload'}
                    <input
                      type="file"
                      hidden
                      accept="image/*,application/pdf"
                      onChange={(e) => handleFileUpload(e, file.title)}
                    />
                  </Button>
                </TableCell>
                <TableCell>
                  {file.name && (
                    <IconButton
                      aria-label="delete file"
                      size="small"
                      sx={{ color: colors.primary }}
                      onClick={() => handleFileDelete(file.title)}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell>
                  {!file.required && (
                    <IconButton
                      aria-label="delete item"
                      size="small"
                      sx={{ color: 'red' }}
                      onClick={() => handleItemDelete(file.title)}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {errors.length > 0 && (
        <Box sx={{ color: 'red', marginTop: '20px' }}>
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
        sx={{
          marginTop: '20px',
          color: colors.primary,
          borderColor: colors.primary,
          "&:hover": { backgroundColor: colors.grayLight, borderColor: colors.primary },
        }}
      >
        Adicionar Novo Documento
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: colors.green,
            color: '#fff',
            padding: '10px 20px',
            "&:hover": { backgroundColor: "#38A169" },
          }}
          onClick={handleSubmit}
        >
          Salvar
        </Button>
      </Box>
    </Box>
  );
};

export default BannerDocumentCard;
