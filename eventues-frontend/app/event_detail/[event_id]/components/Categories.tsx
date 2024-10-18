// src/components/Categories/Categories.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';
import { v4 as uuidv4 } from 'uuid';
import api from '../apis/api';

// Tipos TypeScript
type Subcategoria = {
  id: string;
  nome: string;
  genero: 'Masculina' | 'Feminina' | 'Unissex';
  idadeMinima: number;
  idadeMaxima: number;
  dataReferenciaIdade: 'Dia da Prova' | '31 de Dezembro';
  limiteParticipantes: number;
  requisitos?: string;
};

type Categoria = {
  id: string;
  nome: string;
  descricao?: string;
  subcategorias: Subcategoria[];
  ingressoId: string; // Vinculado ao ingresso
  genero: 'Masculina' | 'Feminina' | 'Unissex';
  idadeMinima: number;
  idadeMaxima: number;
  dataReferenciaIdade: 'Dia da Prova' | '31 de Dezembro';
  limiteParticipantes: number;
  requisitos?: string; // Outros requisitos específicos
};

type Ingresso = {
  id: string;
  nome: string;
  // Adicione outros campos conforme a resposta da API
};

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentCategoria, setCurrentCategoria] = useState<Categoria | null>(null);

  // Estados para formulário
  const [nome, setNome] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [ingressoId, setIngressoId] = useState<string>('');
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [genero, setGenero] = useState<'Masculina' | 'Feminina' | 'Unissex'>('Unissex');
  const [idadeMinima, setIdadeMinima] = useState<number>(0);
  const [idadeMaxima, setIdadeMaxima] = useState<number>(0);
  const [dataReferenciaIdade, setDataReferenciaIdade] = useState<'Dia da Prova' | '31 de Dezembro'>('Dia da Prova');
  const [limiteParticipantes, setLimiteParticipantes] = useState<number>(0);
  const [requisitos, setRequisitos] = useState<string>('');
  const [definirPoliticasIndividualmente, setDefinirPoliticasIndividualmente] = useState<boolean>(false);

  // Estados para Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const theme = useTheme();

  // Funções para Snackbar
  const handleSnackbarOpen = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Fetch ingressos do backend
  useEffect(() => {
    const fetchIngressos = async () => {
      setLoading(true);
      try {
        const response = await api.get<Ingresso[]>('/ingressos'); // Substitua pela rota correta
        setIngressos(response.data);
      } catch (error) {
        console.error('Erro ao buscar ingressos:', error);
        handleSnackbarOpen('Erro ao buscar ingressos.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchIngressos();
  }, []);

  // Fetch categories do backend
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await api.get<Categoria[]>('/categories'); // Substitua pela rota correta
        setCategories(response.data);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        handleSnackbarOpen('Erro ao buscar categorias.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Abrir modal para adicionar categoria
  const handleOpenModal = () => {
    setIsEditMode(false);
    setNome('');
    setDescricao('');
    setIngressoId('');
    setSubcategorias([]);
    setGenero('Unissex');
    setIdadeMinima(0);
    setIdadeMaxima(0);
    setDataReferenciaIdade('Dia da Prova');
    setLimiteParticipantes(0);
    setRequisitos('');
    setDefinirPoliticasIndividualmente(true);
    setModalOpen(true);
  };

  // Abrir modal para editar categoria
  const handleEditCategoria = (categoria: Categoria) => {
    setIsEditMode(true);
    setCurrentCategoria(categoria);
    setNome(categoria.nome);
    setDescricao(categoria.descricao || '');
    setIngressoId(categoria.ingressoId);
    setSubcategorias(categoria.subcategorias);
    setGenero(categoria.genero);
    setIdadeMinima(categoria.idadeMinima);
    setIdadeMaxima(categoria.idadeMaxima);
    setDataReferenciaIdade(categoria.dataReferenciaIdade);
    setLimiteParticipantes(categoria.limiteParticipantes);
    setRequisitos(categoria.requisitos || '');
    // Determinar se as políticas das subcategorias são individuais
    const politicasIndividuais = categoria.subcategorias.some(
      (sub) =>
        sub.genero !== categoria.genero ||
        sub.idadeMinima !== categoria.idadeMinima ||
        sub.idadeMaxima !== categoria.idadeMaxima ||
        sub.dataReferenciaIdade !== categoria.dataReferenciaIdade ||
        sub.limiteParticipantes !== categoria.limiteParticipantes ||
        sub.requisitos !== categoria.requisitos
    );
    setDefinirPoliticasIndividualmente(politicasIndividuais);
    setModalOpen(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentCategoria(null);
  };

  // Adicionar nova subcategoria
  const handleAddSubcategoria = () => {
    setSubcategorias([
      ...subcategorias,
      {
        id: uuidv4(),
        nome: '',
        genero: definirPoliticasIndividualmente ? 'Unissex' : genero,
        idadeMinima: definirPoliticasIndividualmente ? 0 : idadeMinima,
        idadeMaxima: definirPoliticasIndividualmente ? 0 : idadeMaxima,
        dataReferenciaIdade: definirPoliticasIndividualmente ? 'Dia da Prova' : dataReferenciaIdade,
        limiteParticipantes: definirPoliticasIndividualmente ? 0 : limiteParticipantes,
        requisitos: '',
      },
    ]);
  };

  // Remover subcategoria
  const handleDeleteSubcategoria = (id: string) => {
    setSubcategorias(subcategorias.filter((sub) => sub.id !== id));
  };

  // Atualizar nome da subcategoria
  const handleSubcategoriaChange = (id: string, nome: string) => {
    setSubcategorias(
      subcategorias.map((sub) => (sub.id === id ? { ...sub, nome } : sub))
    );
  };

  // Atualizar políticas da subcategoria
  const handleSubcategoriaPoliciaChange = (
    id: string,
    field: keyof Subcategoria,
    value: string | number
  ) => {
    setSubcategorias(
      subcategorias.map((sub) =>
        sub.id === id ? { ...sub, [field]: value } : sub
      )
    );
  };

  // Salvar categoria (adicionar ou editar)
  const handleSaveCategoria = async () => {
    if (!nome.trim() || !ingressoId) {
      handleSnackbarOpen('Nome da categoria e ingresso são obrigatórios.', 'error');
      return;
    }

    if (idadeMinima < 0 || idadeMaxima < 0 || idadeMinima > idadeMaxima) {
      handleSnackbarOpen('Por favor, insira limites de idade válidos.', 'error');
      return;
    }

    if (limiteParticipantes < 0) {
      handleSnackbarOpen('O limite de participantes não pode ser negativo.', 'error');
      return;
    }

    // Se definir politicas individualmente, validar cada subcategoria
    if (definirPoliticasIndividualmente) {
      for (const sub of subcategorias) {
        if (
          sub.idadeMinima < 0 ||
          sub.idadeMaxima < 0 ||
          sub.idadeMinima > sub.idadeMaxima
        ) {
          handleSnackbarOpen(
            `Por favor, insira limites de idade válidos para a subcategoria "${sub.nome}".`,
            'error'
          );
          return;
        }

        if (sub.limiteParticipantes < 0) {
          handleSnackbarOpen(
            `O limite de participantes não pode ser negativo para a subcategoria "${sub.nome}".`,
            'error'
          );
          return;
        }
      }
    }

    const novaCategoria: Categoria = {
      id: isEditMode && currentCategoria ? currentCategoria.id : uuidv4(),
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      ingressoId,
      genero,
      idadeMinima,
      idadeMaxima,
      dataReferenciaIdade,
      limiteParticipantes,
      requisitos: requisitos.trim() || undefined,
      subcategorias: subcategorias.map((sub) => ({
        ...sub,
        nome: sub.nome.trim(),
        requisitos: sub.requisitos?.trim() || undefined,
      })),
    };

    try {
      if (isEditMode && currentCategoria) {
        // Chamada para editar categoria no backend
        await api.put(`/categories/${currentCategoria.id}`, novaCategoria);
        setCategories(
          categories.map((cat) =>
            cat.id === currentCategoria.id ? novaCategoria : cat
          )
        );
        handleSnackbarOpen('Categoria atualizada com sucesso!', 'success');
      } else {
        // Chamada para criar nova categoria no backend
        const response = await api.post<Categoria>('/categories', novaCategoria); // Substitua pela rota correta
        setCategories([...categories, response.data]);
        handleSnackbarOpen('Categoria criada com sucesso!', 'success');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      handleSnackbarOpen('Ocorreu um erro ao salvar a categoria.', 'error');
    }
  };

  // Remover categoria
  const handleDeleteCategoria = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover esta categoria?')) return;

    try {
      // Chamada para remover categoria no backend
      await api.delete(`/categories/${id}`); // Substitua pela rota correta
      setCategories(categories.filter((cat) => cat.id !== id));
      handleSnackbarOpen('Categoria removida com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
      handleSnackbarOpen('Ocorreu um erro ao remover a categoria.', 'error');
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" sx={{ mb: 4 }}>
        Gerenciamento de Categorias
      </Typography>

      {/* Botão para adicionar categoria quando existem categorias */}
      {categories.length > 0 && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={{
            fontWeight: 'bold',
            borderRadius: '8px',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 3,
          }}
        >
          Adicionar Categoria
        </Button>
      )}

      {/* Estado vazio: Nenhuma categoria criada */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            textAlign: 'center',
          }}
        >
          <ConfirmationNumberIcon fontSize="large" sx={{ mb: 2, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Nenhuma categoria criada ainda.
          </Typography>
          <Button
            onClick={handleOpenModal}
            variant="contained"
            sx={{
              fontWeight: 'bold',
              borderRadius: '8px',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            Adicionar Categoria
          </Button>
        </Box>
      ) : (
        /* Lista de Categorias */
        <Grid container spacing={3}>
          {categories.map((categoria) => {
            const ingresso = ingressos.find((ing) => ing.id === categoria.ingressoId);
            return (
              <Grid item xs={12} sm={6} md={4} key={categoria.id}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ConfirmationNumberIcon />
                        {categoria.nome}
                      </Typography>
                      <Box>
                        <Tooltip title="Editar Categoria">
                          <IconButton
                            color="primary"
                            onClick={() => handleEditCategoria(categoria)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remover Categoria">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteCategoria(categoria.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    {categoria.descricao && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {categoria.descricao}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Ingresso Vinculado:</strong> {ingresso ? ingresso.nome : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Gênero:</strong> {categoria.genero}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Idade:</strong> {categoria.idadeMinima} - {categoria.idadeMaxima} anos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Referência de Idade:</strong> {categoria.dataReferenciaIdade}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Limite de Participantes:</strong> {categoria.limiteParticipantes}
                    </Typography>
                    {categoria.requisitos && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        <strong>Requisitos:</strong> {categoria.requisitos}
                      </Typography>
                    )}

                    {/* Seção de Subcategorias */}
                    {categoria.subcategorias.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2">Subcategorias:</Typography>
                        {categoria.subcategorias.map((sub) => (
                          <Accordion key={sub.id} sx={{ mb: 1 }}>
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              aria-controls={`panel-content-${sub.id}`}
                              id={`panel-header-${sub.id}`}
                            >
                              <Typography>{sub.nome}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Gênero:</strong> {sub.genero}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Idade:</strong> {sub.idadeMinima} - {sub.idadeMaxima} anos
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Referência de Idade:</strong> {sub.dataReferenciaIdade}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Limite de Participantes:</strong> {sub.limiteParticipantes}
                              </Typography>
                              {sub.requisitos && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Requisitos:</strong> {sub.requisitos}
                                </Typography>
                              )}
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Modal para Adicionar/Editar Categoria */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
        scroll="paper" // Torna o modal scrollável
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AddIcon />
          {isEditMode ? 'Editar Categoria' : 'Adicionar Categoria'}
        </DialogTitle>
<DialogContent dividers>
  {/* Formulário sem Stepper */}
  <Box component="form" sx={{ mt: 2 }}>
    <Grid container spacing={3}> {/* Aumentei o spacing de 2 para 3 */}
      {/* Informações Básicas da Categoria */}
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Nome da Categoria"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControl fullWidth required>
          <InputLabel id="ingresso-select-label">Vincular a Ingresso</InputLabel>
          <Select
            labelId="ingresso-select-label"
            value={ingressoId}
            label="Vincular a Ingresso"
            onChange={(e) => setIngressoId(e.target.value)}
          >
            <MenuItem value="">
              <em>Selecione um ingresso</em>
            </MenuItem>
            {ingressos.map((ing) => (
              <MenuItem key={ing.id} value={ing.id}>
                {ing.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* Descrição da Categoria */}
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Descrição (Opcional)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          multiline
          rows={3}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      {/* Opção para Definir Políticas Globalmente ou Individualmente */}
      <Grid item xs={12}>
        <FormControl component="fieldset">
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Definir Políticas
          </Typography>
          <RadioGroup
            row
            value={definirPoliticasIndividualmente ? 'individual' : 'global'}
            onChange={(e) =>
              setDefinirPoliticasIndividualmente(e.target.value === 'individual')
            }
          >
            <FormControlLabel value="global" control={<Radio />} label="Na Categoria" />
            <FormControlLabel value="individual" control={<Radio />} label="Em Cada Subcategoria" />
          </RadioGroup>
        </FormControl>
      </Grid>

      {/* Seção de Políticas da Categoria */}
      {!definirPoliticasIndividualmente && (
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Definir Políticas da Categoria
          </Typography>

          {/* Categoria de Gênero */}
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Categoria de Gênero
            </Typography>
            <RadioGroup
              row
              value={genero}
              onChange={(e) => setGenero(e.target.value as 'Masculina' | 'Feminina' | 'Unissex')}
            >
              <FormControlLabel value="Masculina" control={<Radio />} label="Masculina" />
              <FormControlLabel value="Feminina" control={<Radio />} label="Feminina" />
              <FormControlLabel value="Unissex" control={<Radio />} label="Unissex" />
            </RadioGroup>
          </FormControl>

          {/* Limite de Idade */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Idade Mínima"
                type="number"
                value={idadeMinima}
                onChange={(e) => setIdadeMinima(parseInt(e.target.value, 10))}
                inputProps={{ min: 0 }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Idade Máxima"
                type="number"
                value={idadeMaxima}
                onChange={(e) => setIdadeMaxima(parseInt(e.target.value, 10))}
                inputProps={{ min: idadeMinima }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Data de Referência para Idade */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="data-referencia-label">Data de Referência para Idade</InputLabel>
            <Select
              labelId="data-referencia-label"
              value={dataReferenciaIdade}
              label="Data de Referência para Idade"
              onChange={(e) => setDataReferenciaIdade(e.target.value as 'Dia da Prova' | '31 de Dezembro')}
            >
              <MenuItem value="Dia da Prova">Dia da Prova</MenuItem>
              <MenuItem value="31 de Dezembro">31 de Dezembro do Ano Atual</MenuItem>
            </Select>
          </FormControl>

          {/* Limite de Participantes */}
          <TextField
            fullWidth
            label="Limite de Participantes"
            type="number"
            value={limiteParticipantes}
            onChange={(e) => setLimiteParticipantes(parseInt(e.target.value, 10))}
            inputProps={{ min: 0 }}
            sx={{ mb: 3 }}
            InputLabelProps={{ shrink: true }}
          />

          {/* Requisitos Específicos */}
          <TextField
            fullWidth
            label="Requisitos Específicos (Opcional)"
            value={requisitos}
            onChange={(e) => setRequisitos(e.target.value)}
            multiline
            rows={3}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      )}

      {/* Seção de Subcategorias */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Subcategorias
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddSubcategoria}
          >
            Adicionar Subcategoria
          </Button>
        </Box>
        {subcategorias.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Nenhuma subcategoria adicionada.
          </Typography>
        )}
        {subcategorias.map((sub, index) => (
          <Box key={sub.id} sx={{ border: '1px solid #ddd', borderRadius: '8px', p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">Subcategoria {index + 1}</Typography>
              <IconButton
                color="error"
                onClick={() => handleDeleteSubcategoria(sub.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome da Subcategoria"
                  value={sub.nome}
                  onChange={(e) => handleSubcategoriaChange(sub.id, e.target.value)}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Se políticas são individuais, exibir campos de políticas para a subcategoria */}
              {definirPoliticasIndividualmente && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControl component="fieldset">
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Gênero
                      </Typography>
                      <RadioGroup
                        row
                        value={sub.genero}
                        onChange={(e) =>
                          handleSubcategoriaPoliciaChange(
                            sub.id,
                            'genero',
                            e.target.value as 'Masculina' | 'Feminina' | 'Unissex'
                          )
                        }
                      >
                        <FormControlLabel value="Masculina" control={<Radio />} label="Masculina" />
                        <FormControlLabel value="Feminina" control={<Radio />} label="Feminina" />
                        <FormControlLabel value="Unissex" control={<Radio />} label="Unissex" />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Idade Mínima"
                      type="number"
                      value={sub.idadeMinima}
                      onChange={(e) => handleSubcategoriaPoliciaChange(sub.id, 'idadeMinima', parseInt(e.target.value, 10))}
                      inputProps={{ min: 0 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Idade Máxima"
                      type="number"
                      value={sub.idadeMaxima}
                      onChange={(e) => handleSubcategoriaPoliciaChange(sub.id, 'idadeMaxima', parseInt(e.target.value, 10))}
                      inputProps={{ min: sub.idadeMinima }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id={`data-referencia-label-${sub.id}`}>Data de Referência para Idade</InputLabel>
                      <Select
                        labelId={`data-referencia-label-${sub.id}`}
                        value={sub.dataReferenciaIdade}
                        label="Data de Referência para Idade"
                        onChange={(e) =>
                          handleSubcategoriaPoliciaChange(
                            sub.id,
                            'dataReferenciaIdade',
                            e.target.value as 'Dia da Prova' | '31 de Dezembro'
                          )
                        }
                      >
                        <MenuItem value="Dia da Prova">Dia da Prova</MenuItem>
                        <MenuItem value="31 de Dezembro">31 de Dezembro do Ano Atual</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Limite de Participantes"
                      type="number"
                      value={sub.limiteParticipantes}
                      onChange={(e) => handleSubcategoriaPoliciaChange(sub.id, 'limiteParticipantes', parseInt(e.target.value, 10))}
                      inputProps={{ min: 0 }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Requisitos Específicos (Opcional)"
                      value={sub.requisitos}
                      onChange={(e) => handleSubcategoriaPoliciaChange(sub.id, 'requisitos', e.target.value)}
                      multiline
                      rows={2}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        ))}
      </Grid>
    </Grid>
  </Box>
</DialogContent>

          <DialogActions>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button onClick={handleSaveCategoria} variant="contained" color="primary">
              {isEditMode ? 'Salvar Alterações' : 'Adicionar Categoria'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para Feedback ao Usuário */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    );

};

export default Categories;
