import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { AuthUser } from "aws-amplify/auth";

const Navbar: React.FC = () => {
  const { signOut, user }: { signOut: () => void; user: AuthUser } =
    useAuthenticator();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleCreateEvent = () => {
    navigate("/criar_evento");
  };

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  const handleInicio = () => {
    navigate("/");
  };

  const handleMyEvents = () => {
    navigate("/meus_eventos");
  };

  const handleAccountSettings = () => {
    navigate("/minha_conta");
  };

  const handleProfileSettings = () => {
    navigate("/configurar_perfil");
  };

  const handleOrganizerPage = () => {
    navigate("/seja_organizador");
  };

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setDrawerOpen(open);
    };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
        <ListItemButton onClick={handleOrganizerPage}>
          <ListItemText primary="Seja Organizador" />
        </ListItemButton>
        <ListItemButton onClick={handleMyEvents}>
          <ListItemText primary="Meus Eventos" />
        </ListItemButton>
        <ListItemButton>
          <ListItemText primary="Contato" />
        </ListItemButton>
        <ListItemButton onClick={handleCreateEvent}>
          <ListItemText primary="Criar Evento" />
        </ListItemButton>
        {!user && (
          <ListItemButton onClick={handleLogin}>
            <ListItemText primary="Entrar" />
          </ListItemButton>
        )}
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
          {/* Ícone do Menu na Esquerda */}
          <Box
            sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}
          >
            <IconButton
              edge="start"
              sx={{ color: "#000000" }} // Define a cor do ícone
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Logo com centralização condicional e redirecionamento */}
          <Box
            component="img"
            src={logo}
            alt="Eventues Logo"
            onClick={handleInicio} // Adiciona o manipulador de clique
            sx={{
              height: "50px",
              margin: { xs: "0 auto", md: "0" }, // Centraliza em xs, alinha à esquerda em md e acima
              position: { xs: "absolute", md: "relative" }, // Em xs, fica absoluto para centralizar
              left: { xs: "50%", md: "unset" },
              transform: { xs: "translateX(-50%)", md: "none" }, // Ajusta a posição para centralizar
              cursor: "pointer", // Altera o cursor para indicar que é clicável
            }}
          />

          {/* Navbar Completa em Telas Médias e Maiores */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: "20px",
              marginLeft: "auto",
            }}
          >
            <Button
              sx={{ color: "#2D3748", textTransform: "none", fontSize: "1rem" }}
              onClick={handleInicio}
            >
              Início
            </Button>
            <Button
              sx={{ color: "#2D3748", textTransform: "none", fontSize: "1rem" }}
              onClick={handleOrganizerPage}
            >
              Seja Organizador
            </Button>
            <Button
              sx={{ color: "#2D3748", textTransform: "none", fontSize: "1rem" }}
              onClick={handleMyEvents}
            >
              Meus Eventos
            </Button>
            <Button
              sx={{ color: "#2D3748", textTransform: "none", fontSize: "1rem" }}
            >
              Contato
            </Button>

            {/* Criar Evento antes de Entrar/Sair */}
            <Button
              variant="contained"
              sx={{
                borderRadius: "30px",
                backgroundColor: "#68D391",
                color: "white",
                textTransform: "none",
                fontSize: "1rem",
                width: "140px", // Define largura fixa
                minWidth: "140px", // Impede que o botão diminua
              }}
              onClick={handleCreateEvent}
            >
              Criar Evento
            </Button>

            {/* Botão de Entrar/Minha Conta com Avatar */}
            {user ? (
              <Button
                variant="outlined"
                sx={{
                  borderRadius: "30px",
                  color: "#5A67D8",
                  borderColor: "#5A67D8",
                  textTransform: "none",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={handleMenuClick}
              >
                Perfil
                <Avatar
                  alt={user?.username ?? "Usuário"}
                  src="https://w7.pngwing.com/pngs/505/761/png-transparent-login-computer-icons-avatar-icon-monochrome-black-silhouette.png"
                  sx={{ width: 20, height: 20, marginLeft: "10px" }} // Avatar pequeno ao lado do texto
                />
              </Button>
            ) : (
              <Button
                variant="outlined"
                sx={{
                  borderRadius: "30px",
                  color: "#5A67D8",
                  borderColor: "#5A67D8",
                  textTransform: "none",
                  fontSize: "1rem",
                }}
                onClick={handleLogin}
              >
                Entrar
              </Button>
            )}

            {/* Menu de opções do usuário logado */}
            {user && (
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                keepMounted
              >
                <MenuItem onClick={handleAccountSettings}>Minha Conta</MenuItem>
                <MenuItem onClick={handleProfileSettings}>
                  Configurar Perfil
                </MenuItem>
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
              </Menu>
            )}
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
