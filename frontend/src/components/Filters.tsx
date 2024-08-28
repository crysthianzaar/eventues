import React from 'react';
import { Box, TextField, MenuItem, Button, Grid, InputAdornment } from '@mui/material';
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
    padding: '20px',
    borderRadius: '30px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '1200px',
    margin: '0 auto',
    transform: 'translateY(-50%)'
  }}
>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Procurar eventos..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              borderRadius: '30px',
            }}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            select
            label="Local"
            defaultValue=""
            sx={{
              borderRadius: '30px',
            }}
          >
            <MenuItem value="Cidade A">Cidade A</MenuItem>
            <MenuItem value="Cidade B">Cidade B</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            select
            label="Preços"
            defaultValue=""
            sx={{
              borderRadius: '30px',
            }}
          >
            <MenuItem value="Gratuito">Gratuito</MenuItem>
            <MenuItem value="Até R$50">Até R$50</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            select
            label="Datas"
            defaultValue=""
            sx={{
              borderRadius: '30px',
            }}
          >
            <MenuItem value="Este mês">Este mês</MenuItem>
            <MenuItem value="Próximo mês">Próximo mês</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            fullWidth
            select
            label="Modalidades"
            defaultValue=""
            sx={{
              borderRadius: '30px',
            }}
          >
            <MenuItem value="Ciclismo">Ciclismo</MenuItem>
            <MenuItem value="Corrida">Corrida</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={1}>
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: '#5A67D8',
              color: 'white',
              padding: '10px',
              borderRadius: '30px',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#434190',
              },
            }}
          >
            Procurar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Filters;
