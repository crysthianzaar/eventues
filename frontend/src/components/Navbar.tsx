import React, { useState } from "react";
import { AppBar, Toolbar, Button, Box, IconButton, Drawer, List, ListItemButton, ListItemText } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom"; // Adicione o hook useNavigate
import logo from "../assets/logo.png";

const Navbar: React.FC = () => {
  const { signOut, user } = useAuthenticator();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate(); // Inicialize o hook

  const handleLogin = () => {
    navigate("/login"); // Redireciona para a rota de login
  };

  const handleCreateEvent = () => {
    navigate("/criar_evento"); // Redireciona para a rota de criação de eventos
  };

  const handleLogout = () => {
    signOut();
    navigate("/"); // Redireciona para a home após logout
  };

  const handleInicio = () => {
    navigate("/"); // Redireciona para a home
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const menuItems = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItemButton onClick={handleInicio}>
          <ListItemText primary="Início" />
        </ListItemButton>
        <ListItemButton>
          <ListItemText primary="Explorar Eventos" />
        </ListItemButton>
        <ListItemButton>
          <ListItemText primary="Portal do Organizador" />
        </ListItemButton>
        <ListItemButton>
          <ListItemText primary="Meus Eventos" />
        </ListItemButton>
        <ListItemButton>
          <ListItemText primary="Fale Conosco" />
        </ListItemButton>
        {user ? (
          <ListItemButton onClick={handleLogout}>
            <ListItemText primary="Sair" />
          </ListItemButton>
        ) : (
          <ListItemButton onClick={handleLogin}>
            <ListItemText primary="Entrar" />
          </ListItemButton>
        )}
        <ListItemButton onClick={handleCreateEvent}>
          <ListItemText primary="Criar Evento" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", position: "relative" }}>
          {/* Icone do Menu na Esquerda */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <IconButton
              edge="start"
              sx={{ color: '#000000' }}  // Define a cor do ícone
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo com centralização condicional */}
          <Box
            component="img"
            src={logo}
            alt="Eventues Logo"
            sx={{
              height: "50px",
              margin: { xs: '0 auto', md: '0' },  // Centraliza em xs, alinha à esquerda em md e acima
              position: { xs: 'absolute', md: 'relative' },  // Em xs, fica absoluto para centralizar
              left: { xs: '50%', md: 'unset' },
              transform: { xs: 'translateX(-50%)', md: 'none' },  // Ajusta a posição para centralizar
            }}
          />

          {/* Navbar Completa em Telas Médias e Maiores */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: "20px", marginLeft: 'auto' }}>
            <Button sx={{ color: "#2D3748", textTransform: "none", fontSize: '1rem' }} onClick={handleInicio}>
              Início
            </Button>
            <Button sx={{ color: "#2D3748", textTransform: "none", fontSize: '1rem' }}>
              Explorar Eventos
            </Button>
            <Button sx={{ color: "#2D3748", textTransform: "none", fontSize: '1rem' }}>
              Portal do Organizador
            </Button>
            <Button sx={{ color: "#2D3748", textTransform: "none", fontSize: '1rem' }}>
              Meus Eventos
            </Button>
            <Button sx={{ color: "#2D3748", textTransform: "none", fontSize: '1rem' }}>
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
                  fontSize: '1rem'
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
                  fontSize: '1rem'
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
                fontSize: '1rem'
              }}
              onClick={handleCreateEvent} // Chama a função para redirecionar para criação de eventos
            >
              Criar Evento
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {menuItems}
      </Drawer>
    </>
  );
};

export default Navbar;
