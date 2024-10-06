import { ReactNode } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Exportar os metadados padrão
export const metadata = {
  title: "Eventues - Gestão Inteligente de Eventos",
  description: "A Eventues é uma plataforma inovadora para gestão e organização de eventos.",
  openGraph: {
    title: "Eventues - Gestão Inteligente de Eventos",
    description: "Simplifique a gestão dos seus eventos com a Eventues.",
    url: "https://www.eventues.com",
    images: [
      {
        url: "https://www.eventues.com/imagens/eventues_og_image.jpg",
        alt: "Eventues Banner",
      },
    ],
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon_eventues.png", type: "image/png", sizes: "32x32" }, // Ícone alternativo (PNG)
    ],
  },
};

// Exportar a configuração de viewport separadamente
export const generateViewport = () => {
  return {
    width: "device-width",
    initialScale: 1,
  };
};

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="pt-BR">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0 }}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
