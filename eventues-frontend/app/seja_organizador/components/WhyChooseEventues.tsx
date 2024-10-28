// components/WhyChooseEventues.tsx
"use client";

import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import MenuIcon from "@mui/icons-material/Menu";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import BuildIcon from "@mui/icons-material/Build";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NoEncryptionIcon from "@mui/icons-material/NoEncryption";
import {
  EventAvailable as EventAvailableIconMUI,
  ThumbUp as ThumbUpIconMUI,
  BusinessCenter as BusinessCenterIconMUI,
  MonetizationOn as MonetizationOnIconMUI,
  VerifiedUser as VerifiedUserIconMUI,
  Receipt as ReceiptIconMUI,
  LocalOffer as LocalOfferIconMUI,
  Schedule as ScheduleIconMUI,
  Calculate as CalculateIconMUI,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import "swiper/css";
import EconomyCalculator from "./EconomyCalculator";

// SEO Metadata
export const metadata = {
  title: "Conheça a Eventues | Eventues",
  description:
    "Descubra como a Eventues pode revolucionar a gestão do seu evento com taxas reduzidas e atendimento de excelência.",
  openGraph: {
    type: "website",
    url: "https://www.eventues.com/conheca_eventues",
    title: "Conheça a Eventues | Eventues",
    description:
      "Descubra como a Eventues pode revolucionar a gestão do seu evento com taxas reduzidas e atendimento de excelência.",
    images: [
      {
        url: "https://www.eventues.com/imagens/eventues_og_image.jpg",
        width: 800,
        height: 600,
        alt: "Conheça a Eventues",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    url: "https://www.eventues.com/conheca_eventues",
    title: "Conheça a Eventues | Eventues",
    description:
      "Descubra como a Eventues pode revolucionar a gestão do seu evento com taxas reduzidas e atendimento de excelência.",
    images: ["https://www.eventues.com/imagens/eventues_twitter_image.jpg"],
  },
};

const WhyChooseEventues: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State for economy calculator
  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState("");
  const [feeOption, setFeeOption] = useState("repassar"); // 'repassar' or 'absorver'
  const [savings, setSavings] = useState<number | null>(null);

  // State for mobile menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Handler for calculator
  const handleCalculate = () => {
    const price = parseFloat(ticketPrice);
    const quantity = parseInt(ticketQuantity);
    if (!isNaN(price) && !isNaN(quantity)) {
      // Taxas da Eventues: 7,99% ou R$2 fixos
      const eventuesFee =
        price >= 20 ? price * 0.0799 * quantity : 2 * quantity;
      // Taxas de concorrentes: supondo 10% sem mínimo
      const competitorFee = price * 0.1 * quantity;
      const calculatedSavings = competitorFee - eventuesFee;
      setSavings(calculatedSavings);
    } else {
      setSavings(null);
    }
  };

  // Handlers for mobile menu
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "100vh", md: "80vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
        "url(https://cdn.pixabay.com/photo/2018/05/15/23/02/football-stadium-3404535_1280.jpg)", // Replace with your image path
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
          }}
        ></Box>
        <Container
          sx={{
        position: "relative",
        zIndex: 1,
        textAlign: "center",
        color: "#FFF",
        px: { xs: 2, sm: 4 },
          }}
        >
          <Image
        src="/icon_eventues.png"
        alt="Eventues Icon"
        width={75}
        height={75}
        style={{ marginBottom: "20px" }}
          />
          <Typography
        variant={isMobile ? "h5" : "h2"}
        sx={{
          fontWeight: "bold",
          mb: 2,
          color: "#5A67D8",
          textShadow: "4px 4px 4px rgba(0.5, 0.5, 0.5, 0.5)",
        }}
          >
        Por que Escolher a Eventues?
          </Typography>
          <Typography
        variant={isMobile ? "body1" : "h5"}
        sx={{ mb: 3, textShadow: "4px 4px 4px rgba(0.5, 0.5, 0.5, 0.5)" }}
          >
        Somos mais que uma plataforma de inscrições, somos seu parceiro completo na gestão de eventos. Com preços competitivos e suporte dedicado, oferecemos todas as ferramentas e recursos que você precisa para organizar e promover seus eventos com facilidade e eficiência.
          </Typography>
          <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "center",
          gap: 2,
        }}
          >
        <Button
          variant="contained"
          color="primary"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: "bold",
            width: { xs: "100%", sm: "auto" },
            py: { xs: 1.5, sm: 1 },
          }}
          onClick={() => router.push("/criar_evento")}
        >
          Crie seu Evento Agora
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          sx={{
            borderRadius: "8px",
            color: "#FFF",
            borderColor: "#FFF",
            textTransform: "none",
            fontWeight: "bold",
            width: { xs: "100%", sm: "auto" },
            py: { xs: 1.5, sm: 1 },
          }}
          onClick={() => {
            const element = document.getElementById("benefits");
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          Saiba Mais
        </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Benefits Section */}
      <Box sx={{ py: 8 }} id="benefits">
        <Container>
          <Grid container spacing={4}>
            {/* Item 1: Taxa de apenas 7,99% por inscrição */}
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  textAlign: "center",
                  px: 2,
                }}
              >
                <AttachMoneyIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: "3rem", md: "4rem" },
                    mb: 2,
                  }}
                />
                <Typography
                  variant={isMobile ? "h6" : "h6"}
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Taxa de 7,99%
                </Typography>
                <Typography variant="body1" sx={{ px: { xs: 1, md: 2 } }}>
                  O melhor custo-benefício. Não cobramos taxa para eventos gratuitos.
                </Typography>
              </Box>
            </Grid>

            {/* Item 2: Suporte personalizado via WhatsApp */}
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  textAlign: "center",
                  px: 2,
                }}
              >
                <HeadsetMicIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: "3rem", md: "4rem" },
                    mb: 2,
                  }}
                />
                <Typography
                  variant={isMobile ? "h6" : "h6"}
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Suporte personalizado via WhatsApp
                </Typography>
                <Typography variant="body1" sx={{ px: { xs: 1, md: 2 } }}>
                  Atendimento rápido e eficiente quando você precisar.
                </Typography>
              </Box>
            </Grid>

            {/* Item 3: Ferramentas de Marketing Poderosas */}
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  textAlign: "center",
                  px: 2,
                }}
              >
                <BuildIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: "3rem", md: "4rem" },
                    mb: 2,
                  }}
                />
                <Typography
                  variant={isMobile ? "h6" : "h6"}
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Ferramentas de Marketing Poderosas
                </Typography>
                <Typography variant="body1" sx={{ px: { xs: 1, md: 2 } }}>
                  Impulsione suas vendas com cupons e pacotes.
                </Typography>
              </Box>
            </Grid>

            {/* Item 4: Gestão Completa da Plataforma */}
            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  textAlign: "center",
                  px: 2,
                }}
              >
                <DashboardIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: "3rem", md: "4rem" },
                    mb: 2,
                  }}
                />
                <Typography
                  variant={isMobile ? "h6" : "h6"}
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Gestão Completa da Plataforma
                </Typography>
                <Typography variant="body1" sx={{ px: { xs: 1, md: 2 } }}>
                  Painel de controle, check-in rápido, formulários
                  personalizados, relatórios em tempo real, cupons de desconto e
                  muito mais.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* About Eventues Section */}
      <Box sx={{ py: 8, backgroundColor: "#F7F7F7" }}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <div style={{ padding: "56.25% 0 0 0", position: "relative", borderRadius: "12px", boxShadow: "10px 10px 30px rgba(0, 0, 0, 0.3)" }}>
              <iframe
                src="https://player.vimeo.com/video/1023743624?badge=0&autopause=0&player_id=0&app_id=58479&title=0&byline=0&portrait=0"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                title="Seja um Organizador | Eventues"
                allowFullScreen
              ></iframe>
              </div>
              <script src="https://player.vimeo.com/api/player.js"></script>
            </Grid>
            <Grid item xs={12} md={6}>
                <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{ fontWeight: "bold", mb: 2 }}
                >
                Simplifique a Gestão do Seu Evento
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                • Com a Eventues, você gerencia tudo em um só lugar, focando no
                que realmente importa: criar experiências incríveis para seu
                público.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                • Crie seu evento gratuitamente e só pague quando começar a vender e pelo que vender.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                • Receba seus valores antecipadamente, antes do evento acontecer.
                </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  mt: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: "bold",
                    width: { xs: "100%", sm: "auto" },
                    py: { xs: 1.5, sm: 1 },
                  }}
                  onClick={() => router.push("/criar_evento")}
                >
                  Comece Agora
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{
                    borderRadius: "8px",
                    color: "#5A67D8",
                    borderColor: "#5A67D8",
                    textTransform: "none",
                    fontWeight: "bold",
                    width: { xs: "100%", sm: "auto" },
                    py: { xs: 1.5, sm: 1 },
                  }}
                  onClick={() => router.push("/contato")}
                >
                  Entre em Contato
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Fees Highlight Section */}
      <Box sx={{ py: 8 }}>
        <Container>
            <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ fontWeight: "bold", mb: 4, textAlign: "center" }}
            >
            Economize com Nossas Soluções Financeiras
            </Typography>
          {/* Grid de Vantagens */}
          <Grid container spacing={4}>
            {/* Vantagem 1: As Melhores Taxas do Mercado */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: "center",
                  px: 2,
                }}
              >
                <AttachMoneyIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    mb: 2,
                  }}
                />
                <Typography
                  variant={isMobile ? "h6" : "h6"}
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  As Melhores Taxas do Mercado
                </Typography>
                <Typography variant="body1" sx={{ px: { xs: 1, md: 2 } }}>
                  Não tem segredo, a taxa é de <strong>7,99%</strong>, sendo a taxa mínima
                  de <strong>R$2,00</strong> caso o valor da inscrição seja inferior a
                  R$20. E não cobramos taxa para eventos gratuitos.
                </Typography>
              </Box>
            </Grid>

            {/* Vantagem 2: Transparência Total */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: "center",
                  px: 2,
                }}
              >
                <VisibilityIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    mb: 2,
                  }}
                />
                <Typography
                  variant={isMobile ? "h6" : "h6"}
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Transparência Total
                </Typography>
                <Typography variant="body1" sx={{ px: { xs: 1, md: 2 } }}>
                  Cobramos somente pelo valor transacionado. Se você oferecer um
                  cupom de desconto, a taxa incidirá apenas sobre o valor
                  final.
                </Typography>
              </Box>
            </Grid>

            {/* Vantagem 3: Sem Custos Ocultos */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: "center",
                  px: 2,
                }}
              >
                <NoEncryptionIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    mb: 2,
                  }}
                />
                <Typography
                  variant={isMobile ? "h6" : "h6"}
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  Sem Custos Ocultos
                </Typography>
                <Typography variant="body1" sx={{ px: { xs: 1, md: 2 } }}>
                  Não cobramos taxas para cortesias, cupons 100% ou inscrições manuais.
                  Além disso, não há taxas para sacar os valores disponíveis via PIX,
                  independente do banco que você utiliza.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Economy Calculator Section */}
      <Box sx={{ py: 8, backgroundColor: "#F7F7F7" }}>
        <Container>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ fontWeight: "bold", mb: 4, textAlign: "center" }}
          >
            Calcule a Sua Economia
          </Typography>
          <EconomyCalculator />
        </Container>
      </Box>

      {/* Main Features Section */}
      <Box sx={{ py: 8 }}>
        <Container>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ fontWeight: "bold", mb: 4, textAlign: "center" }}
          >
            Tudo o Que Você Precisa em Uma Única Plataforma
          </Typography>
          <Grid container spacing={4}>
            {/* Feature 1 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <EventAvailableIconMUI
                  color="primary"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    mb: 1,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Check-In Rápido
                </Typography>
                <Typography variant="body2" sx={{ px: 1 }}>
                  Facilite a entrada com QR Code.
                </Typography>
              </Box>
            </Grid>
            {/* Feature 2 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <ThumbUpIconMUI
                  color="primary"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    mb: 1,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Formulários Personalizados
                </Typography>
                <Typography variant="body2" sx={{ px: 1 }}>
                  Colete as informações que importam.
                </Typography>
              </Box>
            </Grid>
            {/* Feature 3 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <BusinessCenterIconMUI
                  color="primary"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    mb: 1,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Relatórios em Tempo Real
                </Typography>
                <Typography variant="body2" sx={{ px: 1 }}>
                  Dados precisos ao seu alcance.
                </Typography>
              </Box>
            </Grid>
            {/* Feature 4 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <MonetizationOnIconMUI
                  color="primary"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    mb: 1,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Gestão Financeira Simples
                </Typography>
                <Typography variant="body2" sx={{ px: 1 }}>
                  Controle total das suas finanças.
                </Typography>
              </Box>
            </Grid>
            {/* Feature 5 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <VerifiedUserIconMUI
                  color="primary"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    mb: 1,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  IA para Resultados
                </Typography>
                <Typography variant="body2" sx={{ px: 1 }}>
                  Atualize rankings automaticamente.
                </Typography>
              </Box>
            </Grid>
            {/* Feature 6 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <ReceiptIconMUI
                  color="primary"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    mb: 1,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Pagamentos Diversos
                </Typography>
                <Typography variant="body2" sx={{ px: 1 }}>
                  Cartões, Pix e boleto bancário.
                </Typography>
              </Box>
            </Grid>
            {/* Feature 7 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <ScheduleIconMUI
                  color="primary"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    mb: 1,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Parcelamento Flexível
                </Typography>
                <Typography variant="body2" sx={{ px: 1 }}>
                  Ofereça até 12x sem complicações.
                </Typography>
              </Box>
            </Grid>
            {/* Feature 8 */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: "center" }}>
                <LocalOfferIconMUI
                  color="primary"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3rem" },
                    mb: 1,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Cupons de Desconto
                </Typography>
                <Typography variant="body2" sx={{ px: 1 }}>
                  Incentive mais vendas facilmente.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call-to-Action Section */}
      <Box sx={{ py: 8, backgroundColor: "#F7F7F7" }}>
        <Container sx={{ textAlign: "center" }}>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            Comece Agora Mesmo
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Junte-se aos inúmeros organizadores que confiam na Eventues.
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: "bold",
                width: { xs: "100%", sm: "auto" },
                py: { xs: 1.5, sm: 1 },
              }}
              onClick={() => router.push("/criar_evento")}
            >
              Crie Seu Evento Gratuitamente
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default WhyChooseEventues;
