import React, { useState } from 'react';
import { Box, TextField, Button, Stack, InputAdornment, Autocomplete } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const estados = [
  { label: 'Acre (AC)' },
  { label: 'Alagoas (AL)' },
  { label: 'Amapá (AP)' },
  { label: 'Amazonas (AM)' },
  { label: 'Bahia (BA)' },
  { label: 'Ceará (CE)' },
  { label: 'Distrito Federal (DF)' },
  { label: 'Espírito Santo (ES)' },
  { label: 'Goiás (GO)' },
  { label: 'Maranhão (MA)' },
  { label: 'Mato Grosso (MT)' },
  { label: 'Mato Grosso do Sul (MS)' },
  { label: 'Minas Gerais (MG)' },
  { label: 'Pará (PA)' },
  { label: 'Paraíba (PB)' },
  { label: 'Paraná (PR)' },
  { label: 'Pernambuco (PE)' },
  { label: 'Piauí (PI)' },
  { label: 'Rio de Janeiro (RJ)' },
  { label: 'Rio Grande do Norte (RN)' },
  { label: 'Rio Grande do Sul (RS)' },
  { label: 'Rondônia (RO)' },
  { label: 'Roraima (RR)' },
  { label: 'Santa Catarina (SC)' },
  { label: 'São Paulo (SP)' },
  { label: 'Sergipe (SE)' },
  { label: 'Tocantins (TO)' },
];

const modalidades = [
  { label: 'Artes Marciais' },
  { label: 'Badminton' },
  { label: 'Caminhada' },
  { label: 'Canoagem' },
  { label: 'Ciclismo' },
  { label: 'Corrida de Rua' },
  { label: 'Escalada Esportiva' },
  { label: 'Mountain Bike' },
  { label: 'Natação' },
  { label: 'Skate' },
  { label: 'Surf' },
  { label: 'Tênis' },
  { label: 'Tiro com Arco' },
  { label: 'Triatlo' },
  { label: 'Vôlei de Praia' },
];

const Filters: React.FC = () => {
  const [searchValue, setSearchValue] = useState('');

  return (
    <Box
      sx={{
        backgroundColor: '#F7FAFC',
        padding: '15px',
        borderRadius: '20px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
        maxWidth: '1200px',
        margin: { xs: '20px auto', md: '0 auto' },
        position: { xs: 'relative', md: 'absolute' },
        top: { md: '57%' },
        left: { md: 0 },
        right: { md: 0 },
        transform: { md: 'translateY(-50%)' },
      }}
    >
      <Stack
        spacing={2}
        direction={{ xs: 'column', md: 'row' }}
        alignItems="center"
      >
        <TextField
          variant="outlined"
          placeholder="Procurar eventos..."
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            borderRadius: '20px',
            fontSize: '0.875rem',
            width: '100%',
          }}
        />

        <Autocomplete
          options={estados}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => (
            <TextField {...params} label="Local" variant="outlined" size="small" />
          )}
          sx={{
            borderRadius: '20px',
            fontSize: '0.875rem',
            width: '100%',
          }}
        />

        <Autocomplete
          options={modalidades}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => (
            <TextField {...params} label="Modalidades" variant="outlined" size="small" />
          )}
          sx={{
            borderRadius: '20px',
            fontSize: '0.875rem',
            width: '100%',
          }}
        />

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
            width: '100%',
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
