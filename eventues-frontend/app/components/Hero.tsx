'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = [
    {
      color: '#2C3BBA',
      backgroundImage: 'url("/sport.jpg")',
    },
    {
      color: '#68D391',
      backgroundImage: 'url("/music.jpg")',
    },
    {
      color: '#FF5733',
      backgroundImage: 'url("/estadio.png")',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length);
    }, 5000); // Troca a cada 5 segundos

    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <Box
      sx={{
        height: {
          xs: '30vh',
          sm: '39vh',
          md: '49vh',
          lg: '54vh',
          xl: '49vh',
        }, // Altura ajustada para diferentes tamanhos de tela
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        textAlign: 'center',
        margin: 0, // Remove margens
        padding: 0, // Remove padding
        overflow: 'hidden', // Remove qualquer overflow indesejado
        boxSizing: 'border-box', // Garante que o padding/margin seja considerado no tamanho total do Box
      }}
    >
      {/* Div para aplicar o filtro somente no background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: items[currentIndex].backgroundImage,
          backgroundPosition: 'center', // Centraliza a imagem em todas as telas
          backgroundSize: 'cover', // Ajusta a imagem para preencher o contêiner mantendo a proporção
          backgroundRepeat: 'no-repeat', // Impede que a imagem se repita
          transition: 'background 1s ease-in-out',
          filter: 'grayscale(90%)', // Filtro preto e branco apenas no fundo
          zIndex: -1, // Para garantir que o background fique atrás do conteúdo
        }}
      />

      <Box>
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            fontSize: {
              xs: '1.5rem', // Tamanho da fonte em telas pequenas
              sm: '2rem',   // Tamanho da fonte em telas médias
              md: '3rem',   // Tamanho da fonte em telas grandes
              lg: '4rem',   // Tamanho da fonte em telas muito grandes
            },
            margin: 0, // Remove margem no Typography
          }}
        >
            {/* Container com fundo semitransparente */}
            <Box
              sx={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                backgroundColor: 'rgba(0, 0, 0, 0.4)', // Fundo preto com 30% de opacidade
                borderRadius: '8px',
                backdropFilter: 'blur(2px)', // Adiciona um leve efeito de desfoque
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              {/* Texto fixo */}
              <span
                style={{
                  color: '#FFFFFF',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Sombra mais sutil
                }}
              >
                Encontre o seu evento
              </span>
              {/* Texto dinâmico */}
              <span
                style={{
                  color: items[currentIndex].color,
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)', // Sombra mais sutil
                }}
              >
              </span>
            </Box>
          <span
            style={{
              color: '#FFFFFF',
              textShadow: '4px 4px 4px #000000', // Sombra preta
            }}>
            .
          </span>
        </Typography>
      </Box>
    </Box>
  );
};

export default Hero;
