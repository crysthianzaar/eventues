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
          <MenuItem value="AC">Acre (AC)</MenuItem>
          <MenuItem value="AL">Alagoas (AL)</MenuItem>
          <MenuItem value="AP">Amapá (AP)</MenuItem>
          <MenuItem value="AM">Amazonas (AM)</MenuItem>
          <MenuItem value="BA">Bahia (BA)</MenuItem>
          <MenuItem value="CE">Ceará (CE)</MenuItem>
          <MenuItem value="DF">Distrito Federal (DF)</MenuItem>
          <MenuItem value="ES">Espírito Santo (ES)</MenuItem>
          <MenuItem value="GO">Goiás (GO)</MenuItem>
          <MenuItem value="MA">Maranhão (MA)</MenuItem>
          <MenuItem value="MT">Mato Grosso (MT)</MenuItem>
          <MenuItem value="MS">Mato Grosso do Sul (MS)</MenuItem>
          <MenuItem value="MG">Minas Gerais (MG)</MenuItem>
          <MenuItem value="PA">Pará (PA)</MenuItem>
          <MenuItem value="PB">Paraíba (PB)</MenuItem>
          <MenuItem value="PR">Paraná (PR)</MenuItem>
          <MenuItem value="PE">Pernambuco (PE)</MenuItem>
          <MenuItem value="PI">Piauí (PI)</MenuItem>
          <MenuItem value="RJ">Rio de Janeiro (RJ)</MenuItem>
          <MenuItem value="RN">Rio Grande do Norte (RN)</MenuItem>
          <MenuItem value="RS">Rio Grande do Sul (RS)</MenuItem>
          <MenuItem value="RO">Rondônia (RO)</MenuItem>
          <MenuItem value="RR">Roraima (RR)</MenuItem>
          <MenuItem value="SC">Santa Catarina (SC)</MenuItem>
          <MenuItem value="SP">São Paulo (SP)</MenuItem>
          <MenuItem value="SE">Sergipe (SE)</MenuItem>
          <MenuItem value="TO">Tocantins (TO)</MenuItem>
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
          <MenuItem value="Artes Marciais">Artes Marciais</MenuItem>
          <MenuItem value="Badminton">Badminton</MenuItem>
          <MenuItem value="Caminhada">Caminhada</MenuItem>
          <MenuItem value="Canoagem">Canoagem</MenuItem>
          <MenuItem value="Ciclismo">Ciclismo</MenuItem>
          <MenuItem value="Corrida de Rua">Corrida de Rua</MenuItem>
          <MenuItem value="Escalada Esportiva">Escalada Esportiva</MenuItem>
          <MenuItem value="Mountain Bike">Mountain Bike</MenuItem>
          <MenuItem value="Natação">Natação</MenuItem>
          <MenuItem value="Skate">Skate</MenuItem>
          <MenuItem value="Surf">Surf</MenuItem>
          <MenuItem value="Tênis">Tênis</MenuItem>
          <MenuItem value="Tiro com Arco">Tiro com Arco</MenuItem>
          <MenuItem value="Triatlo">Triatlo</MenuItem>
          <MenuItem value="Vôlei de Praia">Vôlei de Praia</MenuItem>
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
