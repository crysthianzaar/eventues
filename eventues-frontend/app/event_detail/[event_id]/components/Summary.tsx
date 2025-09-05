// components/OrganizatorEventDetails/Summary.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert, 
  Button,
  Chip,
  Paper
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PendingIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PieChartIcon from '@mui/icons-material/PieChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useParams } from 'next/navigation';
import { getEventDashboard, DashboardStats } from '../apis/dashboardApi';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase';
import { formatPrice } from '@/app/utils/formatPrice';
import OrdersTable from './OrdersTable';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';

// Paleta de cores Eventues
const colors = {
  primary: "#5A67D8",
  green: "#48BB78",
  red: "#F56565",
  grayDark: "#2D3748",
  yellow: "#ECC94B",
  white: "#FFFFFF",
};

const Summary: React.FC = () => {
  const params = useParams();
  const eventId = params?.event_id as string;
  const [user] = useAuthState(auth);
  
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!eventId || !user) {
        setLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const data = await getEventDashboard(eventId, token);
        setDashboardData(data);
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError('Não foi possível carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [eventId, user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: { xs: '20px', md: '40px' } }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Usar dados reais ou fallback para zeros
  const data = dashboardData || {
    receitaTotal: 0,
    valorConfirmado: 0,
    valorPendente: 0,
    valorRepassado: 0,
    valorCancelado: 0,
    receitaLiquida: 0,
    valorAReceber: 0,
    visualizacoes: 0,
    taxaConversao: 0,
    totalPedidos: 0,
    pedidosConfirmados: 0,
    pedidosPendentes: 0,
    pedidosCancelados: 0,
    metodosPagamento: { cartaoCredito: 0, pix: 0, boleto: 0, outros: 0 },
    pedidos: []
  };

  // Verificar se há vendas para decidir o que mostrar no gráfico
  const hasOrders = data.totalPedidos > 0;

  // Quick actions for organizers
  const handleShareEvent = () => {
    console.log('Share event');
  };

  const handleEditEvent = () => {
    console.log('Edit event');
  };

  const handleViewAnalytics = () => {
    console.log('View analytics');
  };

  return (
    <Box
      sx={{
        padding: { xs: '16px', md: '24px' },
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
      }}
    >

      {/* Key Metrics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Receita Total - Destaque Principal */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)',
              color: 'white',
              height: '140px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <CardContent sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                    Receita Total
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {formatPrice(data.receitaTotal)}
                  </Typography>
                  <Chip 
                    label={`${data.totalPedidos} pedidos`}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      mt: 1
                    }}
                  />
                </Box>
                <TrendingUpIcon sx={{ fontSize: 60, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Taxa de Conversão - Métrica Chave */}
        <Grid item xs={12} md={6}>
          <Card 
            sx={{ 
              background: 'linear-gradient(135deg, #5A67D8 0%, #4C51BF 100%)',
              color: 'white',
              height: '140px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <CardContent sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                    Conversão
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {data.taxaConversao}%
                  </Typography>
                  <Chip 
                    label={`${data.visualizacoes} visualizações do evento`}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      mt: 1
                    }}
                  />
                </Box>
                <AnalyticsIcon sx={{ fontSize: 60, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status das Vendas */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '120px', display: 'flex', alignItems: 'center' }}>
            <CardContent sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PendingIcon sx={{ color: colors.yellow, fontSize: 32 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pendentes
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatPrice(data.valorPendente)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '120px', display: 'flex', alignItems: 'center' }}>
            <CardContent sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CancelIcon sx={{ color: colors.red, fontSize: 32 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Canceladas
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatPrice(data.valorCancelado)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '120px', display: 'flex', alignItems: 'center' }}>
            <CardContent sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AttachMoneyIcon sx={{ color: colors.green, fontSize: 32 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    A Receber
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatPrice(data.valorAReceber)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '120px', display: 'flex', alignItems: 'center' }}>
            <CardContent sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ color: colors.primary, fontSize: 32 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Repassado
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatPrice(data.valorRepassado)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '400px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Histórico de Vendas
              </Typography>
              {hasOrders ? (
                <Box sx={{ height: '320px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={(() => {
                        const sortedPedidos = data.pedidos
                          .slice()
                          .sort((a: any, b: any) => {
                            if (!a.data || !b.data) return 0;
                            return new Date(a.data).getTime() - new Date(b.data).getTime();
                          });
                        
                        let acumulado = 0;
                        return sortedPedidos.map((pedido: any) => {
                          acumulado += pedido.valor;
                          return {
                            data: pedido.data ? format(parseISO(pedido.data), 'dd/MM') : 'N/A',
                            valorAcumulado: acumulado,
                            status: pedido.status,
                          };
                        });
                      })()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis tickFormatter={(value) => formatPrice(value)} />
                      <Tooltip 
                        formatter={(value: any) => [formatPrice(value), 'Receita Acumulada']}
                        contentStyle={{ backgroundColor: colors.white, borderRadius: '8px' }}
                      />
                      <Area 
                        type="monotone"
                        dataKey="valorAcumulado" 
                        stroke={colors.primary}
                        fill={`${colors.primary}33`}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <ShowChartIcon sx={{ color: colors.primary, fontSize: 80, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Nenhuma venda registrada
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    As vendas aparecerão aqui quando começarem
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '400px' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Métodos de Pagamento
              </Typography>
              {Object.values(data.metodosPagamento).some((value: number) => value > 0) ? (
                <Box sx={{ height: '320px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Cartão', value: data.metodosPagamento.cartaoCredito },
                          { name: 'PIX', value: data.metodosPagamento.pix },
                          { name: 'Boleto', value: data.metodosPagamento.boleto },
                          { name: 'Outros', value: data.metodosPagamento.outros }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {[colors.primary, colors.green, colors.yellow, colors.red].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} pedido${value !== 1 ? 's' : ''}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <PieChartIcon sx={{ color: colors.primary, fontSize: 80, mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Nenhum pagamento
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dados aparecerão após as primeiras vendas
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Enhanced Orders Table with Filtering */}
      {data.pedidos && data.pedidos.length > 0 && (
        <OrdersTable orders={data.pedidos} />
      )}
    </Box>
  );
};

export default Summary;
