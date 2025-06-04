import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  FormHelperText,
  Divider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { updateEventPolicies, getEventPolicies } from '@/app/apis/api';

interface PoliciesCardProps {
  eventId: string;
  handleNotifyAndAction: (message: string, severity: 'success' | 'error' | 'info' | 'warning', action: () => void) => void;
}

interface EventPolicies {
  installment_enabled: boolean;
  max_installments: number;
}

const PoliciesCard: React.FC<PoliciesCardProps> = ({ eventId, handleNotifyAndAction }) => {
  const [policies, setPolicies] = useState<EventPolicies>({
    installment_enabled: false,
    max_installments: 2
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const data = await getEventPolicies(eventId);
        setPolicies({
          installment_enabled: data?.installment_enabled || false,
          max_installments: data?.max_installments || 2
        });
      } catch (err) {
        console.error('Erro ao carregar políticas:', err);
        setError('Não foi possível carregar as políticas do evento.');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [eventId]);

  const handleSavePolicies = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateEventPolicies(eventId, policies);
      handleNotifyAndAction('Políticas salvas com sucesso!', 'success', () => {});
    } catch (err) {
      console.error('Erro ao salvar políticas:', err);
      setError('Ocorreu um erro ao salvar as políticas do evento.');
      handleNotifyAndAction('Erro ao salvar políticas', 'error', () => {});
    } finally {
      setSaving(false);
    }
  };

  const handleToggleInstallments = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPolicies(prev => ({
      ...prev,
      installment_enabled: event.target.checked
    }));
  };

  const handleMaxInstallmentsChange = (event: any) => {
    setPolicies(prev => ({
      ...prev,
      max_installments: event.target.value
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" height="200px">
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Políticas do Evento
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Configure as políticas que se aplicam ao seu evento.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        <Box mb={4}>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            Opções de Pagamento
          </Typography>

          <Box mb={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={policies.installment_enabled}
                  onChange={handleToggleInstallments}
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center">
                  <Typography>Permitir parcelamento</Typography>
                  <Tooltip title="Ativar esta opção permite que os participantes paguem em parcelas. O repasse de valores será feito conforme as parcelas forem pagas, seguindo a política da Asaas.">
                    <InfoIcon sx={{ ml: 1, fontSize: 18, color: 'info.main' }} />
                  </Tooltip>
                </Box>
              }
            />
            <FormHelperText>
              Habilite para permitir que os participantes paguem em parcelas.
            </FormHelperText>
          </Box>

          {policies.installment_enabled && (
            <Box ml={4}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="max-installments-label">Número máximo de parcelas</InputLabel>
                <Select
                  labelId="max-installments-label"
                  id="max-installments-select"
                  value={policies.max_installments}
                  onChange={handleMaxInstallmentsChange}
                  label="Número máximo de parcelas"
                >
                  {[2, 3, 4, 5, 6].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}x
                  </MenuItem>
                ))}
                </Select>
                <FormHelperText>
                  Selecione o número máximo de parcelas permitidas.
                </FormHelperText>
              </FormControl>

              <Box mt={2} p={2} bgcolor="info.light" borderRadius={1}>
                <Typography variant="body2" color="info.dark">
                  <strong>Importante:</strong> O repasse de valores será realizado à medida que as parcelas 
                  forem pagas. Cada parcela será repassada conforme o cronograma da Asaas após o 
                  recebimento. Consulte os Termos de Serviço para mais detalhes.
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSavePolicies}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {saving ? 'Salvando...' : 'Salvar Políticas'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PoliciesCard;
