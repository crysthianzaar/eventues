// app/event_detail/[event_id]/page.tsx

import React from "react";
import { Metadata } from "next";
import axios from "axios";
import OrganizadorEventDetail from "./components/OrganizatorEventDetail"; // Client Component
import { notFound } from "next/navigation";
import Image from "next/image"; // Next.js Image component

interface EventDetail {
  event_id: string;
  name: string;
  category: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  city: string;
  state: string;
  views: number;
  visibility: string;
  event_status: string;
  event_description: string;
  description: string;
  banner_image_url: string;
  stepper: {
    inf_basic: boolean;
    event_details: boolean;
    documents: boolean;
    policies: boolean;
    category_and_values: boolean;
    form: boolean;
    event_ready: boolean;
  };
}

// Fetch event details from the API
const fetchEventDetail = async (event_id: string): Promise<EventDetail | null> => {
  try {
    const response = await axios.get<EventDetail>(
      `http://127.0.0.1:8000/organizer_detail/${event_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching event details:", error);
    return null;
  }
};

// Generate dynamic metadata based on event details
export async function generateMetadata({ params }: { params: { event_id: string } }): Promise<Metadata> {
  const { event_id } = params;
  const eventDetail = await fetchEventDetail(event_id);

  if (!eventDetail) {
    return {
      title: "Evento não encontrado | Eventues",
      description: "O evento que você está procurando não foi encontrado.",
      openGraph: {
        type: "website",
        url: `https://www.eventues.com/event_detail/${event_id}`,
        title: "Evento não encontrado | Eventues",
        description: "O evento que você está procurando não foi encontrado.",
        images: [
          {
            url: "https://www.eventues.com/imagens/default_banner.jpg",
            width: 800,
            height: 600,
            alt: "Evento não encontrado",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: `https://www.eventues.com/event_detail/${event_id}`,
        title: "Evento não encontrado | Eventues",
        description: "O evento que você está procurando não foi encontrado.",
        images: ["https://www.eventues.com/imagens/default_banner.jpg"],
      },
    };
  }

  return {
    title: `${eventDetail.name} | Eventues`,
    description: `${eventDetail.event_description} | Eventues`,
    openGraph: {
      type: "website",
      url: `https://www.eventues.com/event_detail/${event_id}`,
      title: `${eventDetail.name} | Eventues`,
      description:`${eventDetail.event_description} | Eventues`,
      images: [
        {
          url:
            eventDetail.banner_image_url || "https://www.eventues.com/imagens/default_banner.jpg",
          width: 800,
          height: 600,
          alt: `Banner do evento ${eventDetail.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: `https://www.eventues.com/event_detail/${event_id}`,
      title: `${eventDetail.name} | Eventues`,
      description: eventDetail.event_description,
      images: [
        eventDetail.banner_image_url ||
          "https://www.eventues.com/imagens/default_banner.jpg",
      ],
    },
  };
}

const EventDetailPage = async ({ params }: { params: { event_id: string } }) => {
  const { event_id } = params;
  const eventDetail = await fetchEventDetail(event_id);

  if (!eventDetail) {
    notFound(); // Redirect to 404 page if event not found
  }

  return <OrganizadorEventDetail eventDetail={eventDetail} />;
};

export default EventDetailPage;
