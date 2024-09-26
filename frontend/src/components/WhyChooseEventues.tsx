import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Fade,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon,
  SupportAgent as SupportAgentIcon,
  Campaign as CampaignIcon, // Substituto para 'Marketing'
  Calculate as CalculateIcon,
  CheckCircle as CheckCircleIcon, // Substituto para 'CheckIn'
  Report as ReportIcon,
  AccountBalance as AccountBalanceIcon, // Substituto para 'FinancialManagement'
  CreditCard as CreditCardIcon, // Substituto para 'PaymentGateway'
  Memory as MemoryIcon, // Substituto para 'AI'
  Dashboard as DashboardIcon, // Substituto para 'Portal'
} from '@mui/icons-material'; // Importação corrigida dos ícones

const WhyChooseEventues: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Dados das vantagens para fácil manutenção e escalabilidade
  const advantages = {
    participants: [
      {
        icon: <PaymentIcon fontSize="large" color="primary" />,
        title: 'Experiência de Inscrição Simples',
        description:
          'Processo rápido, com várias opções de pagamento, incluindo Pix, cartão de crédito e boleto.',
      },
      {
        icon: <EventNoteIcon fontSize="large" color="primary" />,
        title: 'Recebimento Imediato de Cupons',
        description:
          'Benefícios exclusivos para quem participa de eventos, com descontos em futuros eventos.',
      },
      {
        icon: <VisibilityIcon fontSize="large" color="primary" />,
        title: 'Acompanhamento em Tempo Real',
        description:
          'Acompanhe suas inscrições, rankings e resultados diretamente no seu perfil.',
      },
      {
        icon: <SupportAgentIcon fontSize="large" color="primary" />,
        title: 'Atendimento Personalizado',
        description:
          'Suporte dedicado aos participantes durante todo o evento.',
      },
    ],
    organizers: [
      {
        icon: <CampaignIcon fontSize="large" color="primary" />,
        title: 'Kit de Marketing Personalizado',
        description:
          'Templates prontos para divulgar o evento de forma profissional.',
      },
      {
        icon: <CalculateIcon fontSize="large" color="primary" />,
        title: 'Calculadora de Custos',
        description:
          'Compare a economia de taxas da Eventues em relação às plataformas tradicionais.',
      },
      {
        icon: <CheckCircleIcon fontSize="large" color="primary" />,
        title: 'Check-in Digital',
        description:
          'Agilize a entrada dos participantes com QR code e controle completo.',
      },
      {
        icon: <ReportIcon fontSize="large" color="primary" />,
        title: 'Relatórios Detalhados',
        description:
          'Acompanhe inscrições, pagamentos e o desempenho do evento com relatórios customizáveis.',
      },
      {
        icon: <AccountBalanceIcon fontSize="large" color="primary" />,
        title: 'Gestão Financeira Completa',
        description:
          'Gerencie receitas e despesas de forma fácil e transparente.',
      },
      {
        icon: <CreditCardIcon fontSize="large" color="primary" />,
        title: 'Facilidade nos Repasses',
        description:
          'Receba o valor das inscrições com rapidez e segurança.',
      },
      {
        icon: <MemoryIcon fontSize="large" color="primary" />,
        title: 'Ferramenta de IA',
        description: `
          Resultados Automáticos: Carregue seus arquivos PDF/CSV de cronometragem e deixe nossa ferramenta de IA fazer o trabalho pesado. O ranking é atualizado automaticamente, e você só precisa revisar antes de publicar.
          Centralize Resultados: Tenha um espaço dedicado para exibir todos os resultados das etapas do campeonato, mantendo tudo organizado e acessível em um único lugar.
          Integração Fácil: Não tem problema se algum evento do seu campeonato não foi organizado conosco. Você pode usar a funcionalidade de IA para manter o ranking e os resultados atualizados do mesmo jeito.
        `,
      },
      {
        icon: <DashboardIcon fontSize="large" color="primary" />,
        title: 'Portal Personalizado',
        description:
          'Um portal exclusivo para consolidar informações, resultados e próximas etapas do seu evento.',
      },
    ],
  };

  // Função para formatar o texto das descrições com listas
  const formatDescription = (description: string) => {
    return description.split('\n').map((str, index) => {
      if (str.startsWith('- **')) {
        // É um item de lista
        const cleanStr = str.replace('- **', '').replace('**:', ':');
        const [label, ...rest] = cleanStr.split(': ');
        return (
          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mr: 1 }}>
              {label}:
            </Typography>
            <Typography variant="body1">{rest.join(': ')}</Typography>
          </Box>
        );
      } else if (str.trim() === '') {
        return null;
      } else {
        return (
          <Typography key={index} variant="body1" sx={{ mb: 1 }}>
            {str}
          </Typography>
        );
      }
    });
  };

  return (
    <Box>
      {/* Título da página */}
      <Box
        sx={{
          padding: { xs: '40px 10px', sm: '60px 20px' },
          backgroundColor: '#EDF2F7',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h4"
          component="h2"
          sx={{ mb: 3, color: '#5A67D8', fontWeight: 'bold' }}
        >
          Por que escolher a Eventues?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: 800,
            margin: '0 auto',
            color: '#4A5568',
            fontSize: { xs: '1rem', sm: '1.125rem' },
          }}
        >
          Descubra as vantagens exclusivas que oferecemos tanto para participantes quanto para organizadores de eventos esportivos.
        </Typography>
      </Box>

      {/* Tabs para alternar entre as vantagens */}
      <Box sx={{ backgroundColor: '#FFF', padding: { xs: '10px', sm: '20px' } }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          indicatorColor="primary"
          textColor="primary"
          sx={{
            marginBottom: '20px',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
            },
          }}
        >
          <Tab label="Vantagens para os Participantes" />
          <Tab label="Vantagens para o Organizador" />
        </Tabs>

        {/* Conteúdo baseado na tab selecionada com animação Fade */}
        <Fade in={activeTab === 0}>
          <Box
            sx={{
              padding: '20px',
              color: '#4A5568',
              maxWidth: 1200,
              margin: '0 auto',
            }}
          >
            {activeTab === 0 && (
              <>
                <Typography
                  variant="h5"
                  sx={{ color: '#5A67D8', mb: 4, fontWeight: 'bold', textAlign: 'center' }}
                >
                  Vantagens para os Participantes
                </Typography>
                <Box>
                  {advantages.participants.map((adv, index) => (
                    <Accordion key={index} sx={{ mb: 2 }} defaultExpanded>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panelP${index}-content`}
                        id={`panelP${index}-header`}
                        sx={{
                          backgroundColor: '#F7FAFC',
                          borderRadius: '8px',
                          '&:hover': {
                            backgroundColor: '#EDF2F7',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {adv.icon}
                          <Typography sx={{ ml: 2, fontWeight: 'bold', color: '#5A67D8' }}>
                            {adv.title}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>{adv.description}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Fade>

        <Fade in={activeTab === 1}>
          <Box
            sx={{
              padding: '20px',
              color: '#4A5568',
              maxWidth: 1200,
              margin: '0 auto',
            }}
          >
            {activeTab === 1 && (
              <>
                <Typography
                  variant="h5"
                  sx={{ color: '#5A67D8', mb: 4, fontWeight: 'bold', textAlign: 'center' }}
                >
                  Vantagens para o Organizador
                </Typography>
                <Box>
                  {advantages.organizers.map((adv, index) => (
                    <Accordion key={index} sx={{ mb: 2 }} defaultExpanded>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panelO${index}-content`}
                        id={`panelO${index}-header`}
                        sx={{
                          backgroundColor: '#F7FAFC',
                          borderRadius: '8px',
                          '&:hover': {
                            backgroundColor: '#EDF2F7',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {adv.icon}
                          <Typography sx={{ ml: 2, fontWeight: 'bold', color: '#5A67D8' }}>
                            {adv.title}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography component="div">
                          {adv.title === 'Ferramenta de IA' ? (
                            <Box>
                              {formatDescription(adv.description)}
                            </Box>
                          ) : (
                            <Typography>{adv.description}</Typography>
                          )}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default WhyChooseEventues;
