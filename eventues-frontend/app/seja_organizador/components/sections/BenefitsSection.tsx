"use client";

import React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  AttachMoney as AttachMoneyIcon,
  HeadsetMic as HeadsetMicIcon,
  Build as BuildIcon,
  Dashboard as DashboardIcon,
  SvgIconComponent,
} from '@mui/icons-material';

interface BenefitItemProps {
  icon: SvgIconComponent;
  title: string;
  description: string;
}

const BenefitItem: React.FC<BenefitItemProps> = ({ icon: Icon, title, description }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        textAlign: 'center',
        px: 2,
      }}
    >
      <Icon
        color="primary"
        sx={{
          fontSize: { xs: '3rem', md: '4rem' },
          mb: 2,
        }}
      />
      <Typography
        variant={isMobile ? 'h6' : 'h6'}
        sx={{ fontWeight: 'bold', mb: 1 }}
      >
        {title}
      </Typography>
      <Typography variant="body1" sx={{ px: { xs: 1, md: 2 } }}>
        {description}
      </Typography>
    </Box>
  );
};

const benefits: BenefitItemProps[] = [
  {
    icon: AttachMoneyIcon,
    title: 'Taxa de 7,99%',
    description: 'O melhor custo-benefício. Não cobramos taxa para eventos gratuitos.',
  },
  {
    icon: HeadsetMicIcon,
    title: 'Suporte personalizado via WhatsApp',
    description: 'Atendimento rápido e eficiente quando você precisar.',
  },
  {
    icon: BuildIcon,
    title: 'Ferramentas de Marketing Poderosas',
    description: 'Impulsione suas vendas com cupons e pacotes.',
  },
  {
    icon: DashboardIcon,
    title: 'Gestão Completa da Plataforma',
    description: 'Painel de controle, check-in rápido, formulários personalizados, relatórios em tempo real, cupons de desconto e muito mais.',
  },
];

const BenefitsSection: React.FC = () => {
  return (
    <Box sx={{ py: 8 }} id="benefits">
      <Container>
        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={3} key={index}>
              <BenefitItem {...benefit} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default BenefitsSection;
