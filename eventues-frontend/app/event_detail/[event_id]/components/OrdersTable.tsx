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
  TablePagination
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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const filteredOrders = orders.filter(o => {
    // Verificar se idPedido existe antes de chamar toLowerCase
    const pedidoId = o.idPedido || '';
    return pedidoId.toLowerCase().includes(search.toLowerCase());
  });
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
            Todos os Pedidos
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
        <TextField
          label="Buscar por ID"
          variant="outlined"
          size="small"
          value={search}
          onClick={e => e.stopPropagation()}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: '250px' }}
        />
      </Box>
      <CardContent sx={{ pt: 0 }}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 'none', maxHeight: 500, overflowY: 'auto' }}>
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
