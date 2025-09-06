import { ReactNode } from "react";
import dynamic from "next/dynamic";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SiteNavigationJsonLd from "./components/SiteNavigationJsonLd";
import OrganizationJsonLd from "./components/OrganizationJsonLd";
import WebsiteJsonLd from "./components/WebsiteJsonLd";
import GoogleSearchConsole from "./components/GoogleSearchConsole";

// Dynamic import for performance monitoring
const PerformanceMonitor = dynamic(() => import("./components/PerformanceMonitor"), {
  ssr: false
});

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
        {/* Dados estruturados principais */}
        <SiteNavigationJsonLd />
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        
        {/* Facebook App ID para melhor integração social */}
        <meta property="fb:app_id" content="YOUR_FACEBOOK_APP_ID" />
        
        {/* Meta tags adicionais para compartilhamento */}
        <meta property="og:site_name" content="Eventues" />
        <meta name="twitter:site" content="@eventues" />
        <meta name="twitter:creator" content="@eventues" />
        
        {/* Verificação de propriedade para redes sociais */}
        <meta name="google-site-verification" content="YOUR_GOOGLE_VERIFICATION_CODE" />
        
        {/* DNS Prefetch para recursos externos */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//storage.googleapis.com" />
        <link rel="dns-prefetch" href="//lh3.googleusercontent.com" />
        
        {/* Preconnect para recursos críticos */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://www.eventues.com'} />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: 0 }}>
        <PerformanceMonitor />
        <GoogleSearchConsole />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
