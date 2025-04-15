import { ReactNode } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SiteNavigationJsonLd from "./components/SiteNavigationJsonLd";

// Metadata é importado do arquivo metadata.ts
// Não definimos metadata aqui para evitar conflito
import { metadata } from "./metadata";

// Apenas exportamos o metadata importado
export { metadata };

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
      <head>
        <SiteNavigationJsonLd />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0 }}>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
