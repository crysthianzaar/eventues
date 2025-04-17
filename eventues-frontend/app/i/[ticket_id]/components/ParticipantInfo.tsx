'use client';

import { Grid, Paper, Typography } from '@mui/material';
import { Participant } from '../types';

interface ParticipantInfoProps {
  participant: Participant;
}

const ParticipantInfo = ({ participant }: ParticipantInfoProps) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
        Dados do Participante
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="textSecondary">
            Nome
          </Typography>
          <Typography variant="body1">{participant.fullName}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="textSecondary">
            Email
          </Typography>
          <Typography variant="body1">{participant.email}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="textSecondary">
            CPF
          </Typography>
          <Typography variant="body1">{participant.cpf}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="textSecondary">
            Telefone
          </Typography>
          <Typography variant="body1">{participant.phone}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ParticipantInfo;
