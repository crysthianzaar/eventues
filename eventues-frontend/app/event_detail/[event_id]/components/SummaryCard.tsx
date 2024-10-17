// components/OrganizatorEventDetails/Dashboard.tsx

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, IconButton, Tooltip } from '@mui/material';
import { format } from 'date-fns';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PendingIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';

// Paleta de cores Eventues
const colors = {
  primary: "#5A67D8",
  green: "#48BB78",
  red: "#F56565",
  grayDark: "#2D3748",
  yellow: "#ECC94B",
  white: "#FFFFFF",
};

interface EventDetail {
  totalSales: number;
  pendingSales: number;
  canceledSales: number;
  netRevenue: number;
  alreadyPaid: number;
  toReceive: number;
  views: number;
  conversionRate: number;
}

const Dashboard: React.FC = () => {
  // Mock de dados para o dashboard
  const eventDetail: EventDetail = {
    totalSales: 0,
    pendingSales: 0,
    canceledSales: 0,
    netRevenue: 0,
    alreadyPaid: 0,
    toReceive: 0,
    views: 1,
    conversionRate: 0,
  };

  return (
    <Box
      sx={{
        padding: { xs: '20px', md: '40px' },
        maxWidth: { xs: '100%', md: '1400px' },
        margin: '0 auto',
        backgroundColor: colors.white,
        borderRadius: '10px',
      }}
    >
      <Grid container spacing={4}>
        {/* Total de Vendas */}
        <Grid item xs={12} sm={4}>
            <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MonetizationOnIcon sx={{ color: colors.green, fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color={colors.grayDark}>
                    Total de vendas
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    R$ {eventDetail.totalSales.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Vendas Pendentes */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PendingIcon sx={{ color: colors.yellow, fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color={colors.grayDark}>
                    Vendas pendentes
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    R$ {eventDetail.pendingSales.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Vendas Canceladas */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CancelIcon sx={{ color: colors.red, fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color={colors.grayDark}>
                    Canceladas e reembolsadas
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    R$ {eventDetail.canceledSales.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de vendas - Mock simples */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
              <Typography variant="body2" color={colors.grayDark}>
                Histórico de vendas
              </Typography>
              <Box sx={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ShowChartIcon sx={{ color: colors.primary, fontSize: 50 }} />
                <Typography variant="h6" color={colors.grayDark} sx={{ ml: 2 }}>
                  Nenhuma venda registrada.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Receita Líquida */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AccountBalanceWalletIcon sx={{ color: colors.green, fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color={colors.grayDark}>
                    Receita líquida
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    R$ {eventDetail.netRevenue.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Valor já repassado */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircleIcon sx={{ color: colors.primary, fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color={colors.grayDark}>
                    Valor já repassado
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    R$ {eventDetail.alreadyPaid.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Valor a receber */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AttachMoneyIcon sx={{ color: colors.green, fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color={colors.grayDark}>
                    Valor a receber
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    R$ {eventDetail.toReceive.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Visitas à página do evento */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <VisibilityIcon sx={{ color: colors.primary, fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color={colors.grayDark}>
                    Visitas à página do evento
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {eventDetail.views}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Taxa de conversão */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PieChartIcon sx={{ color: colors.yellow, fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color={colors.grayDark}>
                    Taxa de conversão
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {eventDetail.conversionRate}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
