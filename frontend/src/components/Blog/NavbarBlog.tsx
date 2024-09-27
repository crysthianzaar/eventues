// src/components/NavbarBlog.tsx
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
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  ContactMail as ContactMailIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/blog-logo.png";

interface MenuItemProps {
  label: string;
  path?: string;
  icon: React.ReactElement;
  action?: () => void;
  variant?: "contained" | "outlined" | "text"; // Tipo de botão
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning" | "inherit"; 
}

const NavbarBlog: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  // Handlers de navegação
  const handleHome = () => {
    navigate("/blog");
  };

  const handleEventuesHome = () => {
    navigate("/");
  };

  const handleContact = () => {
    navigate("/blog/contact");
  };

  const handleBlogHome = () => {
    navigate("/blog");
  };

  // Definição dos itens do menu
  const menuItems: MenuItemProps[] = [
    {
      label: "Blog Home",
      path: "/blog",
      icon: <ArticleIcon />,
      action: () => handleBlogHome(),
      variant: "text",
      color: "inherit",
    },
    {
      label: "Eventues Home",
      path: "/",
      icon: <HomeIcon />,
      action: () => handleEventuesHome(),
      variant: "text",
      color: "inherit",
    },
    {
      label: "Contato",
      path: "/blog/contact",
      icon: <ContactMailIcon />,
      action: () => handleContact(),
      variant: "text",
      color: "inherit",
    }
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

  // Handlers para o Menu de Perfil (opcional, se necessário)
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
        backgroundColor: "#ffffff", // Fundo branco
        height: "100%", // Garante que o fundo cubra toda a altura
        color: "#000000", // Texto preto por padrão
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
                backgroundColor: "#68D391", // Verde um pouco mais escuro
                color: "#fff",
                borderRadius: "8px",
                marginY: "4px",
                "&:hover": {
                  backgroundColor: "#4CAF50", // Verde mais escuro no hover
                },
              }),
              ...(item.variant !== "contained" && {
                color: "#000000", // Texto preto para itens não contidos
                "&:hover": {
                  backgroundColor: "#e2e8f0", // Cinza claro no hover
                },
              }),
            }}
          >
            <ListItemIcon
              sx={{
                color: item.variant === "contained" ? "#fff" : "#000000", // Ícones pretos para itens não contidos
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              sx={{
                color: item.variant === "contained" ? "#fff" : "#000000", // Texto preto para itens não contidos
              }}
            />
          </ListItemButton>
        ))}
        {/* Adicionar item de login ou perfil se necessário */}
        {/* Por exemplo:
        {!user && (
          <ListItemButton onClick={handleLogin} sx={{ color: "#000000" }}>
            <ListItemIcon sx={{ color: "#000000" }}>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Entrar" />
          </ListItemButton>
        )}
        */}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "#5A67D8", // Cor de fundo similar ao Navbar.tsx
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Sombra sutil
          borderBottom: "1px solid #e2e8f0", // Borda inferior
          transition: "box-shadow 0.3s ease-in-out, border-bottom 0.3s ease-in-out",
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            paddingX: { xs: 2, md: 10 },
            height: "64px", // Altura padrão do AppBar
          }}
        >
          {/* Esquerda: Ícone do Menu no Mobile */}
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon sx={{ color: "#000000" }} /> {/* Ícone preto */}
          </IconButton>

          {/* Centro: Logo Centralizada */}
          <Box
            component="img"
            src={logo}
            alt="Eventues Blog Logo"
            onClick={handleBlogHome}
            sx={{
              height: "50px",
              cursor: "pointer",
              transition: "transform 0.3s",
              "&:hover": {
                transform: "scale(1.05)",
              },
              position: { xs: "absolute", md: "static" },
              left: { xs: "50%", md: "unset" },
              transform: { xs: "translateX(-50%)", md: "none" },
            }}
          />

          {/* Direita: Botões de Navegação no Desktop */}
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
                variant={item.variant || "text"} // Aplicar variante se existir
                color={item.color || "inherit"} // Aplicar cor se existir
                sx={{
                  borderRadius: "20px", // Bordas mais arredondadas
                  textTransform: "none",
                  fontSize: "1rem",
                  color: item.variant === "contained" ? "#fff" : "#ffffff", // Texto branco se contido, ou branco por padrão
                  backgroundColor:
                    item.variant === "contained" ? "#68D391" : "transparent", // Verde para contido
                  ":hover": item.variant === "contained"
                    ? {
                        transform: "scale(1.05)",
                        backgroundColor: "#4CAF50", // Verde mais escuro no hover
                        color: "#fff",
                      }
                    : {
                        transform: "scale(1.05)",
                        backgroundColor: "#e2e8f0", // Cinza claro no hover
                        color: "#ffffff",
                      },
                  transition: "transform 0.2s",
                }}
                onClick={item.action}
              >
                {item.label}
              </Button>
            ))}

            {/* Botão de Perfil ou Login (opcional, se necessário) */}
            {/* Por exemplo:
            {user ? (
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
                  <MenuItem onClick={() => navigate("/profile")}>Minha Conta</MenuItem>
                  <MenuItem onClick={() => navigate("/settings")}>
                    Configurações
                  </MenuItem>
                  <MenuItem onClick={() => signOut()}>Sair</MenuItem>
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
                onClick={() => navigate("/login")}
              >
                Entrar
              </Button>
            )}
            */}
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

export default NavbarBlog;
