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
          <Button sx={{ color: "#2D3748" }} onClick={handleInicio}>
            Início
          </Button>
          <Button sx={{ color: "#2D3748" }}>Eventos</Button>
          <Button sx={{ color: "#2D3748" }}>Espaço do Organizador</Button>
          <Button sx={{ color: "#2D3748" }}>Minhas Inscrições</Button>
          <Button sx={{ color: "#2D3748" }}>Contato</Button>
          {user ? (
            <Button
              variant="outlined"
              sx={{
                borderRadius: "30px",
                color: "#5A67D8",
                borderColor: "#5A67D8",
              }}
              onClick={handleLogout}
            >
              Logoff
            </Button>
          ) : (
            <Button
              variant="outlined"
              sx={{
                borderRadius: "30px",
                color: "#5A67D8",
                borderColor: "#5A67D8",
              }}
              onClick={handleLogin}
            >
              Login
            </Button>
          )}
          <Button
            variant="contained"
            sx={{
              borderRadius: "30px",
              backgroundColor: "#68D391",
              color: "white",
            }}
          >
            Crie seu evento
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
