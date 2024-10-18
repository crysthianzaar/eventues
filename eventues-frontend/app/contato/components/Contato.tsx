// components/Contato.tsx
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
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SendIcon from "@mui/icons-material/Send";

const Contato: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Estados para o formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Estados para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error"
  >("success");

  // Handlers para Snackbar
  const handleSnackbarOpen = (
    message: string,
    severity: "success" | "error" = "success"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  // Handler para enviar o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    if (!nome || !email || !assunto || !mensagem) {
      handleSnackbarOpen("Por favor, preencha todos os campos.", "error");
      return;
    }

    // Validação de e-mail simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      handleSnackbarOpen("Por favor, insira um e-mail válido.", "error");
      return;
    }

    // Envio dos dados do formulário (ajuste conforme sua API)
    try {
      // Exemplo com fetch (substitua pela sua lógica de envio)
      const response = await fetch("/api/contato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email, assunto, mensagem }),
      });

      if (response.ok) {
        handleSnackbarOpen(
          "Mensagem enviada com sucesso! Entraremos em contato em breve.",
          "success"
        );
        // Limpar o formulário
        setNome("");
        setEmail("");
        setAssunto("");
        setMensagem("");
      } else {
        throw new Error("Erro ao enviar a mensagem.");
      }
    } catch (error) {
      console.error(error);
      handleSnackbarOpen(
        "Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.",
        "error"
      );
    }
  };

  return (
    <>
      {/* SEO Metadata */}
      <Head>
        <title>Contato | Eventues</title>
        <meta
          name="description"
          content="Entre em contato com a Eventues para saber mais sobre nossos serviços e como podemos ajudar na gestão do seu evento."
        />
        <meta property="og:title" content="Contato | Eventues" />
        <meta
          property="og:description"
          content="Entre em contato com a Eventues para saber mais sobre nossos serviços e como podemos ajudar na gestão do seu evento."
        />
        <meta
          property="og:image"
          content="https://www.eventues.com/imagens/eventues_contact_og_image.jpg"
        />
        <meta property="og:url" content="https://www.eventues.com/contato" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contato | Eventues" />
        <meta
          name="twitter:description"
          content="Entre em contato com a Eventues para saber mais sobre nossos serviços e como podemos ajudar na gestão do seu evento."
        />
        <meta
          name="twitter:image"
          content="https://www.eventues.com/imagens/eventues_contact_twitter_image.jpg"
        />
      </Head>

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "50vh", md: "70vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            "url(https://cdn.pixabay.com/photo/2020/05/19/12/59/phone-5190643_1280.jpg)", // Substitua pela URL da imagem desejada
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
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
          <Typography
            variant={isMobile ? "h4" : "h2"}
            sx={{
              fontWeight: "bold",
              mb: 2,
              color: "#5A67D8",
              textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
            }}
          >
            Entre em Contato Conosco
          </Typography>
          <Typography
            variant={isMobile ? "body1" : "h6"}
            sx={{
              mb: 3,
              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
            }}
          >
            Estamos aqui para ajudar você a organizar o melhor evento possível. Preencha o formulário abaixo ou entre em contato diretamente.
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
              onClick={() => {
                // Ação para iniciar uma conversa no WhatsApp
                window.open("https://wa.me/5527999346010", "_blank");
              }}
              startIcon={<WhatsAppIcon />}
            >
              Fale Conosco no WhatsApp
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Contact Information Section */}
      <Box sx={{ py: 8 }}>
        <Container>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ fontWeight: "bold", mb: 4, textAlign: "center" }}
          >
            Nossas Informações de Contato
          </Typography>
          <Grid container spacing={4}>
            {/* WhatsApp */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: "center", px: 2 }}>
                <WhatsAppIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: "3rem", md: "4rem" },
                    mb: 2,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  WhatsApp
                </Typography>
                <Typography variant="body1">
                <Link href="https://wa.me/5527999346010" legacyBehavior passHref>
                  <a style={{ color: theme.palette.primary.main, textDecoration: "none" }}>
                    (27) 99934-6010
                  </a>
                </Link>
                </Typography>
              </Box>
            </Grid>

            {/* E-mail */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: "center", px: 2 }}>
                <EmailIcon
                  color="primary"
                  sx={{
                    fontSize: { xs: "3rem", md: "4rem" },
                    mb: 2,
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                  E-mail
                </Typography>
                <Typography variant="body1">
                  <Link href="mailto:contato@eventues.com" legacyBehavior passHref>
                    <a style={{ color: theme.palette.primary.main, textDecoration: "none" }}>
                      contato@eventues.com
                    </a>
                  </Link>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Form Section */}
      <Box sx={{ py: 8, backgroundColor: "#F7F7F7" }}>
        <Container>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ fontWeight: "bold", mb: 4, textAlign: "center" }}
          >
            Envie-nos uma Mensagem
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={8}>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Nome */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nome Completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  {/* E-mail */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="E-mail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  {/* Assunto */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Assunto"
                      value={assunto}
                      onChange={(e) => setAssunto(e.target.value)}
                      required
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  {/* Tipo de Consulta */}
                  <Grid item xs={12} sm={6}>
                    <RadioGroup
                      row
                      value={assunto}
                      onChange={(e) => setAssunto(e.target.value)}
                    >
                      <FormControlLabel
                        value="Informações Gerais"
                        control={<Radio />}
                        label="Informações Gerais"
                      />
                      <FormControlLabel
                        value="Suporte Técnico"
                        control={<Radio />}
                        label="Suporte Técnico"
                      />
                      <FormControlLabel
                        value="Parcerias"
                        control={<Radio />}
                        label="Parcerias"
                      />
                    </RadioGroup>
                  </Grid>
                  {/* Mensagem */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mensagem"
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
                      required
                      multiline
                      rows={5}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  {/* Botão de Envio */}
                  <Grid item xs={12} sx={{ textAlign: "center" }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      endIcon={<SendIcon />}
                      sx={{
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: "bold",
                        px: 4,
                        py: 1.5,
                      }}
                    >
                      Enviar Mensagem
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Snackbar para Feedback ao Usuário */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Contato;
