"use client";

import React from 'react';
import Image from 'next/image';
import { formatDate, formatTime } from '@/utils/formatters';
import { MapPin, Calendar, Clock } from 'lucide-react';

interface EventHeaderProps {
  event: {
    name: string;
    banner_image_url?: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    city: string;
    state: string;
    address: string;
    organization_name: string;
    category?: string;
  };
}

const DEFAULT_BANNER = '/images/default_banner.jpg';

export default function EventHeader({ event }: EventHeaderProps) {
  const startDate = formatDate(event?.start_date);
  const endDate = formatDate(event?.end_date);
  const startTime = formatTime(event?.start_time);
  const endTime = formatTime(event?.end_time);

  return (
    <div className="relative">
      {/* Banner com overlay gradiente */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <Image
          src={event?.banner_image_url || DEFAULT_BANNER}
          alt={`Banner do evento ${event?.name}`}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Overlay gradiente mais elaborado */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%), linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)'
        }} />

        {/* Conteúdo do banner */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
          <div className="max-w-7xl mx-auto w-full">
            {/* Categoria do evento */}
            {event?.category && (
              <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-medium mb-4">
                {event.category}
              </div>
            )}

            {/* Título e organizador */}
            <h1 className="text-5xl font-bold mb-4 leading-tight">{event?.name}</h1>
            <p className="text-xl text-gray-200 mb-6">Por {event?.organization_name}</p>
            
            {/* Informações do evento em cards semi-transparentes */}
            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">
                  {startDate === endDate ? startDate : `${startDate} - ${endDate}`}
                </span>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5" />
                <span className="font-medium">{startTime} - {endTime}</span>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">
                  {event?.address}, {event?.city} - {event?.state}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
