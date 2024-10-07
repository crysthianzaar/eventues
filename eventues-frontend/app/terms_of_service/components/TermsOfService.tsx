'use client';

import React, { useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import Hero from '../../components/Hero';

const TermsOfService: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Hero />
      <Box
        sx={{
          padding: { xs: '40px 20px', sm: '60px 40px' },
          backgroundColor: '#EDF2F7',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" sx={{ mb: 3, color: '#5A67D8' }}>
            Termos de Serviço
          </Typography>
          <Box
            sx={{
              maxWidth: 1200,
              margin: '0 auto',
              textAlign: 'left',
              color: '#4A5568',
              lineHeight: 1.6,
            }}
          >
            <Typography variant="body1" sx={{ mb: 2 }}>
              Bem-vindo à Eventues! Ao utilizar nossos serviços, você concorda com os seguintes termos e condições. Por favor, leia atentamente.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              1. Aceitação dos Termos
            </Typography>
            <Typography variant="body1">
              Ao acessar ou usar a plataforma Eventues, você concorda em estar vinculado a estes Termos de Serviço e à nossa Política de Privacidade, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
            </Typography>

            {/* ... restante do conteúdo ... */}
            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              2. Descrição do Serviço
            </Typography>
            <Typography variant="body1">
              A Eventues é uma plataforma que permite a criação, gestão e participação em eventos. Fornecemos ferramentas para organizadores divulgarem seus eventos e para participantes adquirirem ingressos.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              3. Cadastro de Usuário
            </Typography>
            <Typography variant="body1">
              Para utilizar certos recursos, você deve criar uma conta fornecendo informações precisas e atualizadas. Você é responsável por manter a confidencialidade de sua senha e conta.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              4. Privacidade e Proteção de Dados
            </Typography>
            <Typography variant="body1">
              Respeitamos sua privacidade e nos comprometemos a proteger seus dados pessoais em conformidade com a LGPD. Para mais detalhes, consulte nossa Política de Privacidade.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              5. Conduta do Usuário
            </Typography>
            <Typography variant="body1">
              Você concorda em não utilizar a plataforma para fins ilegais ou não autorizados. É proibido violar quaisquer leis em sua jurisdição ao usar os serviços da Eventues.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              6. Propriedade Intelectual
            </Typography>
            <Typography variant="body1">
              Todo o conteúdo disponível na Eventues, incluindo textos, gráficos e logos, é de propriedade da empresa ou licenciado para ela, sendo protegido por leis de direitos autorais.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              7. Limitação de Responsabilidade
            </Typography>
            <Typography variant="body1">
              A Eventues não será responsável por quaisquer danos indiretos, incidentais ou consequenciais decorrentes do uso ou da incapacidade de usar nossos serviços.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              8. Alterações nos Termos
            </Typography>
            <Typography variant="body1">
              Reservamo-nos o direito de modificar estes Termos de Serviço a qualquer momento. Notificaremos sobre quaisquer alterações significativas por meio da plataforma ou por e-mail.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              9. Cancelamento e Encerramento
            </Typography>
            <Typography variant="body1">
              Podemos suspender ou encerrar sua conta se suspeitarmos de qualquer violação destes Termos. Você também pode encerrar sua conta a qualquer momento através das configurações do usuário.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              10. Disposições Gerais
            </Typography>
            <Typography variant="body1">
              Estes Termos constituem o acordo integral entre você e a Eventues. Se qualquer parte for considerada inválida, o restante permanecerá em pleno vigor e efeito.
            </Typography>

            <Typography variant="body1" sx={{ mt: 4, fontStyle: 'italic' }}>
              Última atualização: 24 de setembro de 2024.
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default TermsOfService;
