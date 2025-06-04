"use client"; // Marca o componente como Client Component

import React, { useState, useEffect } from "react";
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
  Typography,
  Divider,
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
  Close as CloseIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase"; // Certifique-se de ajustar o caminho
import { useRouter, usePathname } from "next/navigation"; // Importação de usePathname
import Image from "next/image"; // Importação do componente next/image
import { useTheme } from "@mui/material/styles"; // Importação do tema

interface MenuItemType {
  label: string;
  path: string;
  icon: JSX.Element;
  action: () => void;
  variant?: "text" | "outlined" | "contained";
  color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
}

const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, loading] = useAuthState(auth); // Autenticação do Firebase
  const router = useRouter();
  const pathname = usePathname(); // Obtém o pathname atual
  const theme = useTheme(); // Obtém o tema para mixins

  // Resetar o menu de perfil sempre que a rota mudar
  useEffect(() => {
    setAnchorEl(null);
  }, [pathname]);

  // Handlers de navegação
  const handleLogin = () => {
    router.push("/login");
  };

  const handleCreateEvent = () => {
    router.push("/criar_evento");
  };

  const handleLogout = () => {
    auth.signOut();
    // Limpar dados de autenticação do localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_id');
    }
    router.push("/");
  };

  const handleInicio = () => {
    router.push("/");
  };

  const handleMyEvents = () => {
    router.push("/meus_eventos");
  };

  const handleMyTickets = () => {
    router.push("/meus_ingressos");
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
  const menuItems: MenuItemType[] = [
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
      label: "Meus Ingressos",
      path: "/meus_ingressos",
      icon: <ArticleIcon/>,
      action: () => handleMyTickets(),
    },
    {
      label: "Contato",
      path: "/contato",
      icon: <ContactMailIcon />,
      action: () => router.push("/contato"),
    }
  ];

  // Handlers para o Drawer (toggle)
  const handleToggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };
  
  // Navegação para novas rotas
  const navigateTo = (path: string) => {
    router.push(path);
    setDrawerOpen(false);
  };

  // Handlers para o Menu de Perfil
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Itens do Drawer com ícones e botão de fechar
  const drawerList = (
    <Box
      sx={{
        width: 280,
        backgroundColor: "#ffffff",
        height: "100%",
        color: "#000000",
        display: "flex",
        flexDirection: "column",
        pt: 2,
      }}
      role="presentation"
    >
      {/* Perfil do usuário no topo */}
      {user && (
        <Box sx={{ px: 3, mb: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, color: "#333" }}>
              {user.displayName || "Usuário"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
              {user.email}
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
        </Box>
      )}
      
      {/* Seção Pessoal */}
      <Box sx={{ px: 3, mb: 1 }}>
        <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, fontSize: "0.7rem", letterSpacing: 0.5 }}>
          Pessoal
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        <ListItemButton onClick={() => navigateTo("/minha_conta")} sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Minha Conta" />
        </ListItemButton>
        
        <ListItemButton onClick={() => navigateTo("/meus_ingressos")} sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <ArticleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Meus Ingressos" />
        </ListItemButton>
      </List>
      
      <Divider sx={{ my: 2, mx: 3 }} />
      
      {/* Seção Organizador */}
      <Box sx={{ px: 3, mb: 1 }}>
        <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, fontSize: "0.7rem", letterSpacing: 0.5 }}>
          Organizador
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        <ListItemButton 
          onClick={handleCreateEvent} 
          sx={{ 
            borderRadius: 1,
            color: "#333",
            '&:hover': {
              backgroundColor: "rgba(0,0,0,0.04)"
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <AddCircleOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Criar Evento" 
            primaryTypographyProps={{ fontSize: "0.95rem" }}
          />
        </ListItemButton>
        
        <ListItemButton 
          onClick={handleMyEvents} 
          sx={{ 
            borderRadius: 1,
            '&:hover': {
              backgroundColor: "rgba(0,0,0,0.04)"
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <EventIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Meus Eventos" 
            primaryTypographyProps={{ fontSize: "0.95rem" }}
          />
        </ListItemButton>
        
        <ListItemButton 
          onClick={() => navigateTo("/minha_equipe")} 
          sx={{ 
            borderRadius: 1,
            '&:hover': {
              backgroundColor: "rgba(0,0,0,0.04)"
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <PersonAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Minha Equipe" 
            primaryTypographyProps={{ fontSize: "0.95rem" }}
          />
        </ListItemButton>
        
        <ListItemButton 
          onClick={() => navigateTo("/participantes")} 
          sx={{ 
            borderRadius: 1,
            '&:hover': {
              backgroundColor: "rgba(0,0,0,0.04)"
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <ContactMailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Participantes" 
            primaryTypographyProps={{ fontSize: "0.95rem" }}
          />
        </ListItemButton>
        
        <ListItemButton 
          onClick={() => navigateTo("/pagina_organizador")} 
          sx={{ 
            borderRadius: 1,
            '&:hover': {
              backgroundColor: "rgba(0,0,0,0.04)"
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <HomeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Página do organizador" 
            primaryTypographyProps={{ fontSize: "0.95rem" }}
          />
        </ListItemButton>
        
        <ListItemButton 
          onClick={() => navigateTo("/carteira")} 
          sx={{ 
            borderRadius: 1,
            '&:hover': {
              backgroundColor: "rgba(0,0,0,0.04)"
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <ArticleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Carteira da organização" 
            primaryTypographyProps={{ fontSize: "0.95rem" }}
          />
        </ListItemButton>
      </List>
      
      <Divider sx={{ my: 2, mx: 3 }} />
      
      {/* Seção Ajuda e Sair */}
      <List sx={{ px: 1, mt: "auto" }}>
        <ListItemButton 
          onClick={() => navigateTo("/ajuda")} 
          sx={{ 
            borderRadius: 1,
            '&:hover': {
              backgroundColor: "rgba(0,0,0,0.04)"
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <InfoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="Ajuda" 
            primaryTypographyProps={{ fontSize: "0.95rem" }}
          />
        </ListItemButton>
        
        {user && (
          <ListItemButton 
            onClick={handleLogout} 
            sx={{ 
              borderRadius: 1,
              '&:hover': {
                backgroundColor: "rgba(0,0,0,0.04)"
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LoginIcon fontSize="small" sx={{ transform: "rotate(180deg)" }} />
            </ListItemIcon>
            <ListItemText 
              primary="Sair" 
              primaryTypographyProps={{ fontSize: "0.95rem" }}
            />
          </ListItemButton>
        )}
      </List>
      
      {/* Botão de fechar na parte superior direita */}
      <IconButton 
        onClick={handleToggleDrawer} 
        aria-label="Fechar menu"
        sx={{ 
          position: "absolute", 
          top: 8, 
          right: 8,
          color: "#666"
        }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed" // Mantém a Navbar fixa
        sx={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          width: "100%",
          left: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1, // Garante que a Navbar esteja acima do Drawer
          boxShadow: "none", // Remove a sombra para parecer mais clean
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
              <Typography variant="body2">Carregando...</Typography>
            ) : user ? (
              <IconButton onClick={handleMenuClick} aria-label="Perfil">
                <AccountCircleIcon sx={{ color: "#5A67D8" }} />
              </IconButton>
            ) : (
              <IconButton onClick={handleLogin} aria-label="Entrar">
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
              position: { xs: "relative", md: "static" }, // Alterado para relativo no mobile
              left: { xs: "0", md: "auto" }, // Removido o posicionamento absoluto no mobile
              transform: { xs: "none", md: "none" }, // Removido o translate no mobile
              margin: { xs: "0 auto", md: "0" }, // Centraliza no mobile
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
              onClick={handleToggleDrawer} // Usar a função de toggle
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
                variant={
                  (item.variant as "contained" | "text" | "outlined") ||
                  "text"
                }
                color={
                  (item.color as
                    | "success"
                    | "inherit"
                    | "primary"
                    | "secondary"
                    | "error"
                    | "info"
                    | "warning") || "inherit"
                }
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  padding: item.variant === "contained" ? "6px 16px" : "5px 16px",
                  color:
                    item.variant === "contained" ? "#fff" : "#2D3748",
                  backgroundColor:
                    item.variant === "contained" ? "#68D391" : "transparent",
                  ":hover": item.variant === "contained"
                    ? {
                        transform: "translateY(-2px)",
                        backgroundColor: "#4CAF50",
                        boxShadow: "0 4px 12px rgba(104, 211, 145, 0.2)",
                        color: "#fff",
                      }
                    : {
                        transform: "translateY(-2px)",
                        backgroundColor: "#e2e8f0",
                        boxShadow: "0 4px 12px rgba(226, 232, 240, 0.4)",
                        color: "#2D3748",
                      },
                  transition: "all 0.2s ease",
                }}
                onClick={item.action}
              >
                {item.label}
              </Button>
            ))}

            {loading ? (
              <Typography variant="body2">Carregando...</Typography>
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
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 16px",
                    transition: "all 0.2s ease",
                    ":hover": {
                      borderColor: "#5A67D8",
                      backgroundColor: "rgba(90, 55, 216, 0.1)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(90, 103, 216, 0.15)",
                    },
                  }}
                  onClick={handleMenuClick}
                >
                  {user.displayName ? user.displayName.split(" ")[0] : "Perfil"}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  keepMounted
                  PaperProps={{
                    sx: {
                      width: 280,
                      mt: 1,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                      padding: '12px 0'
                    }
                  }}
                >
                  {/* Perfil do usuário no topo */}
                  {user && (
                    <Box sx={{ px: 3, mb: 2 }}>
                      <Box sx={{ display: "flex", flexDirection: "column", mb: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500, color: "#333" }}>
                          {user.displayName || "Usuário"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                          {user.email}
                        </Typography>
                      </Box>
                      <Box sx={{ height: 1, backgroundColor: "#e2e8f0", mb: 2, mx: 1 }} />
                    </Box>
                  )}
                  
                  {/* Seção Pessoal */}
                  <Box sx={{ px: 3, mb: 1 }}>
                    <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, fontSize: "0.7rem", letterSpacing: 0.5 }}>
                      Pessoal
                    </Typography>
                  </Box>
                  
                  <MenuItem 
                    onClick={handleAccountSettings}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      px: 2,
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                      Minha Conta
                    </Typography>
                  </MenuItem>
                  
                  <MenuItem 
                    onClick={() => {
                      router.push("/meus_ingressos");
                      handleMenuClose();
                    }}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      px: 2,
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <ArticleIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                      Meus Ingressos
                    </Typography>
                  </MenuItem>

                  <Box sx={{ height: 1, backgroundColor: "#e2e8f0", my: 2, mx: 3 }} />
                  
                  {/* Seção Organizador */}
                  <Box sx={{ px: 3, mb: 1 }}>
                    <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, fontSize: "0.7rem", letterSpacing: 0.5 }}>
                      Organizador
                    </Typography>
                  </Box>
                  
                  <MenuItem 
                    onClick={() => {
                      handleCreateEvent();
                      handleMenuClose();
                    }}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      px: 2,
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <AddCircleOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                      Criar Evento
                    </Typography>
                  </MenuItem>
                  
                  <MenuItem 
                    onClick={() => {
                      handleMyEvents();
                      handleMenuClose();
                    }}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      px: 2,
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <EventIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                      Meus Eventos
                    </Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={() => {
                      router.push("/carteira");
                      handleMenuClose();
                    }}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      px: 2,
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <ArticleIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                      Carteira da organização
                    </Typography>
                  </MenuItem>

                  <Box sx={{ height: 1, backgroundColor: "#e2e8f0", my: 2, mx: 3 }} />
                  
                  {/* Seção Ajuda e Sair */}
                  <MenuItem 
                    onClick={() => {
                      router.push("/contato");
                      handleMenuClose();
                    }}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      px: 2,
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                      Ajuda
                    </Typography>
                  </MenuItem>
                  
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      borderRadius: 1,
                      mx: 1,
                      px: 2,
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 35 }}>
                      <LoginIcon fontSize="small" sx={{ transform: "rotate(180deg)" }} color="error" />
                    </ListItemIcon>
                    <Typography variant="body2" sx={{ fontSize: '0.95rem', color: '#e53935' }}>
                      Sair
                    </Typography>
                  </MenuItem>
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
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  padding: "6px 16px",
                  transition: "all 0.2s ease",
                  ":hover": {
                    borderColor: "#2D3748",
                    backgroundColor: "rgba(45, 55, 72, 0.08)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(45, 55, 72, 0.15)",
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

      {/* Drawer com botão de fechar */}
      <Drawer anchor="right" open={drawerOpen} onClose={handleToggleDrawer}>
        {drawerList}
      </Drawer>

      {/* Espaçador para compensar a altura da Navbar fixa */}
      <Box sx={{ ...theme.mixins.toolbar, mb: 1 }} />
    </>
  );
};

export default Navbar;
