import React from 'react';
import { Box, TextField, MenuItem, Button, Stack, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Filters: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#F7FAFC',
        padding: '15px',
        borderRadius: '20px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
        maxWidth: '1200px',
        margin: { xs: '20px auto', md: '0 auto' }, // Margem para telas pequenas e grandes
        position: { xs: 'relative', md: 'absolute' }, // Posicionamento relativo em telas pequenas
        top: { md: '57%' }, // Mantém sobreposto em telas médias e grandes
        left: { md: 0 },
        right: { md: 0 },
        transform: { md: 'translateY(-50%)' }, // Mantém o efeito sobreposto em telas médias e grandes
      }}
    >
      <Stack
        spacing={2}
        direction={{ xs: 'column', md: 'row' }} // Alinha em coluna para telas pequenas e em linha para telas maiores
        alignItems="center"
      >
        <TextField
          variant="outlined"
          placeholder="Procurar eventos..."
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            flexGrow: 1,
            borderRadius: '20px',
            fontSize: '0.875rem',
            width: { xs: '100%', md: 'auto' },
          }}
        />
        <TextField
          select
          label="Local"
          defaultValue=""
          variant="outlined"
          size="small"
          sx={{
            flexGrow: 1,
            borderRadius: '20px',
            fontSize: '0.875rem',
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <MenuItem value="Cidade A">Cidade A</MenuItem>
          <MenuItem value="Cidade B">Cidade B</MenuItem>
        </TextField>
        <TextField
          select
          label="Modalidades"
          defaultValue=""
          variant="outlined"
          size="small"
          sx={{
            flexGrow: 1,
            borderRadius: '20px',
            fontSize: '0.875rem',
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <MenuItem value="Ciclismo">Ciclismo</MenuItem>
          <MenuItem value="Corrida">Corrida</MenuItem>
        </TextField>
        <Button
          variant="contained"
          sx={{
            padding: '8px 15px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            backgroundColor: '#5A67D8',
            color: 'white',
            whiteSpace: 'nowrap',
            width: { xs: '100%', md: 'auto' },
            '&:hover': {
              backgroundColor: '#434190',
            },
          }}
        >
          Procurar
        </Button>
      </Stack>
    </Box>
  );
};

export default Filters;
