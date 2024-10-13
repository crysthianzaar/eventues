"use client"; // Marca o componente como Client Component

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
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  PersonAdd as PersonAddIcon,
  Event as EventIcon,
  ContactMail as ContactMailIcon,
  Article as ArticleIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Login as LoginIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase"; // Certifique-se de ajustar o caminho
import { useRouter } from "next/navigation"; // Usar 'next/navigation'
import Image from "next/image"; // Importação do componente next/image

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, loading] = useAuthState(auth); // Autenticação do Firebase
  const router = useRouter();

  // Handlers de navegação
  const handleLogin = () => {
    router.push("/login");
  };

  const handleCreateEvent = () => {
    router.push("/criar_evento");
  };

  const handleLogout = () => {
    auth.signOut();
    router.push("/");
  };

  const handleInicio = () => {
    router.push("/");
  };

  const handleMyEvents = () => {
    router.push("/meus_eventos");
  };

  const handleBlog = () => {
    router.push("/blog");
  };

  const handleAccountSettings = () => {
    router.push("/minha_conta");
    handleMenuClose();
  };

  const handleProfileSettings = () => {
    router.push("/configurar_perfil");
    handleMenuClose();
  };

  const handleOrganizerPage = () => {
    router.push("/seja_organizador");
  };

  // Definição dos itens do menu
  const menuItems = [
    {
      label: "Início",
      path: "/",
      icon: <HomeIcon />,
      action: () => handleInicio(),
    },
    {
      label: "Seja Organizador",
      path: "/seja_organizador",
      icon: <PersonAddIcon />,
      action: () => handleOrganizerPage(),
    },
    {
      label: "Meus Eventos",
      path: "/meus_eventos",
      icon: <EventIcon />,
      action: () => handleMyEvents(),
    },
    {
      label: "Contato",
      path: "/contato",
      icon: <ContactMailIcon />,
      action: () => router.push("/contato"),
    },
    {
      label: "Blog",
      path: "/blog",
      icon: <ArticleIcon />,
      action: () => handleBlog(),
    },
    {
      label: "Criar Evento",
      path: "/criar_evento",
      icon: <AddCircleOutlineIcon />,
      action: () => handleCreateEvent(),
      variant: "contained",
      color: "success",
    },
  ];

  // Handlers para o Drawer
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

  // Handlers para o Menu de Perfil
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Itens do Drawer com ícones
  const drawerList = (
    <Box
      sx={{
        width: 250,
        padding: 2,
        backgroundColor: "#ffffff",
        height: "100%",
        color: "#000000",
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {menuItems.map((item, index) => (
          <ListItemButton
            key={index}
            onClick={item.action}
            disabled={!item.path && !item.action}
            sx={{
              ...(item.variant === "contained" && {
                backgroundColor: "#68D391",
                color: "#fff",
                borderRadius: "8px",
                marginY: "4px",
                "&:hover": {
                  backgroundColor: "#4CAF50",
                },
              }),
              ...(item.variant !== "contained" && {
                color: "#000000",
                "&:hover": {
                  backgroundColor: "#e2e8f0",
                },
              }),
            }}
          >
            <ListItemIcon
              sx={{
                color: item.variant === "contained" ? "#fff" : "#000000",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                color: item.variant === "contained" ? "#fff" : "#000000",
              }}
            />
          </ListItemButton>
        ))}
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
          width: "100%",
          top: 0,
          left: 0,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingX: { xs: 2, md: 10 },
            height: "64px",
          }}
        >
          {/* Ícone do Perfil à esquerda no mobile */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
            }}
          >
            {loading ? (
              <div>Carregando...</div>
            ) : user ? (
              <IconButton onClick={handleMenuClick}>
                <AccountCircleIcon sx={{ color: "#5A67D8" }} />
              </IconButton>
            ) : (
              <IconButton onClick={handleLogin}>
                <LoginIcon sx={{ color: "#2D3748" }} />
              </IconButton>
            )}
          </Box>

          {/* Logo centralizada */}
          <Box
            sx={{
              height: "50px",
              cursor: "pointer",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "scale(1.05)",
              },
              width: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", md: "flex-start" },
              position: "absolute",
              left: { xs: "50%", md: "3%" },
              transform: { xs: "translateX(-50%)", md: "none" },
            }}
            onClick={handleInicio}
          >
            <Image
              src="/logo.png"
              alt="Eventues Logo"
              width={250}
              height={50}
              style={{ objectFit: "contain" }}
            />
          </Box>

          {/* Ícone do Menu (3 traços) à direita no mobile */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
            }}
          >
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ marginLeft: "10px" }} // Adiciona espaço à esquerda
            >
              <MenuIcon sx={{ color: "#000000" }} />
            </IconButton>
          </Box>

          {/* Botões para telas maiores */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" }, // Mostra apenas em telas md ou maiores
              gap: "20px",
              marginLeft: "auto",
              alignItems: "center",
            }}
          >
            {menuItems.map((item, index) => (
              <Button
                key={index}
                startIcon={item.icon}
                variant={item.variant as "contained" | "text" | "outlined" || "text"}
                color={item.color as "success" | "inherit" | "primary" | "secondary" | "error" | "info" | "warning" || "inherit"} 
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  fontSize: "1rem",
                  color: item.variant === "contained" ? "#fff" : "#2D3748",
                  backgroundColor:
                    item.variant === "contained" ? "#68D391" : "transparent",
                  ":hover": item.variant === "contained" ? {
                    transform: "scale(1.05)",
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                  } : {
                    transform: "scale(1.05)",
                    backgroundColor: "#e2e8f0",
                    color: "#2D3748",
                  },
                  transition: "transform 0.2s",
                }}
                onClick={item.action}
              >
                {item.label}
              </Button>
            ))}

            {loading ? (
              <div>Carregando...</div>
            ) : user ? (
              <>
                <Button
                  startIcon={<AccountCircleIcon />}
                  variant="outlined"
                  sx={{
                    borderRadius: "30px",
                    color: "#5A67D8",
                    borderColor: "#5A67D8",
                    textTransform: "none",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    ":hover": {
                      borderColor: "#5A67D8",
                      backgroundColor: "rgba(90, 55, 216, 0.1)",
                    },
                  }}
                  onClick={handleMenuClick}
                >
                  Perfil
                </Button>
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
              </>
            ) : (
              <Button
                startIcon={<LoginIcon />}
                variant="outlined"
                sx={{
                  borderRadius: "30px",
                  color: "#2D3748",
                  borderColor: "#2D3748",
                  textTransform: "none",
                  fontSize: "1rem",
                  ":hover": {
                    borderColor: "#2D3748",
                    backgroundColor: "rgba(90, 55, 216, 0.1)",
                  },
                }}
                onClick={handleLogin}
              >
                Entrar
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerList}
      </Drawer>
    </>
  );
};

export default Navbar;
