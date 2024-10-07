
'use client';

import React, { useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import Hero from '../../components/Hero';

const PrivacyPolicy: React.FC = () => {
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
            Política de Privacidade
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
              Na Eventues, valorizamos sua privacidade e estamos comprometidos em proteger suas informações pessoais. Esta Política de Privacidade descreve como coletamos, usamos, compartilhamos e protegemos seus dados em conformidade com a Lei Geral de Proteção de Dados (LGPD).
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              1. Informações que Coletamos
            </Typography>
            <Typography variant="body1">
              <strong>Dados Pessoais Fornecidos por Você:</strong> Quando você cria uma conta ou utiliza nossos serviços, coletamos informações como nome, e-mail, número de telefone, endereço e informações de pagamento.
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>Dados de Uso:</strong> Coletamos informações sobre como você interage com nossa plataforma, incluindo páginas visitadas, tempo gasto e ações realizadas.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              2. Como Usamos Suas Informações
            </Typography>
            <Typography variant="body1">
              Utilizamos suas informações para:
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <Typography component="li">Fornecer e melhorar nossos serviços;</Typography>
              <Typography component="li">Processar transações e pagamentos;</Typography>
              <Typography component="li">Enviar comunicações relacionadas a eventos e atualizações;</Typography>
              <Typography component="li">Personalizar sua experiência na plataforma;</Typography>
              <Typography component="li">Cumprir obrigações legais e regulatórias.</Typography>
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              3. Compartilhamento de Dados
            </Typography>
            <Typography variant="body1">
              Podemos compartilhar suas informações com:
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <Typography component="li">Organizadores de eventos para os quais você se inscreveu;</Typography>
              <Typography component="li">Prestadores de serviços terceirizados que nos auxiliam em operações comerciais;</Typography>
              <Typography component="li">Autoridades governamentais, quando exigido por lei.</Typography>
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              4. Cookies e Tecnologias Semelhantes
            </Typography>
            <Typography variant="body1">
              Utilizamos cookies e tecnologias semelhantes para melhorar a funcionalidade da plataforma e personalizar sua experiência. Você pode ajustar as configurações do seu navegador para recusar cookies, mas isso pode limitar algumas funcionalidades.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              5. Segurança dos Dados
            </Typography>
            <Typography variant="body1">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, perda ou destruição. No entanto, nenhum método de transmissão ou armazenamento é completamente seguro.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              6. Seus Direitos sob a LGPD
            </Typography>
            <Typography variant="body1">
              De acordo com a LGPD, você tem o direito de:
            </Typography>
            <Typography component="ul" sx={{ pl: 4 }}>
              <Typography component="li">Confirmar a existência de tratamento de dados;</Typography>
              <Typography component="li">Acessar seus dados pessoais;</Typography>
              <Typography component="li">Corrigir dados incompletos, inexatos ou desatualizados;</Typography>
              <Typography component="li">Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;</Typography>
              <Typography component="li">Portabilidade de dados a outro fornecedor de serviço;</Typography>
              <Typography component="li">Revogar consentimento, conforme aplicável.</Typography>
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              7. Retenção de Dados
            </Typography>
            <Typography variant="body1">
              Reteremos suas informações pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção maior seja exigido ou permitido por lei.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              8. Transferência Internacional de Dados
            </Typography>
            <Typography variant="body1">
              Suas informações podem ser transferidas e armazenadas em servidores localizados fora do Brasil. Garantimos que tais transferências estejam em conformidade com as leis aplicáveis e que medidas de proteção adequadas estejam em vigor.
            </Typography>

            <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
              9. Alterações nesta Política
            </Typography>
            <Typography variant="body1">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre quaisquer alterações significativas através da plataforma ou por e-mail.
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

export default PrivacyPolicy;
