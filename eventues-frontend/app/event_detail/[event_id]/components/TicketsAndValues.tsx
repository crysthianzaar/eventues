'use client';

import React, { useState } from 'react';
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
  Fab,
  IconButton,
  Tooltip,
  Checkbox,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { useTheme } from '@mui/material/styles';

type Ingresso = {
  id: string;
  nome: string;
  tipo: 'Simples' | 'Lotes' | 'Gratuito';
  valor: number;
  lotes?: Lote[];
  taxaServico: 'absorver' | 'repassar';
  visibilidade: 'publico' | 'privado';
};

type Lote = {
  valor: number;
  quantidade: number;
  viradaProximoLote: {
    data: string;
    quantidade: number;
  };
};

const ClientIngressosPage: React.FC = () => {
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [step, setStep] = useState(0); // Stepper state
  const [ingressoType, setIngressoType] = useState<'Simples' | 'Lotes' | 'Gratuito'>('Simples');

  const theme = useTheme();

  const handleCreate = () => {
    setModalOpen(true);
    setStep(0); // Reset stepper when opening modal
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Box sx={{ position: 'relative', padding: 4 }}>
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
        <IngressosList ingressos={ingressos} />
      )}
      <IngressoModal
        open={modalOpen}
        onClose={handleCloseModal}
        step={step}
        setStep={setStep}
        ingressoType={ingressoType}
        setIngressoType={setIngressoType}
      />
    </Box>
  );
};

interface IngressosListProps {
  ingressos: Ingresso[];
}

const IngressosList: React.FC<IngressosListProps> = ({ ingressos }) => {
  return (
    <Grid container spacing={3}>
      {ingressos.map((ingresso, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ConfirmationNumberIcon />
                {ingresso.nome}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tipo: {ingresso.tipo}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Taxa de serviço: {ingresso.taxaServico === 'absorver' ? 'Absorvida' : 'Repassada'}
              </Typography>
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
}

const IngressoModal: React.FC<IngressoModalProps> = ({
  open,
  onClose,
  step,
  setStep,
  ingressoType,
  setIngressoType,
}) => {
  const steps = ['Escolher tipo de ingresso', 'Definir detalhes'];

  const [lotes, setLotes] = useState<Lote[]>([
    { valor: 0, quantidade: 100, viradaProximoLote: { data: '', quantidade: 0 } },
    { valor: 0, quantidade: 50, viradaProximoLote: { data: '', quantidade: 0 } },
  ]);

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

  const handleSave = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AddIcon />
        Criar Ingresso
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
            <TextField fullWidth label="Nome do Ingresso" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField fullWidth label="Total de ingressos disponíveis" type="number" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField
              fullWidth
              label="Valor do Ingresso"
              type="text"
              sx={{ mb: 2 }}
              InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={(e) => {
              const value = e.target.value.replace('.', ',');
              const regex = /^\d*(,\d{0,2})?$/;
              if (regex.test(value)) {
                e.target.value = value;
              }
              }}
            />
            <TextField fullWidth label="Início das vendas" type="date" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField fullWidth label="Fim das vendas" type="date" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
            <FormControlLabel
              control={<Checkbox checked={true} onChange={() => {}} />}
              label="Absorver taxa"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={<Checkbox checked={false} onChange={() => {}} />}
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

                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 'bold', textTransform: 'uppercase' }}
                >
                  Lote {index + 1}
                </Typography>

                {/* Valor do ingresso */}
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
                  />
                </Grid>

                {/* Virada para o próximo lote - Somente exibir se não for o último lote */}
                {index !== lotes.length - 1 && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      Virada para o próximo lote
                    </Typography>

                    <Grid container spacing={3}>
                      {/* Virar na seguinte data */}
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

                      {/* Vira após vender */}
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
                    </Grid>

                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                      Vira para o próximo lote após a data selecionada e/ou após vender a quantidade especificada.
                    </Typography>
                  </Box>
                )}

                {/* Último Lote - não exibir virada de lote */}
                {index === lotes.length - 1 && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Este é o lote final. Ele continuará à venda até o fim das vendas ou até que todos os ingressos sejam vendidos.
                  </Typography>
                )}

                {/* Botão de deletar lote */}
                {lotes.length > 2 && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
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
                  </Box>
                )}
              </Box>
            ))}

            <Button variant="outlined" onClick={handleAddLote} sx={{ mt: 2 }}>
              + Adicionar Lote
            </Button>
          </Box>
        )}

        {/* Outros tipos de ingresso como Simples e Gratuito podem ser ajustados abaixo */}
        {step === 1 && ingressoType === 'Simples' && (
            <Box>
            <TextField fullWidth label="Nome do Ingresso" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField fullWidth label="Total de ingressos disponíveis" type="number" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField
              fullWidth
              label="Valor do Ingresso"
              type="text"
              sx={{ mb: 2 }}
              InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={(e) => {
              const value = e.target.value.replace('.', ',');
              const regex = /^\d*(,\d{0,2})?$/;
              if (regex.test(value)) {
                e.target.value = value;
              }
              }}
            />
            <TextField fullWidth label="Início das vendas" type="date" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField fullWidth label="Fim das vendas" type="date" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
            <FormControlLabel
              control={<Checkbox checked={true} onChange={() => {}} />}
              label="Absorver taxa"
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={<Checkbox checked={false} onChange={() => {}} />}
              label="Repassar taxa para o comprador"
              sx={{ mb: 2 }}
            />
            </Box>
        )}
        {step === 1 && ingressoType === 'Gratuito' && (
          <Box>
            <TextField fullWidth label="Nome do Ingresso" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField fullWidth label="Total de ingressos disponíveis" type="number" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField fullWidth label="Disponível a partir de" type="date" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField fullWidth label="Encerrar em" type="date" sx={{ mb: 2 }} slotProps={{ inputLabel: { shrink: true } }} />
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

export default ClientIngressosPage;
