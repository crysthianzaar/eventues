"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Grid,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Add, Edit, Delete, ContentCopy } from '@mui/icons-material';
import { useParams } from 'next/navigation';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import api from '../apis/api';

// Tipos
interface Coupon {
  coupon_id: string;
  event_id: string;
  code: string;
  discount_value: number;
  discount_type: 'percentage' | 'fixed';
  min_purchase: number;
  max_discount: number | null;
  max_uses: number | null;
  uses_count: number;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface CouponsCardProps {
  eventId: string;
  onNotify: (message: string, severity: 'success' | 'error' | 'info' | 'warning') => void;
}

const CouponsCard: React.FC<CouponsCardProps> = ({ eventId, onNotify }) => {
  // Estados
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('Novo Cupom');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Formulário para cupom
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    discount_value: 0,
    discount_type: 'percentage',
    min_purchase: 0,
    max_discount: null,
    max_uses: null,
    start_date: null,
    end_date: null,
    active: true,
  });

  // Buscar cupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${eventId}/coupons`);
      
      // Add type assertion for response data
      const responseData = response.data as { success: boolean; coupons?: Coupon[] };
      
      if (responseData.success) {
        setCoupons(responseData.coupons || []);
      } else {
        onNotify('Erro ao buscar cupons', 'error');
      }
    } catch (error) {
      console.error('Erro ao buscar cupons:', error);
      onNotify('Erro ao buscar cupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Carregar cupons quando o componente montar
  useEffect(() => {
    if (eventId) {
      fetchCoupons();
    }
  }, [eventId]);

  // Abrir modal para criar um novo cupom
  const handleOpenCreateDialog = () => {
    setFormData({
      code: '',
      discount_value: 0,
      discount_type: 'percentage',
      min_purchase: 0,
      max_discount: null,
      max_uses: null,
      start_date: null,
      end_date: null,
      active: true,
    });
    setDialogTitle('Novo Cupom');
    setIsEditing(false);
    setOpenDialog(true);
  };

  // Abrir modal para editar um cupom existente
  const handleOpenEditDialog = (coupon: Coupon) => {
    setFormData({
      coupon_id: coupon.coupon_id,
      code: coupon.code,
      discount_value: coupon.discount_value ?? 0,
      discount_type: coupon.discount_type || 'percentage',
      min_purchase: coupon.min_purchase || 0,
      max_discount: coupon.max_discount !== null ? coupon.max_discount : null,
      max_uses: coupon.max_uses !== null ? coupon.max_uses : null,
      start_date: coupon.start_date || null,
      end_date: coupon.end_date || null,
      active: coupon.active !== undefined ? coupon.active : true,
    });
    setDialogTitle('Editar Cupom');
    setIsEditing(true);
    setOpenDialog(true);
  };

  // Fechar modal
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Atualizar campo do formulário
  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Formatar data para exibição
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return dayjs(dateString).format('DD/MM/YYYY');
    } catch (error) {
      return dateString;
    }
  };

  // Copiar código para a área de transferência
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopySuccess(code);
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(err => {
        console.error('Erro ao copiar:', err);
      });
  };

  // Salvar cupom (criar ou editar)
  const handleSaveCoupon = async () => {
    try {
      // Validações básicas
      if (!formData.code || formData.discount_value === undefined || formData.discount_value === null) {
        setSnackbar({
          open: true,
          message: 'Código e valor do desconto são obrigatórios.',
          severity: 'error',
        });
        return;
      }

      // Prepare data for API
      const data = {
        ...formData,
        code: formData.code.toUpperCase(), // Padronizar código para maiúsculas
      };

      let response;
      if (isEditing) {
        // Atualizar cupom existente
        response = await api.put(`/events/${eventId}/coupons/${formData.coupon_id}`, data);
      } else {
        // Criar novo cupom
        response = await api.post(`/events/${eventId}/coupons`, data);
      }

      // Add type assertion for response data
      const responseData = response.data as { success: boolean; message?: string };

      if (responseData.success) {
        // Fechar o modal
        setOpenDialog(false);
        // Atualizar a lista de cupons
        fetchCoupons();
        
        // Notificar sucesso
        onNotify(
          isEditing ? 'Cupom atualizado com sucesso!' : 'Cupom criado com sucesso!',
          'success'
        );
      } else {
        setSnackbar({
          open: true,
          message: responseData.message || 'Erro ao salvar o cupom.',
          severity: 'error',
        });
      }
    } catch (error: any) {
      console.error('Erro ao salvar cupom:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Erro ao salvar o cupom.',
        severity: 'error',
      });
    }
  };

  // Abrir confirmação de exclusão
  const handleOpenDeleteConfirm = (couponId: string) => {
    setCouponToDelete(couponId);
    setConfirmDeleteOpen(true);
  };

  // Fechar confirmação de exclusão
  const handleCloseDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
    setCouponToDelete(null);
  };

  // Excluir cupom
  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;
    
    try {
      const response = await api.delete(`/events/${eventId}/coupons/${couponToDelete}`);
      
      // Add type assertion for response data
      const responseData = response.data as { success: boolean; message?: string };
      
      if (responseData.success) {
        // Fechar o modal de confirmação
        setConfirmDeleteOpen(false);
        setCouponToDelete(null);
        
        // Atualizar a lista de cupons
        fetchCoupons();
        
        // Notificar sucesso
        onNotify('Cupom excluído com sucesso!', 'success');
      } else {
        setSnackbar({
          open: true,
          message: responseData.message || 'Erro ao excluir o cupom.',
          severity: 'error',
        });
      }
    } catch (error: any) {
      console.error('Erro ao excluir cupom:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Erro ao excluir o cupom.',
        severity: 'error',
      });
    } finally {
      handleCloseDeleteConfirm();
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" color="primary">
          Cupons de Desconto
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={handleOpenCreateDialog}
        >
          Novo Cupom
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : coupons.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          Nenhum cupom cadastrado. Crie seu primeiro cupom de desconto!
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 3, mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Compra Mínima</TableCell>
                <TableCell>Uso Máximo</TableCell>
                <TableCell>Validade</TableCell>
                <TableCell>Usos</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.coupon_id}>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Typography sx={{ fontWeight: 'bold', mr: 1 }}>
                        {coupon.code}
                      </Typography>
                      <Tooltip title={copySuccess === coupon.code ? "Copiado!" : "Copiar código"}>
                        <IconButton size="small" onClick={() => handleCopyCode(coupon.code)}>
                          <ContentCopy fontSize="small" color={copySuccess === coupon.code ? "primary" : "action"} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}%` 
                      : `R$ ${coupon.discount_value.toFixed(2)}`}
                    {coupon.max_discount && coupon.discount_type === 'percentage' && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Máx: R$ {coupon.max_discount.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {coupon.min_purchase > 0 
                      ? `R$ ${coupon.min_purchase.toFixed(2)}` 
                      : 'Sem mínimo'}
                  </TableCell>
                  <TableCell>
                    {coupon.max_uses ? coupon.max_uses : 'Ilimitado'}
                  </TableCell>
                  <TableCell>
                    {coupon.start_date && (
                      <Typography variant="body2">
                        De: {formatDate(coupon.start_date)}
                      </Typography>
                    )}
                    {coupon.end_date && (
                      <Typography variant="body2">
                        Até: {formatDate(coupon.end_date)}
                      </Typography>
                    )}
                    {!coupon.start_date && !coupon.end_date && 'Sem validade'}
                  </TableCell>
                  <TableCell>
                    {coupon.uses_count} {coupon.max_uses ? `/ ${coupon.max_uses}` : ''}
                  </TableCell>
                  <TableCell>
                    <Box 
                      sx={{ 
                        bgcolor: coupon.active ? 'success.main' : 'error.main',
                        color: 'white',
                        py: 0.5,
                        px: 1.5,
                        borderRadius: 1,
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {coupon.active ? 'Ativo' : 'Inativo'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleOpenEditDialog(coupon)}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleOpenDeleteConfirm(coupon.coupon_id)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de Criação/Edição de Cupom */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Código do Cupom"
                fullWidth
                margin="normal"
                value={formData.code}
                onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
                required
                inputProps={{ maxLength: 20 }}
                helperText="Ex: DESCONTO10, BLACKFRIDAY, etc."
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Tipo de Desconto</InputLabel>
                <Select
                  value={formData.discount_type}
                  label="Tipo de Desconto"
                  onChange={(e) => handleFormChange('discount_type', e.target.value)}
                >
                  <MenuItem value="percentage">Percentual (%)</MenuItem>
                  <MenuItem value="fixed">Valor Fixo (R$)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label={formData.discount_type === 'percentage' ? 'Valor do Desconto (%)' : 'Valor do Desconto (R$)'}
                fullWidth
                margin="normal"
                type="number"
                value={formData.discount_value}
                onChange={(e) => handleFormChange('discount_value', parseFloat(e.target.value) || 0)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {formData.discount_type === 'percentage' ? '%' : 'R$'}
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Compra Mínima (R$)"
                fullWidth
                margin="normal"
                type="number"
                value={formData.min_purchase}
                onChange={(e) => handleFormChange('min_purchase', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
                helperText="Valor mínimo da compra para o cupom ser válido"
              />
            </Grid>

            {formData.discount_type === 'percentage' && (
              <Grid item xs={12} md={6}>
                <TextField
                  label="Desconto Máximo (R$)"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={formData.max_discount !== null ? formData.max_discount : ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : null;
                    handleFormChange('max_discount', value);
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  helperText="Limite máximo de desconto (opcional)"
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                label="Limite de Usos"
                fullWidth
                margin="normal"
                type="number"
                value={formData.max_uses !== null ? formData.max_uses : ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : null;
                  handleFormChange('max_uses', value);
                }}
                helperText="Número máximo de vezes que o cupom pode ser usado (opcional)"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                Período de Validade
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                <DatePicker
                  label="Data Inicial"
                  value={formData.start_date ? dayjs(formData.start_date) : null}
                  onChange={(date) => handleFormChange('start_date', date ? date.toISOString() : null)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      helperText: 'A partir de quando o cupom é válido (opcional)'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                <DatePicker
                  label="Data Final"
                  value={formData.end_date ? dayjs(formData.end_date) : null}
                  onChange={(date) => handleFormChange('end_date', date ? date.toISOString() : null)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      helperText: 'Até quando o cupom é válido (opcional)'
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => handleFormChange('active', e.target.checked)}
                    color="primary"
                  />
                }
                label="Cupom Ativo"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSaveCoupon} color="primary" variant="contained">
            {isEditing ? 'Atualizar' : 'Criar'} Cupom
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <Dialog open={confirmDeleteOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDeleteCoupon} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CouponsCard;
