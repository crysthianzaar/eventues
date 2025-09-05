'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Link, 
  Collapse,
  TextField,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Button
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import { formatPrice } from '@/app/utils/formatPrice';

// Paleta de cores Eventues
const colors = {
  primary: "#5A67D8",
  green: "#48BB78",
  red: "#F56565",
  grayDark: "#2D3748",
  yellow: "#ECC94B",
  white: "#FFFFFF",
};

interface Order {
  idPedido: string;
  status: string;
  valor: number;
  total_amount: number;
  fee_amount: number;
  payment_url: string;
  data: string;
  metodoPagamento: string;
  nomeParticipante?: string;
}

interface OrdersTableProps {
  orders: Order[];
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  // Estado para controlar se estamos no cliente ou servidor
  const [isClient, setIsClient] = useState(false);
  
  // Efeito para garantir que renderizamos componentes interativos apenas no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);
  const [open, setOpen] = useState(true); // Show expanded by default
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getStatusColor = (status: string) => {
    if (status === 'CONFIRMADO' || status === 'CONFIRMED' || status === 'RECEIVED') {
      return colors.green;
    } else if (status === 'CANCELADO' || status === 'REFUNDED' || status === 'DELETED') {
      return colors.red;
    }
    return colors.yellow;
  };

  const formatDate = (dateString: string) => {
    try {
      return dateString ? format(parseISO(dateString), 'dd/MM/yyyy HH:mm') : 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  if (!orders || orders.length === 0) {
    return null;
  }

  // Get unique payment methods and statuses for filter options
  const uniquePaymentMethods = Array.from(new Set(orders.map(o => o.metodoPagamento).filter(Boolean)));
  const uniqueStatuses = Array.from(new Set(orders.map(o => o.status).filter(Boolean)));

  const filteredOrders = orders.filter(o => {
    // Search filter (ID do pedido or participant name)
    const searchTerm = search.toLowerCase();
    const matchesSearch = !search || 
      (o.idPedido || '').toLowerCase().includes(searchTerm) ||
      (o.nomeParticipante || '').toLowerCase().includes(searchTerm);

    // Status filter
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    // Payment method filter
    const matchesPaymentMethod = paymentMethodFilter === 'all' || o.metodoPagamento === paymentMethodFilter;

    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPaymentMethodFilter('all');
    setPage(0);
  };
  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)', mt: 4 }}>
      {/* Card Header as Toggle */}
      <Box
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(!open); }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          cursor: 'pointer',
          borderBottom: open ? `2px solid ${colors.primary}` : '1px solid #e2e8f0',
          backgroundColor: open ? '#f6f8fc' : '#fff',
          transition: 'background 0.2s',
          '&:hover, &:focus': {
            backgroundColor: '#f0f4fa',
          },
          borderTopLeftRadius: '10px',
          borderTopRightRadius: '10px',
          userSelect: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" color={colors.grayDark} sx={{ fontWeight: 700 }}>
            Todos os Pedidos ({filteredOrders.length})
          </Typography>
          <KeyboardArrowDownIcon
            sx={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: colors.primary,
              ml: 1,
            }}
            aria-label={open ? 'Recolher pedidos' : 'Expandir pedidos'}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={`${filteredOrders.length} de ${orders.length} pedidos`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>
      <CardContent sx={{ pt: 0 }}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          {/* Filters Section */}
          <Box sx={{ mt: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Buscar por ID ou Nome"
                  variant="outlined"
                  size="small"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(0); }}
                  placeholder="Digite ID do pedido ou nome..."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                  >
                    <MenuItem value="all">Todos os Status</MenuItem>
                    {uniqueStatuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Método de Pagamento</InputLabel>
                  <Select
                    value={paymentMethodFilter}
                    label="Método de Pagamento"
                    onChange={e => { setPaymentMethodFilter(e.target.value); setPage(0); }}
                  >
                    <MenuItem value="all">Todos os Métodos</MenuItem>
                    {uniquePaymentMethods.map(method => (
                      <MenuItem key={method} value={method}>{method}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={clearFilters}
                  disabled={search === '' && statusFilter === 'all' && paymentMethodFilter === 'all'}
                >
                  Limpar Filtros
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          <TableContainer component={Paper} sx={{ boxShadow: 'none', maxHeight: 500, overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>ID do Pedido</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Método</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Valor a Receber</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Taxa</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Valor Total Pago</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Comprovante</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order, index) => {
                  const statusColor = getStatusColor(order.status);
                  
                  return (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: '#f9fafb' },
                        '&:hover': { backgroundColor: '#f1f5f9' }
                      }}
                    >
                      <TableCell>{formatDate(order.data)}</TableCell>
                      <TableCell>{order.idPedido || 'N/A'}</TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            color: statusColor,
                            fontWeight: 'medium',
                            py: 0.5,
                            px: 1,
                            borderRadius: '4px',
                            backgroundColor: `${statusColor}22`
                          }}
                        >
                          {order.status}
                        </Box>
                      </TableCell>
                      <TableCell>{order.metodoPagamento}</TableCell>
                      <TableCell align="right">{formatPrice(order.valor)}</TableCell>
                      <TableCell align="right">{formatPrice(order.fee_amount)}</TableCell>
                      <TableCell align="right">{formatPrice(order.total_amount)}</TableCell>
                      <TableCell align="center">
                        {order.payment_url && isClient && (
                          <IconButton
                            aria-label="ver comprovante"
                            size="small"
                            color="primary"
                            component={Link}
                            href={order.payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ReceiptIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ mt: 1 }}
          />
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default OrdersTable;
