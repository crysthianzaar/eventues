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
import { useRouter } from "next/navigation"; // Usar 'next/navigation' ao invés de 'next/router'
import Image from "next/image"; // Importação do componente next/image

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();

  // Handlers de navegação
  const handleLogin = () => {
    router.push("/login");
  };

  const handleCreateEvent = () => {
    router.push("/criar_evento");
  };

  const handleLogout = () => {
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
        {/* Adicionar item de login */}
        <ListItemButton onClick={handleLogin} sx={{ color: "#000000" }}>
          <ListItemIcon sx={{ color: "#000000" }}>
            <LoginIcon />
          </ListItemIcon>
          <ListItemText primary="Entrar" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static" // Fixa o AppBar no topo
        sx={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          width: "100%", // O AppBar vai ocupar 100% da largura da tela
          top: 0, // Coloca o AppBar colado ao topo
          left: 0, // Coloca o AppBar colado à esquerda
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
          {/* Ícone do Menu no Mobile */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon sx={{ color: "#000000" }} />
          </IconButton>

          {/* Logo Responsiva */}
          <Box
          sx={{
            height: "50px",
            cursor: "pointer",
            transition: "transform 0.3s",
            "&:hover": {
              transform: "scale(1.05)",
            },
            width: "150px", // Dimensão ajustada da logo
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" }, // Centralizado em mobile, à esquerda em telas maiores
            position: "absolute", // Para garantir que a logo fique na posição correta
            left: { xs: "50%", md: "3%" }, // Centraliza em dispositivos móveis
            transform: { xs: "translateX(-50%)", md: "none" }, // Ajusta a transformação para centralização em mobile
          }}
          onClick={handleInicio}
        >
          <Image
            src="/logo.png" // Caminho relativo dentro de /public
            alt="Eventues Logo"
            width={250}
            height={50} // Ajusta a largura e altura diretamente
            style={{ objectFit: "contain" }} // Garante que a imagem não distorça
          />
        </Box>

          {/* Botões de Navegação no Desktop */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
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
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer para Mobile */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerList}
      </Drawer>
    </>
  );
};

export default Navbar;
