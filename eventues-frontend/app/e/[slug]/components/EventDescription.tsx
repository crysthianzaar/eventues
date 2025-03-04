"use client";

import React from 'react';
import { Info } from 'lucide-react';

interface EventDescriptionProps {
  event: {
    event_description: string;
  };
}

export default function EventDescription({ event }: EventDescriptionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Cabeçalho */}
      <div className="border-b p-6">
        <div className="flex items-center gap-3">
          <Info className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Sobre o Evento</h2>
        </div>
      </div>

      {/* Descrição */}
      <div className="p-6">
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: event.event_description }}
        />
      </div>
    </div>
  );
}
