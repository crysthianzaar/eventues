'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = [
    {
      word: 'Encontre',
      color: '#2C3BBA',
      backgroundImage: 'url(https://cdn.pixabay.com/photo/2016/11/18/22/24/woman-1837158_960_720.jpg)',
    },
    {
      word: 'Desbrave',
      color: '#68D391',
      backgroundImage: 'url(https://cdn.pixabay.com/photo/2015/03/07/18/24/cycle-663342_960_720.jpg)',
    },
    {
      word: 'Acompanhe',
      color: '#000000',
      backgroundImage: 'url(https://cdn.pixabay.com/photo/2022/02/10/01/30/swimming-7004451_1280.jpg)',
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
        height: { xs: '30vh', sm: '39vh', md: '49vh', lg: '54vh', xl: '49vh' },  // Altura ajustada para diferentes tamanhos de tela
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
          filter: 'grayscale(100%)', // Filtro preto e branco apenas no fundo
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
          {/* Texto que troca de cor e palavra */}
            <span
            style={{
              color: items[currentIndex].color,
              textShadow: '4px 4px 4px #000000', // Sombra preta
            }}
            >
            {items[currentIndex].word}
          </span>{' '}
          <span
            style={{
              color: '#FFFFFF',
              textShadow: '4px 4px 4px #000000', // Sombra preta
            }}
          >
            o seu evento esportivo.
          </span>
        </Typography>
      </Box>
    </Box>
  );
};

export default Hero;
