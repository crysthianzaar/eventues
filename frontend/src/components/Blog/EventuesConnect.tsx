import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Container,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const EventuesConnect: React.FC = () => {
  // Exemplo de dados de posts
  const posts = [
    {
      id: 1,
      title: "Tendências Atuais em Eventos Esportivos",
      description:
        "O mundo dos esportes está em constante evolução, e os eventos esportivos não são exceção. Novas modalidades surgem, atraindo públicos diversos e trazendo inovação para o cenário esportivo...",
      image:
        "https://foothub.com.br/wp-content/uploads/2021/08/iStock-949190756-e1561510622966-768x432.jpg",
      link: "/blog/post/tendencias-atuais-em-eventos-esportivos",
    },
  ];

  // Selecionar um post para destacar
  const featuredPost = posts[0];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // Isso garante que o conteúdo ocupe toda a altura da viewport
      }}
    >
      <Box
        sx={{
          background: "#EDF2F7",
          paddingY: { xs: "40px", md: "60px" },
          color: "#fff",
          flex: "1", // Isso faz o Box crescer para ocupar o espaço restante
          boxSizing: "border-box",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              color: "#4A5568",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Bem-vindo ao Eventues Connect
          </Typography>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{
              color: "#4A5568",
              marginBottom: { xs: "30px", md: "60px" },
              fontSize: { xs: "1rem", md: "1.5rem" },
            }}
          >
            Explore nossos artigos sobre esportes, organização de eventos e
            muito mais!
          </Typography>

          {/* Seção em Destaque */}
          <Box sx={{ marginBottom: { xs: "30px", md: "60px" } }}>
            <Typography
              variant="h4"
              align="center"
              sx={{
                color: "#4A5568",
                fontWeight: "bold",
                marginBottom: "20px",
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              Destaque da Semana
            </Typography>
            <Card
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                borderRadius: "12px",
                overflow: "hidden",
                backgroundColor: "#fff", // Fundo branco para contraste
                color: "#2D3748", // Cor do texto
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  width: { md: "50%" },
                  height: { xs: "200px", md: "300px" },
                  transition: "transform 0.3s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
                image={featuredPost.image}
                alt={featuredPost.title}
              />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  padding: { xs: "16px", md: "24px" },
                }}
              >
                <CardContent sx={{ flex: "1 0 auto" }}>
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    sx={{
                      fontWeight: "bold",
                      fontSize: { xs: "1.2rem", md: "1.5rem" },
                    }}
                  >
                    {featuredPost.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: { xs: "0.9rem", md: "1rem" } }}
                  >
                    {featuredPost.description}
                  </Typography>
                </CardContent>
                <Box sx={{ paddingTop: "16px" }}>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      backgroundColor: "#68D391",
                      color: "#ffffff",
                      textTransform: "none",
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      ":hover": { backgroundColor: "#48BB78" },
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.05)",
                        backgroundColor: "#48BB78",
                      },
                    }}
                    href={featuredPost.link}
                  >
                    Ler Mais
                  </Button>
                </Box>
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default EventuesConnect;
