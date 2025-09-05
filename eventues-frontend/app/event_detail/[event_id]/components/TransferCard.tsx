'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import {
  AccountBalance as BankIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  MonetizationOn as MoneyIcon
} from '@mui/icons-material';
import { getEventDashboard, DashboardStats } from '../apis/dashboardApi';
import { 
  getTransferRequests, 
  createTransferRequest, 
  getTransferSummary,
  TransferRequest,
  TransferSummary,
  CreateTransferRequest
} from '../apis/transferApi';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase';

// Função auxiliar para formatação de preço
const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

interface TransferCardProps {
  eventId: string;
  onNotify: (message: string, severity: 'success' | 'error' | 'warning' | 'info') => void;
}

const TransferCard: React.FC<TransferCardProps> = ({ eventId, onNotify }) => {
  const [user] = useAuthState(auth);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [requestAmount, setRequestAmount] = useState(0);
  const [isAdvance, setIsAdvance] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Carregar dados do dashboard e histórico de repasses
  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (user) {
        const token = await user.getIdToken();
        
        // Carregar dados do dashboard
        const dashboard = await getEventDashboard(eventId, token);
        setDashboardData(dashboard);
        
        // Carregar histórico de repasses
        const transfers = await getTransferRequests(eventId, token);
        setTransferRequests(transfers);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      onNotify('Erro ao carregar dados de repasse', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTransfer = async () => {
    if (!dashboardData || !user) return;
    
    try {
      setSubmitting(true);
      
      // Validações
      if (requestAmount <= 0) {
        onNotify('Valor deve ser maior que zero', 'error');
        return;
      }
      
      const maxAmount = isAdvance ? dashboardData.valorPendente + dashboardData.valorAReceber : dashboardData.valorAReceber;
      
      if (requestAmount > maxAmount) {
        onNotify(`Valor máximo disponível: ${formatPrice(maxAmount)}`, 'error');
        return;
      }
      
      // Criar solicitação de repasse via API
      const token = await user.getIdToken();
      const requestData: CreateTransferRequest = {
        amount: requestAmount,
        is_advance: isAdvance
      };
      
      const newRequest = await createTransferRequest(eventId, token, requestData);
      
      setTransferRequests(prev => [newRequest, ...prev]);
      setDialogOpen(false);
      setRequestAmount(0);
      setIsAdvance(false);
      
      onNotify('Solicitação de repasse enviada com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao solicitar repasse:', error);
      onNotify('Erro ao solicitar repasse', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: TransferRequest['status']) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PROCESSING': return 'info';
      case 'APPROVED': return 'primary';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: TransferRequest['status']) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircleIcon />;
      case 'PROCESSING': return <TrendingUpIcon />;
      case 'APPROVED': return <CheckCircleIcon />;
      case 'PENDING': return <ScheduleIcon />;
      case 'REJECTED': return <CancelIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const getStatusText = (status: TransferRequest['status']) => {
    switch (status) {
      case 'COMPLETED': return 'Concluído';
      case 'PROCESSING': return 'Processando';
      case 'APPROVED': return 'Aprovado';
      case 'PENDING': return 'Pendente';
      case 'REJECTED': return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const availableAmount = dashboardData?.valorAReceber || 0;
  const pendingAmount = dashboardData?.valorPendente || 0;
  const maxAdvanceAmount = availableAmount + pendingAmount;

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Solicitação de Repasse
          </Typography>
          
          {/* Resumo de valores disponíveis */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <MoneyIcon />
                  <Box>
                    <Typography variant="body2">Disponível para Repasse</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatPrice(availableAmount)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <WarningIcon />
                  <Box>
                    <Typography variant="body2">Pendente (Adiantamento)</Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatPrice(pendingAmount)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            startIcon={<BankIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={availableAmount <= 0}
            fullWidth
            sx={{ mb: 3 }}
          >
            Solicitar Repasse
          </Button>

          {availableAmount <= 0 && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Não há valores disponíveis para repasse no momento.
            </Alert>
          )}

          {/* Histórico de repasses */}
          <Typography variant="h6" gutterBottom>
            Histórico de Repasses
          </Typography>
          
          {transferRequests.length === 0 ? (
            <Alert severity="info">
              Nenhuma solicitação de repasse encontrada.
            </Alert>
          ) : (
            <List>
              {transferRequests.map((request, index) => (
                <React.Fragment key={request.id}>
                  <ListItem>
                    <ListItemIcon>
                      {getStatusIcon(request.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight="bold">
                            {formatPrice(request.amount)}
                          </Typography>
                          <Chip
                            label={getStatusText(request.status)}
                            color={getStatusColor(request.status)}
                            size="small"
                          />
                          {request.type === 'ADVANCE' && (
                            <Chip label="Adiantamento" size="small" variant="outlined" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Solicitado em: {new Date(request.requested_at).toLocaleDateString('pt-BR')}
                          </Typography>
                          {request.fee && (
                            <Typography variant="body2" color="text.secondary">
                              Taxa: {formatPrice(request.fee)}
                            </Typography>
                          )}
                          {request.estimated_date && (
                            <Typography variant="body2" color="text.secondary">
                              Previsão: {new Date(request.estimated_date).toLocaleDateString('pt-BR')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < transferRequests.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Dialog para solicitar repasse */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Solicitar Repasse</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              label="Valor do Repasse"
              type="text"
              value={requestAmount === 0 ? '' : requestAmount.toString()}
              onChange={(e) => {
                const value = e.target.value;
                // Remove caracteres não numéricos exceto ponto e vírgula
                const cleanValue = value.replace(/[^0-9.,]/g, '');
                // Converte vírgula para ponto
                const normalizedValue = cleanValue.replace(',', '.');
                // Converte para número ou 0 se vazio
                const numericValue = normalizedValue === '' ? 0 : parseFloat(normalizedValue) || 0;
                setRequestAmount(numericValue);
              }}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
              }}
              helperText={`Máximo disponível: ${formatPrice(isAdvance ? maxAdvanceAmount : availableAmount)}`}
              placeholder="0,00"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isAdvance}
                  onChange={(e) => setIsAdvance(e.target.checked)}
                />
              }
              label="Solicitar adiantamento (inclui valores pendentes)"
            />

            {isAdvance && (
              <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">
                  <strong>Adiantamento:</strong> Taxa de 5% será aplicada sobre o valor solicitado.
                  Valor da taxa: {formatPrice(requestAmount * 0.05)}
                </Typography>
              </Alert>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                O repasse será feito para a carteira cadastrada em sua conta de organizador.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleRequestTransfer}
            variant="contained"
            disabled={submitting || requestAmount <= 0}
          >
            {submitting ? <CircularProgress size={20} /> : 'Solicitar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TransferCard;
