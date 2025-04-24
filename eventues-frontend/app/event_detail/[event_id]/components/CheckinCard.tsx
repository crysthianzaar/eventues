"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Switch,
  CircularProgress,
  FormControlLabel,
  Alert,
  Snackbar,
  Chip,
  Button,
  InputAdornment,
  Tooltip,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Grid,
  useTheme,
  IconButton,
  Avatar,
  linearProgressClasses,
  LinearProgress,
  styled,
} from "@mui/material";
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  QrCodeScanner as QrCodeScannerIcon,
  Person as PersonIcon,
  HowToReg as HowToRegIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Percent as PercentIcon,
  FilterList as FilterListIcon,
  EventAvailable as EventAvailableIcon,
} from "@mui/icons-material";
import QRCodeScanner from './QRCodeScanner';
import debounce from "lodash.debounce";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface Participant {
  order_id: string;
  participant_index: number;
  fullName: string;
  gender?: string;
  birthDate?: string;
  categories: Record<string, string>;
  ticket_name: string;
  ticket_id: string;
  qr_code_uuid: string;
  order_status: string;
  created_at: string;
  user_id: string;
  checkin: boolean;
  checkin_timestamp: string | null;
  checkin_by: string | null;
  [key: string]: any; // Para campos dinâmicos adicionais
}

interface CheckinCardProps {
  eventId: string;
  onNotify: (message: string, severity: "success" | "error" | "info" | "warning") => void;
}

const CheckinCard: React.FC<CheckinCardProps> = ({ eventId, onNotify }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyCheckedIn, setShowOnlyCheckedIn] = useState(false);
  const [updatingParticipant, setUpdatingParticipant] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" as "success" | "error" | "info" | "warning" });
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });

  // Obter ID do usuário atual do localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem("user_id") : null;

  // Buscar participantes do evento
  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/participants`);
      
      // Tipagem segura para a resposta da API
      interface ParticipantResponse {
        participants: Participant[];
      }
      
      const data = response.data as ParticipantResponse;
      
      // Os dados já estão com o formato plano correto
      const participantsData = data.participants;
      
      setParticipants(participantsData);
      applyFilters(participantsData, searchTerm, showOnlyCheckedIn);
      
      // Calcular estatísticas
      const totalParticipants = participantsData.length;
      const checkedInParticipants = participantsData.filter((p: Participant) => p.checkin).length;
      setStats({
        total: totalParticipants,
        checkedIn: checkedInParticipants
      });
      
      setError(null);
    } catch (err: any) {
      console.error("Erro ao buscar participantes:", err);
      setError(err.response?.data?.error || "Erro ao buscar participantes do evento");
      onNotify(err.response?.data?.error || "Erro ao buscar participantes do evento", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
    // Configurar polling a cada 30 segundos para manter os dados atualizados
    const pollingInterval = setInterval(fetchParticipants, 30000);
    return () => clearInterval(pollingInterval);
  }, [eventId]);

  // Atualizar filtros quando searchTerm ou showOnlyCheckedIn mudarem
  useEffect(() => {
    applyFilters(participants, searchTerm, showOnlyCheckedIn);
  }, [searchTerm, showOnlyCheckedIn, participants]);

  // Função para aplicar filtros
  const applyFilters = (participantsList: Participant[], search: string, onlyCheckedIn: boolean) => {
    let filtered = [...participantsList];
    
    // Filtrar por termo de pesquisa
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((p) => {
        // Obter categoria se existir
        const categoryValues = p.categories ? Object.values(p.categories) : [];
        const categoryString = categoryValues.join(' ').toLowerCase();
        
        // Verificar se o termo de busca está no nome do participante, gênero, categoria ou tipo de ingresso
        return (
          p.fullName?.toLowerCase().includes(searchLower) ||
          p.gender?.toLowerCase().includes(searchLower) ||
          categoryString.includes(searchLower) ||
          p.ticket_name?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Filtrar apenas participantes com check-in feito
    if (onlyCheckedIn) {
      filtered = filtered.filter((p) => p.checkin);
    }
    
    setFilteredParticipants(filtered);
  };

  // Debounce para a pesquisa
  const debouncedSearch = useMemo(
    () => debounce((term: string) => setSearchTerm(term), 300),
    []
  );

  // Atualizar o status de check-in de um participante
  const updateCheckinStatus = async (participant: Participant, newStatus: boolean) => {
    if (!userId) {
      setSnackbar({
        open: true,
        message: "Você precisa estar logado para realizar check-in",
        severity: "error",
      });
      return;
    }

    const uniqueId = `${participant.order_id}-${participant.participant_index}`;
    try {
      setUpdatingParticipant(uniqueId);
      
      const response = await axios.post(
        `${API_BASE_URL}/events/${eventId}/participants/${participant.order_id}/checkin`,
        {
          participant_index: participant.participant_index,
          checkin_status: newStatus,
          user_id: userId,
        }
      );
      
      // Atualizar participante localmente
      const updatedParticipants = participants.map((p) => {
        if (p.order_id === participant.order_id && p.participant_index === participant.participant_index) {
          return {
            ...p,
            checkin: newStatus,
            checkin_timestamp: newStatus ? new Date().toISOString() : null,
            checkin_by: newStatus ? userId : null,
          };
        }
        return p;
      });
      
      setParticipants(updatedParticipants);
      
      // Atualizar estatísticas
      const checkedInParticipants = updatedParticipants.filter(p => p.checkin).length;
      setStats({
        total: stats.total,
        checkedIn: checkedInParticipants
      });
      
      setSnackbar({
        open: true,
        message: newStatus
          ? `Check-in de ${participant.fullName} realizado com sucesso!`
          : `Check-in de ${participant.fullName} revertido com sucesso!`,
        severity: "success",
      });
    } catch (err: any) {
      console.error("Erro ao atualizar status de check-in:", err);
      setSnackbar({
        open: true,
        message:
          err.response?.data?.error || "Erro ao atualizar status de check-in",
        severity: "error",
      });
    } finally {
      setUpdatingParticipant(null);
    }
  };

  // Função para lidar com QR code escaneado com sucesso
  const handleQRScanSuccess = (participant: Participant) => {
    // Adicionar o participante à lista se ele ainda não estiver presente
    const exists = participants.some(
      p => p.order_id === participant.order_id && p.participant_index === participant.participant_index
    );
    
    if (!exists) {
      const updatedParticipants = [...participants, participant];
      setParticipants(updatedParticipants);
      applyFilters(updatedParticipants, searchTerm, showOnlyCheckedIn);
      
      // Atualizar estatísticas
      const checkedInParticipants = updatedParticipants.filter(p => p.checkin).length;
      setStats({
        total: updatedParticipants.length,
        checkedIn: checkedInParticipants
      });
    } else {
      // Atualizar o estado de check-in do participante existente
      const updatedParticipants = participants.map(p => {
        if (p.order_id === participant.order_id && p.participant_index === participant.participant_index) {
          return { ...p, checkin: participant.checkin, checkin_timestamp: participant.checkin_timestamp };
        }
        return p;
      });
      
      setParticipants(updatedParticipants);
      applyFilters(updatedParticipants, searchTerm, showOnlyCheckedIn);
      
      // Atualizar estatísticas
      const checkedInParticipants = updatedParticipants.filter(p => p.checkin).length;
      setStats({
        total: stats.total,
        checkedIn: checkedInParticipants
      });
    }

    // Mostrar notificação de sucesso
    setSnackbar({
      open: true,
      message: `Check-in de ${participant.fullName} realizado com sucesso!`,
      severity: "success"
    });
    
    // Recarregar os dados para garantir sincronização
    setTimeout(fetchParticipants, 2000);
  };

  // Formatar timestamp
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const theme = useTheme();
  
  // Progress bar estilizada
  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[800],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: theme.palette.primary.main,
    },
  }));

  return (
    <Card elevation={3} sx={{ borderRadius: 3, overflow: 'visible' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventAvailableIcon color="primary" />
            <Typography variant="h5" fontWeight="bold">
              Check-in de Participantes
            </Typography>
          </Box>
        }
        action={
          <Tooltip title="Atualizar lista">
            <IconButton onClick={fetchParticipants} disabled={loading} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        {/* Barra de estatísticas */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              borderRadius: 2, 
              height: '100%',
              background: 'linear-gradient(to right bottom, #ffffff, #f8f9ff)',
              transition: 'transform 0.3s ease', 
              '&:hover': { transform: 'translateY(-5px)' } 
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h6">{stats.total}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total de Participantes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              borderRadius: 2, 
              height: '100%',
              background: 'linear-gradient(to right bottom, #ffffff, #f2fbf6)',
              transition: 'transform 0.3s ease', 
              '&:hover': { transform: 'translateY(-5px)' } 
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{ bgcolor: '#4caf50', mr: 2 }}
                  >
                    <HowToRegIcon />
                  </Avatar>
                  <Typography variant="h6">{stats.checkedIn}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Check-ins Realizados
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              borderRadius: 2, 
              height: '100%',
              background: 'linear-gradient(to right bottom, #ffffff, #fff8f1)',
              transition: 'transform 0.3s ease', 
              '&:hover': { transform: 'translateY(-5px)' } 
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{ bgcolor: '#ff9800', mr: 2 }}
                  >
                    <HourglassEmptyIcon />
                  </Avatar>
                  <Typography variant="h6">{stats.total - stats.checkedIn}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Pendentes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              borderRadius: 2, 
              height: '100%',
              background: 'linear-gradient(to right bottom, #ffffff, #f0f7ff)',
              transition: 'transform 0.3s ease', 
              '&:hover': { transform: 'translateY(-5px)' } 
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{ bgcolor: '#2196f3', mr: 2 }}
                  >
                    <PercentIcon />
                  </Avatar>
                  <Typography variant="h6">
                    {stats.total ? Math.round((stats.checkedIn / stats.total) * 100) : 0}%
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Porcentagem de Check-in
                </Typography>
                <BorderLinearProgress
                  variant="determinate"
                  value={stats.total ? Math.round((stats.checkedIn / stats.total) * 100) : 0}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* QR Code Scanner */}
        <Card elevation={2} sx={{ 
          mb: 3, 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(to right, #f9f9f9, #ffffff)'
        }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                <QrCodeScannerIcon />
              </Avatar>
            }
            title="Check-in por QR Code"
            subheader="Escaneie o QR code do ingresso para fazer check-in rápido"
          />
          <CardContent>
            <QRCodeScanner 
              eventId={eventId} 
              onScanSuccess={handleQRScanSuccess} 
              onScanError={(error) => {
                setSnackbar({
                  open: true,
                  message: error,
                  severity: "error"
                });
              }} 
            />
          </CardContent>
        </Card>

        {/* Barra de filtros */}
        <Card elevation={2} sx={{ 
          mb: 3, 
          borderRadius: 2,
          background: 'linear-gradient(to right, #f9f9f9, #ffffff)'
        }}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                <FilterListIcon />
              </Avatar>
            }
            title="Filtros"
            subheader="Busque por nome, gênero, categoria ou tipo de ingresso"
          />
          <CardContent sx={{ pt: 0 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={7}>
                <TextField
                  label="Buscar participante"
                  variant="outlined"
                  fullWidth
                  size="small"
                  onChange={(e) => debouncedSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderRadius: 2,
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showOnlyCheckedIn}
                        onChange={(e) => setShowOnlyCheckedIn(e.target.checked)}
                        color="success"
                      />
                    }
                    label="Apenas com check-in"
                  />
                  <Button 
                    variant="contained" 
                    onClick={fetchParticipants}
                    startIcon={<RefreshIcon />}
                    disabled={loading}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Atualizar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Exibir erro se houver */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tabela de participantes */}
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Lista de Participantes</Typography>
              </Box>
            }
            sx={{ 
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: theme.palette.background.default,
              pb: 1
            }}
          />

          {loading && participants.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 8 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }} variant="body1" color="text.secondary">
                Carregando participantes...
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: "60vh" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.background.default }}>Check-in</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.background.default }}>Nome</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.background.default }}>Gênero</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.background.default }}>Ingresso</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.background.default }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.background.default }}>Data/Hora Check-in</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredParticipants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.grey[200] }}>
                            <SearchIcon color="disabled" fontSize="large" />
                          </Avatar>
                          <Typography variant="body1" color="text.secondary">
                            Nenhum participante encontrado
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredParticipants.map((participant) => {
                      const uniqueId = `${participant.order_id}-${participant.participant_index}`;
                      const isUpdating = updatingParticipant === uniqueId;
                      // Extrair a primeira categoria se houver várias
                      const categoryValues = participant.categories ? Object.values(participant.categories) : [];
                      const primaryCategory = categoryValues.length > 0 ? categoryValues[0] : "";
                      
                      return (
                        <TableRow 
                          key={uniqueId}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: theme.palette.action.hover,
                            },
                            '&:hover': {
                              backgroundColor: theme.palette.action.selected,
                            },
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <TableCell>
                            {isUpdating ? (
                              <CircularProgress size={24} />
                            ) : (
                              <Switch
                                checked={participant.checkin}
                                onChange={(e) =>
                                  updateCheckinStatus(participant, e.target.checked)
                                }
                                color="success"
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: participant.checkin ? 'bold' : 'normal' }}>
                            {participant.fullName}
                          </TableCell>
                          <TableCell>{participant.gender || "N/A"}</TableCell>
                          <TableCell>
                            <Chip 
                              label={participant.ticket_name} 
                              size="small" 
                              variant="filled" 
                              sx={{ 
                                backgroundColor: theme.palette.primary.light,
                                color: theme.palette.primary.contrastText,
                                fontWeight: 'medium'
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            {participant.checkin ? (
                              <Chip
                                icon={<CheckCircleIcon />}
                                label="Check-in Realizado"
                                color="success"
                                variant="filled"
                                size="small"
                                sx={{ '& .MuiChip-icon': { fontSize: 16 } }}
                              />
                            ) : (
                              <Chip
                                icon={<CancelIcon />}
                                label="Pendente"
                                color="default"
                                variant="outlined"
                                size="small"
                                sx={{ '& .MuiChip-icon': { fontSize: 16 } }}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {formatTimestamp(participant.checkin_timestamp)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Snackbar para notificações */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%', borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
};

export default CheckinCard;
