import React, { useState } from 'react';
import { Box, Typography, TextField, Grid, Button } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 

const colors = {
  primary: "#5A67D8",
  green: "#48BB78",
  grayDark: "#2D3748",
  grayLight: "#F7FAFC",
  white: "#FFFFFF",
};

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'image'],
  ],
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'list', 'bullet', 'align', 'link', 'image'
];

const InformationCard: React.FC = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    eventCategory: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    eventDescription: '', 
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, eventDescription: value });
  };

  return (
    <Box sx={{ padding: { xs: '20px', md: '40px' }, maxWidth: { xs: '100%', md: '1400px' }, margin: '0 auto' }}>
      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ marginBottom: '20px', color: colors.primary, fontWeight: 'bold' }}>
            Informações Básicas
          </Typography>
          <TextField
            label="Nome do Evento"
            fullWidth
            required
            name="eventName"
            value={formData.eventName}
            onChange={handleInputChange}
            sx={{ marginBottom: '20px' }}
          />
          <TextField
            label="Categoria do Evento"
            fullWidth
            required
            name="eventCategory"
            value={formData.eventCategory}
            onChange={handleInputChange}
            sx={{ marginBottom: '20px' }}
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora de Início"
                type="time"
                fullWidth
                required
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Hora de Término"
                type="time"
                fullWidth
                required
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ marginBottom: '20px', color: colors.primary, fontWeight: 'bold' }}>
            Descrição do Evento
          </Typography>
          <ReactQuill
            value={formData.eventDescription}
            onChange={handleDescriptionChange}
            modules={modules} 
            formats={formats}
            placeholder="Adicione aqui as informações do seu evento..."
            style={{ backgroundColor: colors.white, borderRadius: '8px', height: '300px', marginBottom: '30px' }}
          />
        </Grid>
      </Grid>

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

export default InformationCard;
