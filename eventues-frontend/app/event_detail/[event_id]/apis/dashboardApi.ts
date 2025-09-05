import axios from 'axios';

export interface DashboardStats {
  // Valores financeiros principais
  receitaTotal: number;           // Soma de todos os pagamentos (confirmados + pendentes + repassados)
  valorConfirmado: number;        // Pagamentos confirmados mas ainda não repassados
  valorPendente: number;          // Pagamentos ainda pendentes/processando
  valorRepassado: number;         // Valor já repassado para o organizador
  valorCancelado: number;         // Valor de pagamentos cancelados/estornados
  
  // Valores líquidos (descontando taxas)
  receitaLiquida: number;         // Receita total menos taxas
  valorAReceber: number;          // Valor líquido ainda a receber (confirmado - taxas)
  
  // Métricas de performance
  visualizacoes: number;
  taxaConversao: number;
  totalPedidos: number;
  pedidosConfirmados: number;
  pedidosPendentes: number;
  pedidosCancelados: number;
  
  // Distribuição por método de pagamento
  metodosPagamento: {
    cartaoCredito: number;
    pix: number;
    boleto: number;
    outros: number;
  };
  
  // Lista detalhada de pedidos
  pedidos: {
    idPedido: string;
    status: string;
    valor: number;
    total_amount: number;
    fee_amount: number;
    payment_url: string;
    data: string;
    metodoPagamento: string;
    nomeParticipante?: string;
    statusRepassado?: boolean;     // Indica se já foi repassado para o organizador
  }[];
}

/**
 * Busca estatísticas do dashboard para um evento específico
 * @param eventId ID do evento
 * @param token Token de autenticação
 * @returns Dados do dashboard do evento
 */
export const getEventDashboard = async (eventId: string, token: string): Promise<DashboardStats> => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer_detail/${eventId}/dashboard`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    // Verificar e validar os dados da resposta
    const data = response.data as any;
    
    // Garantir que o objeto retornado siga a estrutura da interface DashboardStats
    return {
      // Valores financeiros principais
      receitaTotal: typeof data.receitaTotal === 'number' ? data.receitaTotal : 
        (typeof data.vendasTotais === 'number' ? data.vendasTotais : 0),
      valorConfirmado: typeof data.valorConfirmado === 'number' ? data.valorConfirmado : 0,
      valorPendente: typeof data.valorPendente === 'number' ? data.valorPendente : 
        (typeof data.vendasPendentes === 'number' ? data.vendasPendentes : 0),
      valorRepassado: typeof data.valorRepassado === 'number' ? data.valorRepassado : 0,
      valorCancelado: typeof data.valorCancelado === 'number' ? data.valorCancelado : 
        (typeof data.vendasCanceladas === 'number' ? data.vendasCanceladas : 0),
      
      // Valores líquidos
      receitaLiquida: typeof data.receitaLiquida === 'number' ? data.receitaLiquida : 0,
      valorAReceber: typeof data.valorAReceber === 'number' ? data.valorAReceber : 0,
      
      // Métricas de performance
      visualizacoes: typeof data.visualizacoes === 'number' ? data.visualizacoes : 0,
      taxaConversao: typeof data.taxaConversao === 'number' ? data.taxaConversao : 0,
      totalPedidos: typeof data.totalPedidos === 'number' ? data.totalPedidos : 0,
      pedidosConfirmados: typeof data.pedidosConfirmados === 'number' ? data.pedidosConfirmados : 0,
      pedidosPendentes: typeof data.pedidosPendentes === 'number' ? data.pedidosPendentes : 0,
      pedidosCancelados: typeof data.pedidosCancelados === 'number' ? data.pedidosCancelados : 0,
      
      // Distribuição por método de pagamento
      metodosPagamento: {
        cartaoCredito: typeof data.metodosPagamento?.cartaoCredito === 'number' ? data.metodosPagamento.cartaoCredito : 0,
        pix: typeof data.metodosPagamento?.pix === 'number' ? data.metodosPagamento.pix : 0,
        boleto: typeof data.metodosPagamento?.boleto === 'number' ? data.metodosPagamento.boleto : 0,
        outros: typeof data.metodosPagamento?.outros === 'number' ? data.metodosPagamento.outros : 0,
      },
      
      // Lista detalhada de pedidos
      pedidos: Array.isArray(data.pedidos) ? data.pedidos : [],
    };
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    // Retornar valores padrão em caso de erro para evitar quebrar a UI
    return {
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
      metodosPagamento: {
        cartaoCredito: 0,
        pix: 0,
        boleto: 0,
        outros: 0,
      },
      pedidos: [],
    };
  }
};
