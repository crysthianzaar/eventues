'use client';
import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Paper, 
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  ConfirmationNumber as TicketIcon,
  Assignment as FormIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Payments as PaymentsIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface EventManagementNavProps {
  eventId: string;
}

export default function EventManagementNav({ eventId }: EventManagementNavProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems = [
    { 
      label: 'Visão Geral', 
      icon: <DashboardIcon />, 
      href: `/meus_eventos/${eventId}` 
    },
    { 
      label: 'Informações', 
      icon: <DescriptionIcon />, 
      href: `/meus_eventos/${eventId}/informacoes` 
    },
    { 
      label: 'Ingressos', 
      icon: <TicketIcon />, 
      href: `/meus_eventos/${eventId}/ingressos` 
    },
    { 
      label: 'Formulário de Inscrição', 
      icon: <FormIcon />, 
      href: `/meus_eventos/${eventId}/formulario` 
    },
    { 
      label: 'Participantes', 
      icon: <PeopleIcon />, 
      href: `/meus_eventos/${eventId}/participantes` 
    },
    { 
      label: 'Pagamentos', 
      icon: <PaymentsIcon />, 
      href: `/meus_eventos/${eventId}/pagamentos` 
    },
    { 
      label: 'Configurações', 
      icon: <SettingsIcon />, 
      href: `/meus_eventos/${eventId}/configuracoes` 
    }
  ];

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        width: isMobile ? '100%' : '250px',
        mb: isMobile ? 2 : 0,
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <List component="nav" sx={{ p: 0 }}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          
          return (
            <React.Fragment key={item.label}>
              {index > 0 && <Divider />}
              <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItem 
                  component="div"
                  sx={{ 
                    py: 1.5,
                    backgroundColor: isActive ? 'rgba(90, 103, 216, 0.1)' : 'transparent',
                    borderLeft: isActive ? '4px solid #5A67D8' : '4px solid transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(90, 103, 216, 0.05)'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#5A67D8' : 'inherit', minWidth: '40px' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#5A67D8' : 'inherit'
                    }} 
                  />
                </ListItem>
              </Link>
            </React.Fragment>
          );
        })}
      </List>
    </Paper>
  );
}
