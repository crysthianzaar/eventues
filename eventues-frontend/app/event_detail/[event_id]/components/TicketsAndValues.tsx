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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; // Importar ícone de editar
import EventSeatIcon from '@mui/icons-material/EventSeat';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { useTheme } from '@mui/material/styles';
import { useRouter, useParams } from 'next/navigation';
import api, { createTicket, getTickets, updateTicket, deleteTicket, Ingresso, Lote } from '../apis/api';

const TicketsAndValues: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { event_id } = params;

  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [step, setStep] = useState(0);
  const [ingressoType, setIngressoType] = useState<'Simples' | 'Lotes' | 'Gratuito'>('Simples');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editIngresso, setEditIngresso] = useState<Ingresso | null>(null); // Estado para rastrear o ingresso a ser editado

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  const theme = useTheme();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const tickets = await getTickets(Array.isArray(event_id) ? event_id[0] : event_id);
        setIngressos(tickets);
      } catch (error) {
        console.error('Erro ao obter ingressos:', error);
        setError('Erro ao obter ingressos');
        // Exibir snackbar de erro
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
    setEditIngresso(null); // Resetar o ingresso de edição
    setIngressoType('Simples'); // Resetar o tipo de ingresso
    setModalOpen(true);
    setStep(0); // Resetar o stepper ao abrir o modal
  };

  const handleEdit = (ingresso: Ingresso) => {
    setEditIngresso(ingresso);
    setIngressoType(ingresso.tipo);
    setModalOpen(true);
    setStep(0); // Começar no primeiro passo
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditIngresso(null);
  };

  const handleDelete = async (ingressoId: string) => {
    if (!event_id) return;

    if (confirm('Tem certeza de que deseja excluir este ingresso?')) {
      try {
        await deleteTicket(Array.isArray(event_id) ? event_id[0] : event_id, ingressoId);
        setIngressos((prev) => prev.filter((ingresso) => ingresso.id !== ingressoId));
        setSnackbarMessage('Ingresso excluído com sucesso.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Erro ao excluir ingresso:', error);
        setSnackbarMessage('Erro ao excluir ingresso.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', padding: 4 }}>
      {/* Exibir alerta de erro, se houver */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Botão para adicionar mais ingressos */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          onClick={handleCreate}
          variant="contained"
          startIcon={<AddIcon />}
        >
          Adicionar Ingresso
        </Button>
      </Box>

      {ingressos.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            textAlign: 'center',
          }}
        >
          <EventSeatIcon fontSize="large" sx={{ mb: 2, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Você ainda não criou ingressos
          </Typography>
          <Button
            onClick={handleCreate}
            variant="contained"
            sx={{
              fontWeight: 'bold',
              borderRadius: '8px',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            Criar Ingresso
          </Button>
        </Box>
      ) : (
        <IngressosList ingressos={ingressos} onEdit={handleEdit} onDelete={handleDelete} />
      )}
      <IngressoModal
        open={modalOpen}
        onClose={handleCloseModal}
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

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
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
  return (
    <Grid container spacing={3}>
      {ingressos.map((ingresso) => (
        <Grid item xs={12} sm={6} md={4} key={ingresso.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ConfirmationNumberIcon />
                  {ingresso.nome}
                </Typography>
                <Box>
                  <IconButton onClick={() => onEdit(ingresso)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => onDelete(ingresso.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Tipo: {ingresso.tipo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Taxa de serviço: {ingresso.taxaServico === 'absorver' ? 'Absorvida' : 'Repassada'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visibilidade: {ingresso.visibilidade}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Ingressos: {ingresso.totalIngressos}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Início das Vendas: {new Date(ingresso.inicioVendas).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fim das Vendas: {new Date(ingresso.fimVendas).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Valor: R$ {(ingresso.valor ?? 0).toFixed(2)}
              </Typography>
              {ingresso.lotes && ingresso.lotes.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Lotes:
                  </Typography>
                  {ingresso.lotes.map((lote, index) => (
                    <Typography key={index} variant="body2" color="text.secondary">
                      Lote {index + 1}: {lote.quantidade} ingressos a R$ {lote.valor.toFixed(2)}
                    </Typography>
                  ))}
                </Box>
              )}
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
  const isEditMode = editIngresso !== null;

  const steps = ['Escolher tipo de ingresso', 'Definir detalhes'];

  const [lotes, setLotes] = useState<Lote[]>([
    { valor: 0, quantidade: 100, viradaProximoLote: { data: '', quantidade: 0 } },
    { valor: 0, quantidade: 50, viradaProximoLote: { data: '', quantidade: 0 } },
  ]);

  // Estados para capturar os valores do formulário
  const [nome, setNome] = useState('');
  const [totalIngressos, setTotalIngressos] = useState<number>(0);
  const [valor, setValor] = useState<string>('0');
  const [inicioVendas, setInicioVendas] = useState<string>('');
  const [fimVendas, setFimVendas] = useState<string>('');
  const [absorverTaxa, setAbsorverTaxa] = useState<boolean>(true);
  const [repassarTaxa, setRepassarTaxa] = useState<boolean>(false);
  const [visibilidade, setVisibilidade] = useState<'publico' | 'privado'>('publico');

  useEffect(() => {
    if (isEditMode && editIngresso) {
      setNome(editIngresso.nome);
      setTotalIngressos(editIngresso.totalIngressos || 0);
      setValor(editIngresso.valor.toString().replace('.', ','));
      setInicioVendas(editIngresso.inicioVendas || '');
      setFimVendas(editIngresso.fimVendas || '');
      setAbsorverTaxa(editIngresso.taxaServico === 'absorver');
      setRepassarTaxa(editIngresso.taxaServico === 'repassar');
      setVisibilidade(editIngresso.visibilidade);
      setIngressoType(editIngresso.tipo);
      if (editIngresso.lotes) {
        setLotes(editIngresso.lotes);
      } else {
        setLotes([]);
      }
    } else {
      // Resetar campos ao criar um novo ingresso
      setNome('');
      setTotalIngressos(0);
      setValor('0');
      setInicioVendas('');
      setFimVendas('');
      setAbsorverTaxa(true);
      setRepassarTaxa(false);
      setVisibilidade('publico');
      setIngressoType('Simples');
      setLotes([
        { valor: 0, quantidade: 100, viradaProximoLote: { data: '', quantidade: 0 } },
        { valor: 0, quantidade: 50, viradaProximoLote: { data: '', quantidade: 0 } },
      ]);
    }
  }, [isEditMode, editIngresso]);

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
    setLotes(lotes.filter((_, i) => i !== index));
  };

  const handleLoteChange = (index: number, field: keyof Lote, value: any) => {
    const newLotes = [...lotes];
    newLotes[index] = { ...newLotes[index], [field]: value };
    setLotes(newLotes);
  };

  const handleSave = async () => {
    if (!eventId) return;

    try {
      const valorNumber = parseFloat(valor.replace(',', '.'));

      const payload: Partial<Ingresso> = {
        nome,
        tipo: ingressoType,
        valor: valorNumber,
        totalIngressos,
        inicioVendas,
        fimVendas,
        taxaServico: absorverTaxa ? 'absorver' : 'repassar',
        visibilidade: visibilidade,
        lotes: ingressoType === 'Lotes' ? lotes : undefined,
      };

      if (isEditMode && editIngresso) {
        // Atualizar ingresso existente
        const updatedIngresso = await updateTicket(eventId, editIngresso.id, payload);
        setIngressos((prev) =>
          prev.map((ing) => (ing.id === updatedIngresso.id ? updatedIngresso : ing))
        );
        setSnackbarMessage('Ingresso atualizado com sucesso.');
        setSnackbarSeverity('success');
      } else {
        // Criar novo ingresso
        const newIngresso = await createTicket(eventId, payload);
        setIngressos((prev) => [...prev, newIngresso]);
        setSnackbarMessage('Ingresso criado com sucesso.');
        setSnackbarSeverity('success');
      }

      setSnackbarOpen(true);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar ingresso:', error);
      setSnackbarMessage('Erro ao salvar ingresso.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isEditMode ? 'Editar Ingresso' : 'Criar Ingresso'}
        <AddIcon />
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {step === 0 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 4 }}>
              Escolha o tipo de ingresso:
            </Typography>
            <RadioGroup
              row
              value={ingressoType}
              onChange={(e) => setIngressoType(e.target.value as 'Simples' | 'Lotes' | 'Gratuito')}
            >
              <FormControlLabel value="Simples" control={<Radio />} label="Ingresso Simples" />
              <FormControlLabel value="Lotes" control={<Radio />} label="Ingresso em Lotes" />
              <FormControlLabel value="Gratuito" control={<Radio />} label="Ingresso Gratuito" />
            </RadioGroup>
          </Box>
        )}

        {step === 1 && ingressoType === 'Lotes' && (
          <Box>
            <TextField
              fullWidth
              label="Nome do Ingresso"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Total de ingressos disponíveis"
              type="number"
              value={totalIngressos}
              onChange={(e) => setTotalIngressos(parseInt(e.target.value, 10))}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Valor do Ingresso"
              type="text"
              value={valor}
              onChange={(e) => {
                let value = e.target.value.replace('.', ',');
                const regex = /^\d*(,\d{0,2})?$/;
                if (regex.test(value)) {
                  setValor(value);
                }
              }}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Início das vendas"
              type="date"
              value={inicioVendas}
              onChange={(e) => setInicioVendas(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Fim das vendas"
              type="date"
              value={fimVendas}
              onChange={(e) => setFimVendas(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />

            {/* Seleção de Visibilidade */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="visibilidade-label">Visibilidade</InputLabel>
              <Select
                labelId="visibilidade-label"
                id="visibilidade"
                value={visibilidade}
                label="Visibilidade"
                onChange={(e) => setVisibilidade(e.target.value as 'publico' | 'privado')}
              >
                <MenuItem value="publico">Público</MenuItem>
                <MenuItem value="privado">Privado</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={absorverTaxa}
                  onChange={(e) => {
                    setAbsorverTaxa(e.target.checked);
                    if (e.target.checked) {
                      setRepassarTaxa(false);
                    }
                  }}
                />
              }
              label="Absorver taxa"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={repassarTaxa}
                  onChange={(e) => {
                    setRepassarTaxa(e.target.checked);
                    if (e.target.checked) {
                      setAbsorverTaxa(false);
                    }
                  }}
                />
              }
              label="Repassar taxa para o comprador"
              sx={{ mb: 2 }}
            />

            {/* Mapeamento dos Lotes */}
            {lotes.map((lote, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  mb: 4,
                  mt: 3,
                  padding: 3,
                  borderRadius: '10px',
                  backgroundColor: '#f9f9f9',
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* Indicador visual do Stepper vertical */}
                {index !== lotes.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '-25px',
                      transform: 'translateY(-50%)',
                      height: '100%',
                      width: '3px',
                      backgroundColor: '#ddd',
                    }}
                  />
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textTransform: 'uppercase' }}>
                    Lote {index + 1}
                  </Typography>
                  {lotes.length > 2 && (
                    <Tooltip title="Remover este lote">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteLote(index)}
                        sx={{
                          backgroundColor: '#ffebee',
                          '&:hover': {
                            backgroundColor: '#ffcdd2',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* Valor do ingresso */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Valor do ingresso (R$)
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      value={lote.valor}
                      onChange={(e) => handleLoteChange(index, 'valor', parseFloat(e.target.value))}
                      variant="outlined"
                      InputProps={{ inputProps: { min: 0, step: '0.01' } }}
                    />
                  </Grid>

                  {/* Virada para o próximo lote - Somente exibir se não for o último lote */}
                  {index !== lotes.length - 1 && (
                    <>
                      <Grid item xs={12} sm={5}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Virar na seguinte data
                        </Typography>
                        <TextField
                          fullWidth
                          type="date"
                          value={lote.viradaProximoLote.data}
                          onChange={(e) =>
                            handleLoteChange(index, 'viradaProximoLote', {
                              ...lote.viradaProximoLote,
                              data: e.target.value,
                            })
                          }
                          InputLabelProps={{
                            shrink: true,
                          }}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Typography sx={{ fontWeight: 'bold' }}>e / ou</Typography>
                      </Grid>

                      <Grid item xs={12} sm={5}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Após vender
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={lote.viradaProximoLote.quantidade}
                          onChange={(e) =>
                            handleLoteChange(index, 'viradaProximoLote', {
                              ...lote.viradaProximoLote,
                              quantidade: Math.max(1, parseInt(e.target.value, 10)),
                            })
                          }
                          inputProps={{ min: 1 }}
                          variant="outlined"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>

                {index !== lotes.length - 1 ? (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Vira para o próximo lote após a data selecionada e/ou após vender a quantidade especificada.
                  </Typography>
                ) : (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Este é o lote final. Ele continuará à venda até o fim das vendas ou até que todos os ingressos sejam vendidos.
                  </Typography>
                )}
              </Box>
            ))}

            <Button variant="outlined" onClick={handleAddLote} sx={{ mt: 2 }}>
              + Adicionar Lote
            </Button>
          </Box>
        )}

        {/* Outros tipos de ingresso como Simples e Gratuito */}
        {step === 1 && ingressoType === 'Simples' && (
          <Box>
            <TextField
              fullWidth
              label="Nome do Ingresso"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Total de ingressos disponíveis"
              type="number"
              value={totalIngressos}
              onChange={(e) => setTotalIngressos(parseInt(e.target.value, 10))}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Valor do Ingresso"
              type="text"
              value={valor}
              onChange={(e) => {
                let value = e.target.value.replace('.', ',');
                const regex = /^\d*(,\d{0,2})?$/;
                if (regex.test(value)) {
                  setValor(value);
                }
              }}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Início das vendas"
              type="date"
              value={inicioVendas}
              onChange={(e) => setInicioVendas(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Fim das vendas"
              type="date"
              value={fimVendas}
              onChange={(e) => setFimVendas(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />

            {/* Seleção de Visibilidade */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="visibilidade-label">Visibilidade</InputLabel>
              <Select
                labelId="visibilidade-label"
                id="visibilidade"
                value={visibilidade}
                label="Visibilidade"
                onChange={(e) => setVisibilidade(e.target.value as 'publico' | 'privado')}
              >
                <MenuItem value="publico">Público</MenuItem>
                <MenuItem value="privado">Privado</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={absorverTaxa}
                  onChange={(e) => {
                    setAbsorverTaxa(e.target.checked);
                    if (e.target.checked) {
                      setRepassarTaxa(false);
                    }
                  }}
                />
              }
              label="Absorver taxa"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={repassarTaxa}
                  onChange={(e) => {
                    setRepassarTaxa(e.target.checked);
                    if (e.target.checked) {
                      setAbsorverTaxa(false);
                    }
                  }}
                />
              }
              label="Repassar taxa para o comprador"
              sx={{ mb: 2 }}
            />
          </Box>
        )}

        {step === 1 && ingressoType === 'Gratuito' && (
          <Box>
            <TextField
              fullWidth
              label="Nome do Ingresso"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Total de ingressos disponíveis"
              type="number"
              value={totalIngressos}
              onChange={(e) => setTotalIngressos(parseInt(e.target.value, 10))}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Disponível a partir de"
              type="date"
              value={inicioVendas}
              onChange={(e) => setInicioVendas(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Encerrar em"
              type="date"
              value={fimVendas}
              onChange={(e) => setFimVendas(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />

            {/* Seleção de Visibilidade */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="visibilidade-label">Visibilidade</InputLabel>
              <Select
                labelId="visibilidade-label"
                id="visibilidade"
                value={visibilidade}
                label="Visibilidade"
                onChange={(e) => setVisibilidade(e.target.value as 'publico' | 'privado')}
              >
                <MenuItem value="publico">Público</MenuItem>
                <MenuItem value="privado">Privado</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {step > 0 && (
          <Button onClick={handleBack} sx={{ mr: 2 }}>
            Voltar
          </Button>
        )}
        {step === steps.length - 1 ? (
          <Button onClick={handleSave} color="primary" variant="contained">
            Salvar
          </Button>
        ) : (
          <Button onClick={handleNext} color="primary" variant="contained">
            Próximo
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TicketsAndValues;
