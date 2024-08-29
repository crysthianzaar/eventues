import React from 'react';
import { Box, TextField, MenuItem, Button, Stack, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Filters: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: '57%',
        left: 0,
        right: 0,
        backgroundColor: '#F7FAFC',
        padding: '15px',
        borderRadius: '40px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
        maxWidth: '1200px',
        margin: '0 auto',
        transform: 'translateY(-50%)'
      }}
    >
      <Stack spacing={2} direction="row" alignItems="center">
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
            flexGrow: 1, // Aumenta o tamanho do campo de pesquisa proporcionalmente
            borderRadius: '20px',
            fontSize: '0.875rem',
          }}
        />
        <TextField
          select
          label="Local"
          defaultValue=""
          variant="outlined"
          size="small"
          sx={{
            flexGrow: 1, // Aumenta o tamanho do filtro proporcionalmente
            borderRadius: '20px',
            fontSize: '0.875rem',
          }}
        >
          <MenuItem value="Cidade A">Cidade A</MenuItem>
          <MenuItem value="Cidade B">Cidade B</MenuItem>
        </TextField>
        <TextField
          select
          label="Preços"
          defaultValue=""
          variant="outlined"
          size="small"
          sx={{
            flexGrow: 1, // Aumenta o tamanho do filtro proporcionalmente
            borderRadius: '20px',
            fontSize: '0.875rem',
          }}
        >
          <MenuItem value="Gratuito">Gratuito</MenuItem>
          <MenuItem value="Até R$50">Até R$50</MenuItem>
        </TextField>
        <TextField
          select
          label="Datas"
          defaultValue=""
          variant="outlined"
          size="small"
          sx={{
            flexGrow: 1, // Aumenta o tamanho do filtro proporcionalmente
            borderRadius: '20px',
            fontSize: '0.875rem',
          }}
        >
          <MenuItem value="Este mês">Este mês</MenuItem>
          <MenuItem value="Próximo mês">Próximo mês</MenuItem>
        </TextField>
        <TextField
          select
          label="Modalidades"
          defaultValue=""
          variant="outlined"
          size="small"
          sx={{
            flexGrow: 1, // Aumenta o tamanho do filtro proporcionalmente
            borderRadius: '20px',
            fontSize: '0.875rem',
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
