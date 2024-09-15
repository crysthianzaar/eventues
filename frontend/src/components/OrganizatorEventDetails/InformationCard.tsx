import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Grid, Button } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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
    [{ 'color': [] }],
    ['link', 'image'],
  ],
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'list', 'bullet', 'align', 'link', 'image', 'color'
];

interface EventDetail {
  name: string;
  category: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  state: string;
  city: string;
  address: string;
  venue_name: string;
  address_detail: string;
  organization_name: string;
  organization_contact: string;
  event_status: string;
  event_type: string;
  event_category: string;
}

// Template base para o editor
const initialDescriptionTemplate = `
<h2>Informações do Evento</h2>
<li><b>Introdução:</b> Fale um pouco sobre o que é o seu evento</li>
<li><b>Local:</b> Forneça detalhes sobre onde será o evento e como chegar</li>
<li><b>Cronograma:</b> Especifique horários importantes (início, intervalos, fim)</li>
<li><b>Contato:</b> Informe como os participantes podem tirar dúvidas</li>
<li><b>Premiação:</b> Detalhe sobre prêmios ou brindes que serão oferecidos</li>
<li><b>Entregas de kit:</b> Forneça informações sobre locais e horários de entrega de kits</li>
<li><b>Categoria:</b> Enumere as categorias participantes do evento</li>
<li><b>Viradas de lote:</b> Informações sobre as datas e preços de lotes de ingressos</li>
<li><b>Informações adicionais:</b> Outras informações importantes</li>
`;

const InformationCard: React.FC = () => {
  const { event_id } = useParams<{ event_id: string }>();
  const [formData, setFormData] = useState({
    eventName: '',
    eventCategory: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    state: '',
    city: '',
    address: '',
    venueName: '',
    addressDetail: '',
    organizationName: '',
    organizationContact: '',
    eventType: '',
    eventStatus: '',
    eventDescription: initialDescriptionTemplate,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        const response = await axios.get<EventDetail>(`http://127.0.0.1:8000/organizer_detail/${event_id}`);
        const data = response.data;
        setFormData({
          eventName: data.name,
          eventCategory: data.event_category,
          startDate: data.start_date.split('T')[0],
          startTime: data.start_time,
          endDate: data.end_date.split('T')[0],
          endTime: data.end_time,
          state: data.state,
          city: data.city,
          address: data.address,
          venueName: data.venue_name,
          addressDetail: data.address_detail,
          organizationName: data.organization_name,
          organizationContact: data.organization_contact,
          eventType: data.event_type,
          eventStatus: data.event_status,
          eventDescription: initialDescriptionTemplate, // Pode adaptar para a descrição existente
        });
      } catch (err) {
        setError("Erro ao carregar detalhes do evento.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [event_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, eventDescription: value });
  };

  if (loading) {
    return <Typography>Carregando...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ padding: { xs: '20px', md: '40px' }, maxWidth: { xs: '100%', md: '1400px' }, margin: '0 auto' }}>
      <Grid container spacing={6}>
        {/* Informações Básicas */}
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
            autoComplete="off"
          />
          <TextField
            label="Categoria do Evento"
            fullWidth
            required
            name="eventCategory"
            value={formData.eventCategory}
            onChange={handleInputChange}
            sx={{ marginBottom: '20px' }}
            autoComplete="off"
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
                autoComplete="off"
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
                autoComplete="off"
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
                autoComplete="off"
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
                autoComplete="off"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Onde o evento vai acontecer */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ marginBottom: '20px', color: colors.primary, fontWeight: 'bold' }}>
            Onde o evento vai acontecer?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Estado"
                fullWidth
                required
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cidade"
                fullWidth
                required
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Endereço"
                fullWidth
                required
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome do Local"
                fullWidth
                required
                name="venueName"
                value={formData.venueName}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Complemento (opcional)"
                fullWidth
                name="addressDetail"
                value={formData.addressDetail}
                onChange={handleInputChange}
                autoComplete="off"
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Descrição do Evento */}
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

      {/* Botão Salvar */}
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
