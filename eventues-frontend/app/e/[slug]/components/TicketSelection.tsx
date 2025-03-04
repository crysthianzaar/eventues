"use client";

import React from 'react';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '@mui/material';
import { Ticket, Clock, AlertCircle } from 'lucide-react';

interface TicketSelectionProps {
  event: {
    tickets: Array<{
      id: string;
      nome: string;
      valor: number;
      tipo: 'Simples' | 'Lotes' | 'Gratuito';
      ingressosDisponiveis: string;
      taxaServico: 'absorver' | 'repassar';
      inicioVendas: string;
      fimVendas: string;
    }>;
  };
}

export default function TicketSelection({ event }: TicketSelectionProps) {
  const [selectedTickets, setSelectedTickets] = React.useState<Record<string, number>>({});

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: Math.max(0, quantity)
    }));
  };

  const calculateTotal = () => {
    return event.tickets.reduce((total, ticket) => {
      const quantity = selectedTickets[ticket.id] || 0;
      const ticketTotal = ticket.valor * quantity;
      const serviceFee = ticket.taxaServico === 'repassar' ? ticketTotal * 0.1 : 0;
      return total + ticketTotal + serviceFee;
    }, 0);
  };

  const isTicketAvailable = (ticket: typeof event.tickets[0]) => {
    const now = new Date();
    const start = new Date(ticket.inicioVendas);
    const end = new Date(ticket.fimVendas);
    const available = parseInt(ticket.ingressosDisponiveis);
    return now >= start && now <= end && available > 0;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <div className="flex items-center gap-3">
          <Ticket className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Ingressos</h2>
        </div>
      </div>
      
      {/* Lista de ingressos */}
      <div className="p-6 space-y-4">
        {event.tickets.map(ticket => {
          const available = isTicketAvailable(ticket);
          const quantity = selectedTickets[ticket.id] || 0;
          
          return (
            <div 
              key={ticket.id} 
              className={`border rounded-xl p-4 ${
                available ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{ticket.nome}</h3>
                  <p className="text-lg font-bold text-blue-600">
                    {ticket.tipo === 'Gratuito' ? 'Gratuito' : formatCurrency(ticket.valor)}
                  </p>
                  
                  {/* Status do ingresso */}
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{ticket.ingressosDisponiveis} disponíveis</span>
                    {ticket.taxaServico === 'repassar' && (
                      <span className="text-orange-500">(+10% taxa)</span>
                    )}
                  </div>
                </div>

                {available ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleQuantityChange(ticket.id, quantity - 1)}
                      disabled={quantity === 0}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleQuantityChange(ticket.id, quantity + 1)}
                      disabled={parseInt(ticket.ingressosDisponiveis) <= quantity}
                    >
                      +
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Indisponível</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rodapé com total e botão de compra */}
      {Object.values(selectedTickets).some(qty => qty > 0) && (
        <div className="border-t bg-gray-50 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(calculateTotal())}
            </span>
          </div>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 2
            }}
          >
            Continuar
          </Button>
        </div>
      )}
    </div>
  );
}
