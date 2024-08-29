import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

const Hero: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = [
    {
      word: 'Encontre',
      color: '#5A67D8',
      backgroundImage: 'url(https://cdn.pixabay.com/photo/2016/11/18/22/24/woman-1837158_960_720.jpg)',
    },
    {
      word: 'Crie',
      color: '#68D391',
      backgroundImage: 'url(https://cdn.pixabay.com/photo/2015/03/07/18/24/cycle-663342_960_720.jpg)',
    },
    {
      word: 'Gerencie',
      color: '#000000',
      backgroundImage: 'url(https://cdn.pixabay.com/photo/2023/06/15/10/03/surfing-8065035_1280.jpg)',
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
        height: '50vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        textAlign: 'center',
        marginBottom: 0,
        overflow: 'hidden',
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
          background: `${items[currentIndex].backgroundImage} center center / cover no-repeat`,
          transition: 'background 1s ease-in-out',
          filter: 'grayscale(100%)', // Filtro preto e branco apenas no fundo
          zIndex: -1, // Para garantir que o background fique atrás do conteúdo
        }}
      />

      <Box>
        <Typography variant="h2" gutterBottom>
          {/* Texto que troca de cor e palavra */}
          <span
            style={{
              color: items[currentIndex].color,
              textShadow: '2px 2px 4px #000000', // Borda preta
            }}
          >
            {items[currentIndex].word}
          </span>{' '}
          {/* Texto fixo com borda preta e cor branca */}
          <span
            style={{
              color: '#FFFFFF',
              textShadow: '2px 2px 4px #000000', // Borda preta no texto fixo
            }}
          >
            o seu evento esportivo em minutos.
          </span>
        </Typography>

        {/* Texto "EM BREVE..." abaixo */}
        <Typography
          variant="h4"
          sx={{
            color: '#FFFFFF',
            textShadow: '2px 2px 4px #000000', // Borda preta
          }}
        >
          EM BREVE...
        </Typography>
      </Box>
    </Box>
  );
};

export default Hero;
