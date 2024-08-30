import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { useAuthenticator } from "@aws-amplify/ui-react";
import logo from "../assets/logo.png";

const Navbar: React.FC = () => {
  const { signOut, user } = useAuthenticator();

  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleLogout = () => {
    signOut();
  };

  const handleInicio = () => {
    window.location.href = "/";
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box
          component="img"
          src={logo}
          alt="Eventues Logo"
          sx={{ height: "50px" }}
        />

        <Box sx={{ display: "flex", gap: "20px" }}>
          <Button sx={{ color: "#2D3748", textTransform: "none" }} onClick={handleInicio}>
            Início
          </Button>
          <Button sx={{ color: "#2D3748", textTransform: "none" }}>
            Explorar Eventos
          </Button>
          <Button sx={{ color: "#2D3748", textTransform: "none" }}>
            Portal do Organizador
          </Button>
          <Button sx={{ color: "#2D3748", textTransform: "none" }}>
            Meus Eventos
          </Button>
          <Button sx={{ color: "#2D3748", textTransform: "none" }}>
            Fale Conosco
          </Button>
          {user ? (
            <Button
              variant="outlined"
              sx={{
                borderRadius: "30px",
                color: "#5A67D8",
                borderColor: "#5A67D8",
                textTransform: "none",
              }}
              onClick={handleLogout}
            >
              Sair
            </Button>
          ) : (
            <Button
              variant="outlined"
              sx={{
                borderRadius: "30px",
                color: "#5A67D8",
                borderColor: "#5A67D8",
                textTransform: "none",
              }}
              onClick={handleLogin}
            >
              Entrar
            </Button>
          )}
          <Button
            variant="contained"
            sx={{
              borderRadius: "30px",
              backgroundColor: "#68D391",
              color: "white",
              textTransform: "none",
            }}
          >
            Criar Evento
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
