import Hero from "./components/Hero";
import Events from "./components/Events";
import FAQ from "./components/FAQ";
import { Metadata } from "next";
import { getAllEvents } from "./apis/api";
import EventsJsonLd from "./components/EventsJsonLd";

export const metadata: Metadata = {
  title: "Eventues | Plataforma de Eventos e Venda de Ingressos",
  description: "Encontre os melhores eventos, festivais, shows, conferências e workshops. Compre ingressos com facilidade e segurança na plataforma Eventues.",
  keywords: "eventos, ingressos, shows, festivais, conferências, workshops, comprar ingressos, eventos próximos",
  openGraph: {
    title: "Eventues | Plataforma de Eventos e Venda de Ingressos",
    description: "Encontre os melhores eventos, festivais, shows, conferências e workshops. Compre ingressos com facilidade e segurança na plataforma Eventues.",
    url: "https://eventues.com.br",
    siteName: "Eventues",
    locale: "pt_BR",
    type: "website",
  },
};

export default async function HomePage() {
  // Buscar eventos para o JSON-LD
  const events = await getAllEvents();
  
  return (
    <>
      {/* Adicionar JSON-LD para eventos */}
      <EventsJsonLd events={events} />
      
      <Hero />
      <Events />
      <FAQ />
    </>
  );
}
