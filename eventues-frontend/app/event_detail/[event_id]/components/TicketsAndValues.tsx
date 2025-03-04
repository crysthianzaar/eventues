// app/event_detail/[event_id]/components/TicketsAndValues.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControlLabel,
  RadioGroup,
  Radio,
  IconButton,
  Tooltip,
  Checkbox,
  InputAdornment,
  CircularProgress,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import MoneyIcon from '@mui/icons-material/Money';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { alpha, useTheme } from '@mui/material/styles';
import { useRouter, useParams } from 'next/navigation';
import api, { createTicket, getTickets, updateTicket, deleteTicket, Ingresso, Lote } from '../apis/api';

const TicketsAndValues: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { event_id } = params;
  const theme = useTheme();

  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [step, setStep] = useState(0);
  const [ingressoType, setIngressoType] = useState<'Simples' | 'Lotes' | 'Gratuito'>('Simples');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editIngresso, setEditIngresso] = useState<Ingresso | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ingressoToDelete, setIngressoToDelete] = useState<string | null>(null);

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const tickets = await getTickets(Array.isArray(event_id) ? event_id[0] : event_id);
        setIngressos(tickets);
      } catch (error) {
        console.error('Erro ao obter ingressos:', error);
        setError('Erro ao obter ingressos');
        setSnackbarMessage('Erro ao obter ingressos. Você pode criar novos ingressos.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    if (event_id) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [event_id]);

  const handleCreate = () => {
    setEditIngresso(null);
    setIngressoType('Simples');
    setModalOpen(true);
    setStep(0);
  };

  const handleEdit = (ingresso: Ingresso) => {
    setEditIngresso(ingresso);
    setIngressoType(ingresso.tipo);
    setModalOpen(true);
    setStep(0);
  };

  const handleDeleteClick = (ingressoId: string) => {
    setIngressoToDelete(ingressoId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!event_id || !ingressoToDelete) return;

    try {
      await deleteTicket(Array.isArray(event_id) ? event_id[0] : event_id, ingressoToDelete);
      setIngressos((prev) => prev.filter((ingresso) => ingresso.id !== ingressoToDelete));
      setSnackbarMessage('Ingresso excluído com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Erro ao excluir ingresso:', error);
      setSnackbarMessage('Erro ao excluir ingresso.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setDeleteDialogOpen(false);
      setIngressoToDelete(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: theme.palette.background.default }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Gerenciamento de Ingressos
          </Typography>
          <Button
            onClick={handleCreate}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
            }}
          >
            Novo Ingresso
          </Button>
        </Stack>

        {ingressos.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
              borderRadius: 2,
            }}
          >
            <EventSeatIcon sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nenhum ingresso criado
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Comece criando seu primeiro ingresso para o evento
            </Typography>
            <Button
              variant="outlined"
              onClick={handleCreate}
              startIcon={<AddIcon />}
              sx={{ textTransform: 'none' }}
            >
              Criar Ingresso
            </Button>
          </Paper>
        ) : (
          <IngressosList ingressos={ingressos} onEdit={handleEdit} onDelete={handleDeleteClick} />
        )}
      </Paper>

      <IngressoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        step={step}
        setStep={setStep}
        ingressoType={ingressoType}
        setIngressoType={setIngressoType}
        eventId={Array.isArray(event_id) ? event_id[0] : event_id}
        setIngressos={setIngressos}
        editIngresso={editIngresso}
        setSnackbarMessage={setSnackbarMessage}
        setSnackbarSeverity={setSnackbarSeverity}
        setSnackbarOpen={setSnackbarOpen}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DeleteIcon color="error" />
            <Typography variant="h6">Confirmar Exclusão</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza de que deseja excluir este ingresso? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.secondary, 0.1),
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ ml: 1 }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

interface IngressosListProps {
  ingressos: Ingresso[];
  onEdit: (ingresso: Ingresso) => void;
  onDelete: (ingressoId: string) => void;
}

const IngressosList: React.FC<IngressosListProps> = ({ ingressos, onEdit, onDelete }) => {
  const theme = useTheme();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Não definida';
      return date.toLocaleDateString('pt-BR');
    } catch {
      return 'Não definida';
    }
  };

  return (
    <Grid container spacing={3}>
      {ingressos.map((ingresso) => (
        <Grid item xs={12} sm={6} md={4} key={ingresso.id}>
          <Card
            elevation={1}
            sx={{
              height: '100%',
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ConfirmationNumberIcon 
                      sx={{ 
                        color: ingresso.tipo === 'Gratuito' 
                          ? theme.palette.success.main 
                          : theme.palette.primary.main 
                      }} 
                    />
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                      {ingresso.nome}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => onEdit(ingresso)}
                        size="small"
                        sx={{ 
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton
                        onClick={() => onDelete(ingresso.id)}
                        size="small"
                        sx={{ 
                          color: theme.palette.error.main,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      label={ingresso.tipo}
                      size="small"
                      color={
                        ingresso.tipo === 'Gratuito'
                          ? 'success'
                          : ingresso.tipo === 'Lotes'
                          ? 'primary'
                          : 'default'
                      }
                    />
                    <Chip
                      label={ingresso.visibilidade === 'publico' ? 'Público' : 'Privado'}
                      size="small"
                      variant="outlined"
                      icon={<VisibilityIcon fontSize="small" />}
                    />
                    <Chip
                      label={ingresso.taxaServico === 'absorver' ? 'Taxa absorvida' : 'Taxa repassada'}
                      size="small"
                      variant="outlined"
                      color={ingresso.taxaServico === 'absorver' ? 'primary' : 'default'}
                    />
                  </Stack>

                  <Stack spacing={1.5} sx={{ pt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MoneyIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 'medium', color: theme.palette.success.main }}>
                        {ingresso.valor > 0
                          ? formatCurrency(ingresso.valor)
                          : ingresso.tipo === 'Gratuito'
                          ? 'Gratuito'
                          : 'R$ 0,00'}
                      </Typography>
                    </Box>

                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventSeatIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {ingresso.totalIngressos ? `${ingresso.totalIngressos} ingressos disponíveis` : 'Quantidade não definida'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarTodayIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {ingresso.inicioVendas || ingresso.fimVendas ? (
                            `${formatDate(ingresso.inicioVendas)} até ${formatDate(ingresso.fimVendas)}`
                          ) : (
                            'Período de vendas não definido'
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>

                  {ingresso.lotes && ingresso.lotes.length > 0 && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="subtitle2" gutterBottom color="primary">
                          Lotes
                        </Typography>
                        <Stack spacing={1}>
                          {ingresso.lotes.map((lote, index) => (
                            <Paper
                              key={index}
                              variant="outlined"
                              sx={{
                                p: 1,
                                borderRadius: 1,
                              }}
                            >
                              <Stack spacing={0.5}>
                                <Typography variant="body2" fontWeight="medium">
                                  Lote {index + 1}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {formatCurrency(lote.valor)}
                                </Typography>
                                {lote.viradaProximoLote.data && (
                                  <Typography variant="caption" color="text.secondary">
                                    Vira em: {formatDate(lote.viradaProximoLote.data)}
                                  </Typography>
                                )}
                                {lote.viradaProximoLote.quantidade > 0 && (
                                  <Typography variant="caption" color="text.secondary">
                                    Após vender: {lote.viradaProximoLote.quantidade} ingressos
                                  </Typography>
                                )}
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      </Box>
                    </>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

interface IngressoModalProps {
  open: boolean;
  onClose: () => void;
  step: number;
  setStep: (step: number) => void;
  ingressoType: 'Simples' | 'Lotes' | 'Gratuito';
  setIngressoType: (type: 'Simples' | 'Lotes' | 'Gratuito') => void;
  eventId: string;
  setIngressos: React.Dispatch<React.SetStateAction<Ingresso[]>>;
  editIngresso: Ingresso | null;
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>;
  setSnackbarSeverity: React.Dispatch<React.SetStateAction<'success' | 'error' | 'info' | 'warning'>>;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const IngressoModal: React.FC<IngressoModalProps> = ({
  open,
  onClose,
  step,
  setStep,
  ingressoType,
  setIngressoType,
  eventId,
  setIngressos,
  editIngresso,
  setSnackbarMessage,
  setSnackbarSeverity,
  setSnackbarOpen,
}) => {
  const theme = useTheme();
  const isEditMode = editIngresso !== null;

  const steps = ['Escolher tipo de ingresso', 'Definir detalhes'];

  const [lotes, setLotes] = useState<Lote[]>([
    { valor: 0, quantidade: 100, viradaProximoLote: { data: '', quantidade: 0 } },
  ]);

  // Form states
  const [nome, setNome] = useState('');
  const [totalIngressos, setTotalIngressos] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [inicioVendas, setInicioVendas] = useState<string>('');
  const [fimVendas, setFimVendas] = useState<string>('');
  const [absorverTaxa, setAbsorverTaxa] = useState<boolean>(true);
  const [repassarTaxa, setRepassarTaxa] = useState<boolean>(false);
  const [visibilidade, setVisibilidade] = useState<'publico' | 'privado'>('publico');

  useEffect(() => {
    if (isEditMode && editIngresso) {
      setNome(editIngresso.nome);
      setTotalIngressos(editIngresso.totalIngressos?.toString() || '');
      setValor(editIngresso.valor?.toString().replace('.', ',') || '');
      setInicioVendas(editIngresso.inicioVendas || '');
      setFimVendas(editIngresso.fimVendas || '');
      setAbsorverTaxa(editIngresso.taxaServico === 'absorver');
      setRepassarTaxa(editIngresso.taxaServico === 'repassar');
      setVisibilidade(editIngresso.visibilidade);
      setIngressoType(editIngresso.tipo);
      if (editIngresso.lotes?.length) {
        setLotes(editIngresso.lotes);
      }
    } else {
      resetForm();
    }
  }, [isEditMode, editIngresso]);

  const resetForm = () => {
    setNome('');
    setTotalIngressos('');
    setValor('');
    setInicioVendas('');
    setFimVendas('');
    setAbsorverTaxa(true);
    setRepassarTaxa(false);
    setVisibilidade('publico');
    setLotes([{ valor: 0, quantidade: 100, viradaProximoLote: { data: '', quantidade: 0 } }]);
  };

  const handleNext = () => {
    if (step === 0 && ingressoType) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleAddLote = () => {
    setLotes([...lotes, { valor: 0, quantidade: 50, viradaProximoLote: { data: '', quantidade: 0 } }]);
  };

  const handleDeleteLote = (index: number) => {
    if (lotes.length > 1) {
      setLotes(lotes.filter((_, i) => i !== index));
    }
  };

  const handleLoteChange = (index: number, field: keyof Lote, value: any) => {
    const newLotes = [...lotes];
    if (field === 'valor') {
      const numValue = parseFloat(value.replace(',', '.'));
      newLotes[index] = { ...newLotes[index], [field]: isNaN(numValue) ? 0 : numValue };
    } else {
      newLotes[index] = { ...newLotes[index], [field]: value };
    }
    setLotes(newLotes);
  };

  const handleSave = async () => {
    if (!eventId) return;

    try {
      const valorNumber = parseFloat(valor.replace(',', '.'));
      const totalIngressosNumber = totalIngressos ? parseInt(totalIngressos) : 0;

      const payload: Partial<Ingresso> = {
        nome,
        tipo: ingressoType,
        valor: ingressoType === 'Gratuito' ? 0 : valorNumber,
        totalIngressos: totalIngressosNumber.toString(),
        inicioVendas,
        fimVendas,
        taxaServico: absorverTaxa ? 'absorver' : 'repassar',
        visibilidade,
        lotes: ingressoType === 'Lotes' ? lotes : undefined,
      };

      if (isEditMode && editIngresso) {
        const updatedIngresso = await updateTicket(eventId, editIngresso.id, payload);
        setIngressos((prev) =>
          prev.map((ing) => (ing.id === editIngresso.id ? updatedIngresso : ing))
        );
        setSnackbarMessage('Ingresso atualizado com sucesso!');
      } else {
        const newIngresso = await createTicket(eventId, payload);
        setIngressos((prev) => [...prev, newIngresso]);
        setSnackbarMessage('Ingresso criado com sucesso!');
      }
      
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar ingresso:', error);
      setSnackbarMessage('Erro ao salvar ingresso. Verifique os dados e tente novamente.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const renderTicketTypeSelection = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
      <Typography variant="h6" gutterBottom>
        Escolha o tipo de ingresso:
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {[
          { value: 'Simples', label: 'Ingresso Simples', icon: <ConfirmationNumberIcon /> },
          { value: 'Lotes', label: 'Ingresso em Lotes', icon: <MoneyIcon /> },
          { value: 'Gratuito', label: 'Ingresso Gratuito', icon: <EventSeatIcon /> },
        ].map((type) => (
          <Grid item xs={12} sm={4} key={type.value}>
            <Paper
              elevation={ingressoType === type.value ? 3 : 1}
              sx={{
                p: 3,
                cursor: 'pointer',
                textAlign: 'center',
                borderRadius: 2,
                border: ingressoType === type.value ? `2px solid ${theme.palette.primary.main}` : 'none',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
              onClick={() => setIngressoType(type.value as typeof ingressoType)}
            >
              <Box sx={{ color: theme.palette.primary.main, mb: 1 }}>{type.icon}</Box>
              <Typography variant="subtitle1" fontWeight="medium">
                {type.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderTicketForm = () => (
    <Stack spacing={3}>
      <TextField
        fullWidth
        label="Nome do Ingresso"
        placeholder="Ex: Ingresso VIP"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        InputLabelProps={{ shrink: true }}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Total de ingressos"
            type="number"
            placeholder="Ex: 1000"
            value={totalIngressos}
            onChange={(e) => setTotalIngressos(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        {ingressoType !== 'Gratuito' && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Valor do Ingresso"
              placeholder="Ex: 90,00"
              value={valor}
              onChange={(e) => {
                const value = e.target.value.replace('.', ',');
                const regex = /^\d*(,\d{0,2})?$/;
                if (regex.test(value)) {
                  setValor(value);
                }
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        )}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Início das vendas"
            type="date"
            value={inicioVendas}
            onChange={(e) => setInicioVendas(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Fim das vendas"
            type="date"
            value={fimVendas}
            onChange={(e) => setFimVendas(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <FormControl fullWidth>
        <InputLabel id="visibilidade-label">Visibilidade</InputLabel>
        <Select
          labelId="visibilidade-label"
          value={visibilidade}
          label="Visibilidade"
          onChange={(e) => setVisibilidade(e.target.value as 'publico' | 'privado')}
        >
          <MenuItem value="publico">Público</MenuItem>
          <MenuItem value="privado">Privado</MenuItem>
        </Select>
      </FormControl>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Taxa de Serviço
        </Typography>
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={absorverTaxa}
                onChange={(e) => {
                  setAbsorverTaxa(e.target.checked);
                  if (e.target.checked) setRepassarTaxa(false);
                }}
              />
            }
            label="Absorver taxa"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={repassarTaxa}
                onChange={(e) => {
                  setRepassarTaxa(e.target.checked);
                  if (e.target.checked) setAbsorverTaxa(false);
                }}
              />
            }
            label="Repassar taxa"
          />
        </Stack>
      </Paper>

      {ingressoType === 'Lotes' && (
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Configuração dos Lotes
          </Typography>
          <Stack spacing={3}>
            {lotes.map((lote, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.default,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">Lote {index + 1}</Typography>
                  {lotes.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteLote(index)}
                      sx={{ color: theme.palette.error.main }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Valor do lote"
                      type="text"
                      value={lote.valor}
                      onChange={(e) => {
                        const value = e.target.value.replace('.', ',');
                        const regex = /^\d*(,\d{0,2})?$/;
                        if (regex.test(value)) {
                          handleLoteChange(index, 'valor', value);
                        }
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                    />
                  </Grid>
                  {index < lotes.length - 1 && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Condições para virada do lote
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Data de virada"
                          type="date"
                          value={lote.viradaProximoLote.data}
                          onChange={(e) =>
                            handleLoteChange(index, 'viradaProximoLote', {
                              ...lote.viradaProximoLote,
                              data: e.target.value,
                            })
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Quantidade para virada"
                          type="number"
                          value={lote.viradaProximoLote.quantidade}
                          onChange={(e) =>
                            handleLoteChange(index, 'viradaProximoLote', {
                              ...lote.viradaProximoLote,
                              quantidade: parseInt(e.target.value, 10),
                            })
                          }
                          helperText="Quantidade de ingressos vendidos para virar o lote"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Paper>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddLote}
              sx={{ alignSelf: 'flex-start' }}
            >
              Adicionar Lote
            </Button>
          </Stack>
        </Box>
      )}
    </Stack>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ConfirmationNumberIcon color="primary" />
          <Typography variant="h6">
            {isEditMode ? 'Editar Ingresso' : 'Criar Novo Ingresso'}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 ? renderTicketTypeSelection() : renderTicketForm()}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
        {step > 0 && (
          <Button onClick={handleBack} sx={{ mr: 1 }}>
            Voltar
          </Button>
        )}
        <Button
          variant="contained"
          onClick={step === steps.length - 1 ? handleSave : handleNext}
          disabled={step === 0 && !ingressoType}
        >
          {step === steps.length - 1 ? (isEditMode ? 'Salvar Alterações' : 'Criar Ingresso') : 'Próximo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketsAndValues;
