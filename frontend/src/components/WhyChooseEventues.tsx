// src/components/WhyChooseEventues.tsx
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  Fade,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import logo from "../assets/icon_eventues.png";

// Importação dos ícones para as categorias de Organizadores
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BuildIcon from '@mui/icons-material/Build';
import SpeedIcon from '@mui/icons-material/Speed';
import CampaignIcon from '@mui/icons-material/Campaign';
import SettingsIcon from '@mui/icons-material/Settings';
import PaymentIcon from '@mui/icons-material/Payment';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Importação dos ícones para as categorias de Participantes
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import RedeemIcon from '@mui/icons-material/Redeem';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import InfoIcon from '@mui/icons-material/Info';

// Importação do useNavigate
import { useNavigate } from 'react-router-dom';

// Importação do EconomyCalculator
import EconomyCalculator from './EconomyCalculator';

const WhyChooseEventues: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const navigate = useNavigate(); // Inicialização do navigate

  // Detecta se a tela é pequena (mobile)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Mapeamento de ícones para categorias de Organizadores
  const organizerCategoryIcons: { [key: string]: JSX.Element } = {
    'Economize nas Taxas e Maximize Seus Lucros': <AttachMoneyIcon sx={{ mr: 1, color: '#5A67D8' }} />,
    'Ferramentas Completas para Gerenciar Seu Evento': <BuildIcon sx={{ mr: 1, color: '#5A67D8' }} />,
    'Eficiência e Tecnologia Avançada': <SpeedIcon sx={{ mr: 1, color: '#5A67D8' }} />,
    'Amplifique Seu Alcance com Nossas Ferramentas de Marketing': <CampaignIcon sx={{ mr: 1, color: '#5A67D8' }} />,
    'Flexibilidade e Controle Total': <SettingsIcon sx={{ mr: 1, color: '#5A67D8' }} />,
    'Variedade de Formas de Pagamento': <PaymentIcon sx={{ mr: 1, color: '#5A67D8' }} />,
    'Transparência e Confiança': <VisibilityIcon sx={{ mr: 1, color: '#5A67D8' }} />,
  };

  // Mapeamento de ícones para categorias de Participantes
  const participantCategoryIcons: { [key: string]: JSX.Element } = {
    'Facilidade de Inscrição': <AssignmentTurnedInIcon sx={{ mr: 1, color: '#5A67D8' }} />,
    'Benefícios e Recompensas': <RedeemIcon sx={{ mr: 1, color: '#5A67D8' }} />,
    'Suporte e Atendimento': <SupportAgentIcon sx={{ mr: 1, color: '#5A67D8' }} />,
  };

  // Dados das vantagens para fácil manutenção e escalabilidade
  const advantages = {
    organizers: [
      {
        category: 'Economize nas Taxas e Maximize Seus Lucros',
        advantages: [
          {
            title: 'As Melhores Taxas do Mercado',
            description:
              'Taxas a partir de 7,99% com uma taxa mínima de R$1,99 por ingresso vendido.',
          },
          {
            title: 'Calculadora de Economia',
            description:
              'Simule e descubra o quanto você pode economizar em relação a outras plataformas que cobram até 10% por ingresso.',
          },
          {
            title: 'Transparência Total',
            description:
              'Cobramos somente pelo valor transacionado. Se você oferecer um código de desconto, a taxa incidirá apenas sobre o valor final.',
          },
          {
            title: 'Sem Custos Ocultos',
            description:
              'Não cobramos taxas para ingressos gratuitos ou cortesias. Além disso, não há taxas para sacar os valores disponíveis, independente do banco que você utiliza.',
          },
        ],
      },
      {
        category: 'Ferramentas Completas para Gerenciar Seu Evento',
        advantages: [
          {
            title: 'Painel Resumo',
            description:
              'Visão geral do evento, status atual, principais métricas e ações rápidas em um só lugar.',
          },
          {
            title: 'Detalhes do Evento',
            description:
              'Gerencie informações completas como nome, local, data e descrição.',
          },
          {
            title: 'Ingressos e Inscrições',
            description:
              'Controle total sobre disponibilidade, categorias e preços.',
          },
          {
            title: 'Formulário de Inscrição Personalizável',
            description:
              'Crie campos personalizados para coletar as informações que você precisa dos participantes.',
          },
          {
            title: 'Participantes',
            description:
              'Acompanhe e gerencie a listagem completa de participantes com filtros avançados e opções de exportação.',
          },
          {
            title: 'Check-In Simplificado',
            description:
              'Utilize nossa ferramenta para agilizar o check-in no dia do evento com QR code e controle completo.',
          },
        ],
      },
      {
        category: 'Eficiência e Tecnologia Avançada',
        advantages: [
          {
            title: 'Ferramenta de IA para Resultados',
            description: `
- **Resultados Automáticos**: 
  Carregue seus arquivos PDF/CSV de cronometragem e deixe nossa ferramenta de IA fazer o trabalho pesado. O ranking é atualizado automaticamente, e você só precisa revisar antes de publicar.
- **Centralize Resultados**:
  Tenha um espaço dedicado para exibir todos os resultados das etapas do campeonato, mantendo tudo organizado e acessível em um único lugar.
- **Integração Fácil**:
  Não tem problema se algum evento do seu campeonato não foi organizado conosco. Você pode usar a funcionalidade de IA para manter o ranking e os resultados atualizados do mesmo jeito.
            `,
          },
          {
            title: 'Relatórios e Estatísticas em Tempo Real',
            description:
              'Acompanhe a performance com dados precisos como número de visualizações, taxa de conversão e muito mais.',
          },
          {
            title: 'Gestão Financeira Simplificada',
            description:
              'Visualize um resumo financeiro completo, incluindo taxas pagas e receitas geradas.',
          },
          {
            title: 'Facilidade nos Repasses',
            description:
              'Receba os valores via Pix e faça saques com apenas um clique. Oferecemos antecipação de valores antes do evento terminar.',
          },
        ],
      },
      {
        category: 'Amplifique Seu Alcance com Nossas Ferramentas de Marketing',
        advantages: [
          {
            title: 'Kit de Marketing Personalizado',
            description:
              'Acesse materiais promocionais exclusivos para divulgar seu evento.',
          },
          {
            title: 'Mensagens e Notificações',
            description:
              'Comunique-se diretamente com os participantes via e-mail ou notificações push.',
          },
          {
            title: 'Patrocínios',
            description:
              'Gerencie patrocinadores facilmente, incluindo a inserção de logos e materiais promocionais no seu evento.',
          },
        ],
      },
      {
        category: 'Flexibilidade e Controle Total',
        advantages: [
          {
            title: 'Políticas Personalizáveis',
            description:
              'Configure políticas de cancelamento, reembolso e termos de participação conforme suas necessidades.',
          },
          {
            title: 'Cupons de Desconto',
            description:
              'Crie e gerencie cupons para incentivar mais inscrições.',
          },
          {
            title: 'Agenda e Cronograma',
            description:
              'Mantenha todos informados sobre datas e horários importantes, gerenciando largadas, palestras e mais.',
          },
        ],
      },
      {
        category: 'Variedade de Formas de Pagamento',
        advantages: [
          {
            title: 'Pagamentos Diversificados',
            description:
              'Aceitamos todas as bandeiras de cartão, Pix e boleto.',
          },
          {
            title: 'Parcelamento Flexível',
            description:
              'Ofereça parcelamento em até 12 vezes no cartão, com ou sem juros, e receba o valor à vista.',
          },
          {
            title: 'Venda com Boleto Bancário',
            description:
              'Disponível até 7 dias antes do evento, com processamento automático.',
          },
        ],
      },
      {
        category: 'Transparência e Confiança',
        advantages: [
          {
            title: 'Reembolsos Sem Complicações',
            description:
              'Se precisar reembolsar os compradores, devolvemos 100% da nossa taxa (exceto para compras internacionais).',
          },
          {
            title: 'Integração Fácil',
            description:
              'Mesmo que algum evento do seu campeonato não tenha sido organizado conosco, nossa IA mantém o ranking e os resultados atualizados.',
          },
          {
            title: 'Suporte Dedicado',
            description:
              'Nossa equipe está pronta para ajudar você a cada passo do caminho.',
          },
        ],
      },
    ],
    participants: [
      {
        category: 'Facilidade de Inscrição',
        advantages: [
          {
            title: 'Experiência de Inscrição Simples',
            description:
              'Processo rápido, com várias opções de pagamento, incluindo Pix, cartão de crédito e boleto.',
          },
          {
            title: 'Acompanhamento em Tempo Real',
            description:
              'Acompanhe suas inscrições, rankings e resultados diretamente no seu perfil.',
          },
        ],
      },
      {
        category: 'Benefícios e Recompensas',
        advantages: [
          {
            title: 'Recebimento Imediato de Cupons',
            description:
              'Benefícios exclusivos para quem participa de eventos, com descontos em futuros eventos.',
          },
        ],
      },
      {
        category: 'Suporte e Atendimento',
        advantages: [
          {
            title: 'Atendimento Personalizado',
            description:
              'Suporte dedicado aos participantes durante todo o evento.',
          },
        ],
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

  // Component for Desktop and Tablet View
  const DesktopView = () => (
    <>
      {/* Tabs para alternar entre as vantagens */}
      <Box
        sx={{
          backgroundColor: '#FFF',
          padding: { xs: '20px 10px', sm: '40px 20px' },
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginTop: '40px',
        }}
      >
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
              padding: '12px 16px',
            },
            '& .Mui-selected': {
              color: '#5A67D8',
            },
          }}
        >
          <Tab label="Vantagens para o Organizador" />
          <Tab label="Vantagens para os Participantes" />
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
                  sx={{
                    color: '#5A67D8',
                    mb: 4,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  Vantagens para o Organizador
                </Typography>
                {advantages.organizers.map((categoryObj, index) => (
                  <Accordion
                    key={index}
                    defaultExpanded
                    sx={{
                      mb: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      '&:before': {
                        display: 'none',
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel${index}-content`}
                      id={`panel${index}-header`}
                      sx={{
                        backgroundColor: '#F7FAFC',
                        borderRadius: '8px',
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                        },
                      }}
                    >
                      {organizerCategoryIcons[categoryObj.category] || <InfoIcon sx={{ mr: 2, color: '#5A67D8' }} />}
                      <Typography variant="h6" sx={{ color: '#5A67D8', fontWeight: 'bold' }}>
                        {categoryObj.category}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={4}>
                        {categoryObj.advantages.map((adv, idx) => (
                          <Grid item xs={12} key={idx}>
                            <Box
                              sx={{
                                backgroundColor: '#F7FAFC',
                                borderRadius: '12px',
                                padding: '20px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                  transform: 'translateY(-5px)',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 2,
                                }}
                              >
                                <CheckCircleIcon
                                  color="primary"
                                  sx={{ mr: 2, fontSize: '2rem' }}
                                />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {adv.title}
                                </Typography>
                              </Box>
                              {/* Verifica se o título é 'Calculadora de Economia' */}
                              {adv.title === 'Calculadora de Economia' ? (
                                <EconomyCalculator />
                              ) : (
                                <Typography variant="body1">
                                  {adv.title === 'Ferramenta de IA para Resultados' ? (
                                    <Box>{formatDescription(adv.description)}</Box>
                                  ) : (
                                    adv.description
                                  )}
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
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
                  sx={{
                    color: '#5A67D8',
                    mb: 4,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  Vantagens para os Participantes
                </Typography>
                {advantages.participants.map((categoryObj, index) => (
                  <Accordion
                    key={index}
                    defaultExpanded
                    sx={{
                      mb: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      borderRadius: '8px',
                      '&:before': {
                        display: 'none',
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel-participant${index}-content`}
                      id={`panel-participant${index}-header`}
                      sx={{
                        backgroundColor: '#F7FAFC',
                        borderRadius: '8px',
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                        },
                      }}
                    >
                      {participantCategoryIcons[categoryObj.category] || <InfoIcon sx={{ mr: 2, color: '#5A67D8' }} />}
                      <Typography variant="h6" sx={{ color: '#5A67D8', fontWeight: 'bold' }}>
                        {categoryObj.category}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={4}>
                        {categoryObj.advantages.map((adv, idx) => (
                          <Grid item xs={12} key={idx}>
                            <Box
                              sx={{
                                backgroundColor: '#F7FAFC',
                                borderRadius: '12px',
                                padding: '20px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                  transform: 'translateY(-5px)',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 2,
                                }}
                              >
                                <CheckCircleIcon
                                  color="primary"
                                  sx={{ mr: 2, fontSize: '2rem' }}
                                />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {adv.title}
                                </Typography>
                              </Box>
                              <Typography variant="body1">{adv.description}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </>
            )}
          </Box>
        </Fade>
      </Box>
    </>
  );

  // Component for Mobile View
  const MobileView = () => {
    // Define steps for Stepper
    const steps = [
      {
        label: 'Vantagens para o Organizador',
        content: advantages.organizers.map((categoryObj, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {organizerCategoryIcons[categoryObj.category] || <InfoIcon sx={{ mr: 2, color: '#5A67D8' }} />}
              <Typography variant="h6" sx={{ color: '#5A67D8', fontWeight: 'bold' }}>
                {categoryObj.category}
              </Typography>
            </Box>
            {categoryObj.advantages.map((adv, idx) => (
              <Box
                key={idx}
                sx={{
                  backgroundColor: '#F7FAFC',
                  borderRadius: '8px',
                  padding: '16px',
                  mb: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {adv.title}
                  </Typography>
                </Box>
                {adv.title === 'Calculadora de Economia' ? (
                  <EconomyCalculator />
                ) : (
                  <Typography variant="body2">
                    {adv.title === 'Ferramenta de IA para Resultados' ? (
                      <Box>{formatDescription(adv.description)}</Box>
                    ) : (
                      adv.description
                    )}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )),
      },
      {
        label: 'Vantagens para os Participantes',
        content: advantages.participants.map((categoryObj, index) => (
          <Box key={index} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {participantCategoryIcons[categoryObj.category] || <InfoIcon sx={{ mr: 2, color: '#5A67D8' }} />}
              <Typography variant="h6" sx={{ color: '#5A67D8', fontWeight: 'bold' }}>
                {categoryObj.category}
              </Typography>
            </Box>
            {categoryObj.advantages.map((adv, idx) => (
              <Box
                key={idx}
                sx={{
                  backgroundColor: '#F7FAFC',
                  borderRadius: '8px',
                  padding: '16px',
                  mb: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon color="primary" sx={{ mr: 2 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {adv.title}
                  </Typography>
                </Box>
                <Typography variant="body2">{adv.description}</Typography>
              </Box>
            ))}
          </Box>
        )),
      },
    ];

    return (
      <Box
        sx={{
          backgroundColor: '#FFF',
          padding: { xs: '20px 10px', sm: '40px 20px' },
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginTop: '40px',
        }}
      >
        <Stepper orientation="vertical" nonLinear activeStep={-1}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel sx={{ fontWeight: 'bold', color: '#5A67D8' }}>{step.label}</StepLabel>
              <Box sx={{ mt: 2 }}>{step.content}</Box>
            </Step>
          ))}
        </Stepper>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg">
      {/* Título da página */}

      <Box
        sx={{
          padding: { xs: '40px 10px', sm: '60px 20px' },
          backgroundColor: '#EDF2F7',
          textAlign: 'center',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          marginTop: '40px',
        }}
      >
        <img
          src={logo}
          alt="Eventues Icon"
          style={{ width: '100px', marginBottom: '20px' }}
        />
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
          Seja um Organizador de Sucesso com a Eventues. Transforme a maneira como você gerencia seus eventos. Com a Eventues, você tem acesso a uma plataforma completa, eficiente e econômica, desenhada para atender todas as necessidades do organizador moderno. Foque no que realmente importa: criar experiências inesquecíveis para seus participantes.
        </Typography>

        {/* Adicionando os botões abaixo da descrição */}
        <Box
          sx={{
            marginTop: 4,
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/criar_evento')} // Navegação programática
            sx={{
              px: 5,
              py: 1.5,
              backgroundColor: '#5A67D8',
              '&:hover': { backgroundColor: '#434190' },
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            Criar Evento
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate('/contato')} // Navegação programática
            sx={{
              px: 5,
              py: 1.5,
              borderColor: '#5A67D8',
              color: '#5A67D8',
              '&:hover': {
                borderColor: '#434190',
                color: '#434190',
              },
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            Fale Conosco
          </Button>
        </Box>
      </Box>

      {/* Conditionally render Desktop or Mobile view */}
      {isMobile ? <MobileView /> : <DesktopView />}

      {/* Call to Action */}
      <Box
        sx={{
          textAlign: 'center',
          padding: { xs: '40px 20px', sm: '60px 40px' },
          backgroundColor: '#F7FAFC',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          borderTop: '1px solid #E2E8F0',
          marginTop: '40px',
          borderRadius: '12px',
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold', color: '#5A67D8', mb: 3 }}
        >
          Pronto para elevar seus eventos ao próximo nível?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#4A5568',
            maxWidth: '800px',
            margin: '0 auto',
            mb: 3,
          }}
        >
          Junte-se aos organizadores que já estão transformando suas experiências com a Eventues. Simplifique a gestão, reduza custos e encante seus participantes.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/criar_evento')} // Navegação programática
          sx={{
            px: 5,
            py: 1.5,
            backgroundColor: '#5A67D8',
            '&:hover': { backgroundColor: '#434190' },
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          Crie o Seu Evento Agora Mesmo
        </Button>
      </Box>
    </Container>
  );
};

export default WhyChooseEventues;
