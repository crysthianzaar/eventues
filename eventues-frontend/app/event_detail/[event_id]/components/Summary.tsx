// components/OrganizatorEventDetails/Dashboard.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert } from '@mui/material';
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
import { useParams } from 'next/navigation';
import { getEventDashboard, DashboardStats } from '../apis/dashboardApi';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase';
import { formatPrice } from '@/app/utils/formatPrice';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';
import OrdersTable from './OrdersTable';

// Paleta de cores Eventues
const colors = {
  primary: "#5A67D8",
  green: "#48BB78",
  red: "#F56565",
  grayDark: "#2D3748",
  yellow: "#ECC94B",
  white: "#FFFFFF",
};

const Dashboard: React.FC = () => {
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
    vendasTotais: 0,
    vendasPendentes: 0,
    vendasCanceladas: 0,
    receitaLiquida: 0,
    valorRepassado: 0,
    valorAReceber: 0,
    visualizacoes: 0,
    taxaConversao: 0,
    totalPedidos: 0,
    pedidosConfirmados: 0,
    metodosPagamento: { cartaoCredito: 0, pix: 0, boleto: 0, outros: 0 },
    pedidos: []
  };

  // Verificar se há vendas para decidir o que mostrar no gráfico
  const hasOrders = data.totalPedidos > 0;

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
                    {formatPrice(data.vendasTotais)}
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
                    {formatPrice(data.vendasPendentes)}
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
                    {formatPrice(data.vendasCanceladas)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de vendas com pedidos recentes */}
        <Grid item xs={12}>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
              <Typography variant="body2" color={colors.grayDark} sx={{ mb: 2 }}>
                Histórico de vendas recentes
              </Typography>
              {hasOrders ? (
                <Box sx={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={(() => {
                        // Ordenar pedidos por data
                        const sortedPedidos = data.pedidos
                          .slice()
                          .sort((a, b) => {
                            if (!a.data || !b.data) return 0;
                            return new Date(a.data).getTime() - new Date(b.data).getTime();
                          });
                        
                        // Calcular soma acumulativa
                        let acumulado = 0;
                        
                        return sortedPedidos.map(pedido => {
                          acumulado += pedido.valor;
                          return {
                            data: pedido.data ? format(parseISO(pedido.data), 'dd/MM HH:mm') : 'N/A',
                            valorIndividual: pedido.valor, // Valor da venda individual
                            valorAcumulado: acumulado,     // Soma acumulada até o momento
                            status: pedido.status,
                            metodoPagamento: pedido.metodoPagamento || 'Não especificado'
                          };
                        });
                      })()}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="data" 
                        label={{ value:null, position: 'insideBottomRight', offset: -10 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatPrice(value)}
                        label={{ value: null, angle: -90, position: 'insideLeft', offset: -5 }}
                      />
                      <Tooltip 
                        formatter={(value: any, name: string) => {
                          if (typeof value === 'number') {
                            if (name === 'valorAcumulado') return [formatPrice(value), 'Total acumulado'];
                            if (name === 'valorIndividual') return [formatPrice(value), 'Valor individual'];
                          }
                          return [value, name];
                        }}
                        labelFormatter={(label) => `Data: ${label}`}
                        contentStyle={{ backgroundColor: colors.white, borderRadius: '8px' }}
                      />
                      <Legend />
                      <Area 
                        type="monotone"
                        dataKey="valorAcumulado" 
                        name="Receita acumulada" 
                        stroke={colors.primary}
                        fill={`${colors.primary}33`}
                        strokeWidth={2}
                        activeDot={{ r: 8, stroke: colors.primary, strokeWidth: 2 }}
                      />
                      <Area 
                        type="stepAfter"
                        dataKey="valorIndividual" 
                        name="Valor da venda" 
                        stroke={colors.green}
                        fill={`${colors.green}22`}
                        strokeWidth={1}
                        style={{ opacity: 0.7 }}
                        hide // Escondido por padrão, mas disponível no Legend
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  {/* Tabela de pedidos recentes */}
                  <Typography variant="subtitle1" color={colors.grayDark} fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
                    Detalhes dos pedidos recentes
                  </Typography>
                  <Box sx={{ overflowX: 'auto', mt: 1, border: '1px solid #eee', borderRadius: '8px', p: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: `1px solid ${colors.grayDark}` }}>
                          <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'normal', color: colors.grayDark }}>Data</th>
                          <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'normal', color: colors.grayDark }}>Status</th>
                          <th style={{ textAlign: 'right', padding: '8px', fontWeight: 'normal', color: colors.grayDark }}>Valor</th>
                          <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'normal', color: colors.grayDark }}>Método de Pagamento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.pedidos.map((pedido, index) => {
                          const statusColor = 
                            pedido.status === 'CONFIRMADO' || pedido.status === 'CONFIRMED' || pedido.status === 'RECEIVED' 
                              ? colors.green 
                              : pedido.status === 'CANCELADO' || pedido.status === 'REFUNDED' || pedido.status === 'DELETED' 
                                ? colors.red 
                                : colors.yellow;
                          
                          return (
                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                              <td style={{ padding: '8px' }}>{pedido.data ? format(parseISO(pedido.data), 'dd/MM/yyyy HH:mm') : 'N/A'}</td>
                              <td style={{ padding: '8px' }}>
                                <span style={{ 
                                  color: statusColor, 
                                  fontWeight: 'bold',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: `${statusColor}22`
                                }}>
                                  {pedido.status}
                                </span>
                              </td>
                              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatPrice(pedido.valor)}</td>
                              <td style={{ padding: '8px' }}>{pedido.metodoPagamento || 'Não especificado'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <ShowChartIcon sx={{ color: colors.primary, fontSize: 50 }} />
                  <Typography variant="h6" color={colors.grayDark} sx={{ ml: 2 }}>
                    Nenhuma venda registrada.
                  </Typography>
                </Box>
              )}
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
                    {formatPrice(data.receitaLiquida)}
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
                    {formatPrice(data.valorRepassado)}
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
                    {formatPrice(data.valorAReceber)}
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
                    {data.visualizacoes}
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
                    {data.taxaConversao}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Métodos de pagamento utilizados - Gráfico de Pizza */}
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}>
            <CardContent>
              <Typography variant="body2" color={colors.grayDark} gutterBottom>
                Métodos de pagamento
              </Typography>
              {Object.values(data.metodosPagamento).some(value => value > 0) ? (
                <Box sx={{ height: 200, width: '100%', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Cartão de Crédito', value: data.metodosPagamento.cartaoCredito },
                          { name: 'Pix', value: data.metodosPagamento.pix },
                          { name: 'Boleto', value: data.metodosPagamento.boleto },
                          { name: 'Pendentes', value: data.metodosPagamento.outros }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Cartão de Crédito', color: '#4C51BF' },
                          { name: 'Pix', color: '#48BB78' },
                          { name: 'Boleto', color: '#F6AD55' },
                          { name: 'Pendentes', color: '#A0AEC0' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} pedido${value !== 1 ? 's' : ''}`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum pagamento realizado ainda
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabela completa de pedidos */}
      {data.pedidos && data.pedidos.length > 0 && (
        <OrdersTable orders={data.pedidos} />
      )}
    </Box>
  );
};

export default Dashboard;
