// components/OrganizatorEventDetails/FormCard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  TextField,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { styled } from '@mui/system';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableRow from './SortableRow'; // Importando o componente SortableRow
import { v4 as uuidv4 } from 'uuid';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

// Define your color palette
const colors = {
  primary: "#5A67D8",      // Azul
  secondary: "#68D391",    // Verde
  lightBlue: "#63B3ED",    // Azul Claro
  grayLight: "#EDF2F7",
  grayDark: "#2D3748",
  white: "#FFFFFF",
  tableHeaderBg: "#E2E8F0",
  rowOddBg: "#F9FAFB",     // Cor de fundo para linhas ímpares
  rowEvenBg: "#FFFFFF",    // Cor de fundo para linhas pares
};

// List of 'Seleção' type fields that should not allow option editing
const fixedSelectionFields = ['Cidade', 'Estado'];

// Styled components
const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  color: colors.primary,
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
  },
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  backgroundColor: colors.white,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  color: colors.grayDark,
  fontWeight: 500,
}));

const StyledTableHeadCell = styled(StyledTableCell)(() => ({
  backgroundColor: colors.tableHeaderBg,
  fontWeight: 'bold',
  fontSize: '1rem',
  color: colors.primary,
}));

const AddButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.lightBlue,
  color: '#fff',
  '&:hover': {
    backgroundColor: '#4299e1',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const SaveButtonStyled = styled(Button)(({ theme }) => ({
  backgroundColor: colors.secondary,
  color: '#fff',
  '&:hover': {
    backgroundColor: '#56c078',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

const ViewButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.primary,
  color: '#fff',
  '&:hover': {
    backgroundColor: '#4c5db8',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

interface FormCardProps {
  eventId: string;
  onNotify: (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => void;
  onUpdate: () => void;
}

interface FormField {
  id: string;
  label: string;
  required: boolean;
  type: string;
  options?: string[];
  order: number;
}

const FormCard: React.FC<FormCardProps> = ({ eventId, onNotify, onUpdate }) => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [newQuestionVisible, setNewQuestionVisible] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [questionType, setQuestionType] = useState<string>('Texto');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [optionsDialogOpen, setOptionsDialogOpen] = useState<boolean>(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [currentFieldId, setCurrentFieldId] = useState<string | null>(null);

  // Sensores para o DnD Kit
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Função para buscar os campos do formulário do backend
  const fetchFormFields = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer_detail/${eventId}/get_form`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.ok) {
        const data: FormField[] = await response.json();
        if (data.length === 0) {
          // Se não houver campos, carregar os campos padrão
          loadDefaultFields();
        } else {
          // Ordenar os campos recebidos
          const sortedData = data.sort((a, b) => a.order - b.order);
          setFields(sortedData);
        }
      } else {
        console.error('Erro ao buscar formulário:', await response.text());
        // Opcionalmente, carregar campos padrão em caso de erro
        loadDefaultFields();
      }
    } catch (error) {
      console.error('Erro ao buscar formulário:', error);
      // Opcionalmente, carregar campos padrão em caso de erro
      loadDefaultFields();
    }
  };

  // Função para carregar campos padrão
  const loadDefaultFields = () => {
    const defaultFields: FormField[] = [
      { id: uuidv4(), label: 'Nome Completo', required: true, type: 'Texto', order: 1 },
      { id: uuidv4(), label: 'Data de Nascimento', required: true, type: 'Data', order: 2 },
      { id: uuidv4(), label: 'Gênero', required: true, type: 'Seleção', options: ['Masculino', 'Feminino'], order: 3 },
      { id: uuidv4(), label: 'Cidade', required: false, type: 'Seleção', options: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte'], order: 4 },
      { id: uuidv4(), label: 'Estado', required: false, type: 'Seleção', options: ['SP', 'RJ', 'MG'], order: 5 },
      { id: uuidv4(), label: 'Endereço', required: false, type: 'Texto', order: 6 },
      { id: uuidv4(), label: 'Email', required: true, type: 'Texto', order: 7 },
      { id: uuidv4(), label: 'Telefone', required: true, type: 'Número', order: 8 },
      { id: uuidv4(), label: 'Contato de Emergência', required: true, type: 'Texto', order: 9 },
      { id: uuidv4(), label: 'Tamanho da Camiseta', required: false, type: 'Seleção', options: ['P', 'M', 'G', 'GG'], order: 10 },
      { id: uuidv4(), label: 'Informações Médicas', required: false, type: 'Texto', order: 11 },
      { id: uuidv4(), label: 'Equipe', required: false, type: 'Texto', order: 12 },
      { id: uuidv4(), label: 'Aceitação de Termos e Condições', required: true, type: 'Verdadeiro/Falso', order: 13 },
    ];
    setFields(defaultFields);
  };

  // Buscar os campos do formulário quando o componente monta
  useEffect(() => {
    fetchFormFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  // Função para salvar os campos do formulário no backend
  const saveFormFields = async () => {
    try {
      const payload = {
        form_fields: fields.map((field) => ({
          id: field.id,
          label: field.label,
          type: field.type,
          required: field.required,
          order: field.order,
          options: field.type === 'Seleção' ? field.options || [] : [],
        })),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/organizer_detail/${eventId}/create_form`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data: FormField[] = await response.json();
        const sortedData = data.sort((a, b) => a.order - b.order);
        setFields(sortedData);
        onNotify('Alterações salvas com sucesso!', 'success');
        onUpdate();
      } else {
        const errorData = await response.json();
        console.error('Erro ao salvar formulário:', errorData);
        onNotify('Erro ao salvar alterações.', 'error');
        onUpdate();
      }
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      onNotify('Erro ao salvar alterações.', 'error');
      onUpdate();
    }
  };

  // Função para adicionar uma nova pergunta
  const handleAddQuestion = () => {
    if (newQuestion.trim()) {
      const newField: FormField = {
        id: uuidv4(),
        label: newQuestion.trim(),
        required: false,
        type: questionType,
        options: questionType === 'Seleção' ? [] : undefined,
        order: fields.length + 1,
      };
      const updatedFields = [...fields, newField];
      setFields(updatedFields);
    }
    setNewQuestion('');
    setQuestionType('Texto');
    setNewQuestionVisible(false);
  };

  // Função para deletar uma pergunta
  const handleDelete = (id: string) => {
    const updatedFields = fields
      .filter((field) => field.id !== id)
      .map((field, index) => ({
        ...field,
        order: index + 1,
      }));
    setFields(updatedFields);
  };

  // Funções para gerenciar opções de campos do tipo 'Seleção'
  const handleOpenOptionsDialog = (fieldId: string, currentOptions: string[]) => {
    setCurrentFieldId(fieldId);
    setCurrentOptions(currentOptions);
    setOptionsDialogOpen(true);
  };

  const handleCloseOptionsDialog = () => {
    setOptionsDialogOpen(false);
    setCurrentFieldId(null);
    setCurrentOptions([]);
  };

  const handleSaveOptions = () => {
    if (currentFieldId) {
      const updatedFields = fields.map((field) => {
        if (field.id === currentFieldId) {
          return { ...field, options: currentOptions };
        }
        return field;
      });
      setFields(updatedFields);
    }
    handleCloseOptionsDialog();
  };

  const handleAddOption = () => {
    setCurrentOptions([...currentOptions, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...currentOptions];
    updatedOptions[index] = value;
    setCurrentOptions(updatedOptions);
  };

  const handleDeleteOption = (index: number) => {
    const updatedOptions = [...currentOptions];
    updatedOptions.splice(index, 1);
    setCurrentOptions(updatedOptions);
  };

  // Função chamada quando o drag termina
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);

      const newFields = arrayMove(fields, oldIndex, newIndex).map((field, index) => ({
        ...field,
        order: index + 1,
      }));

      setFields(newFields);
    }
  };

  return (
    <FormContainer>
      <SectionHeader variant="h6">Configuração dos Campos</SectionHeader>

      {/* Lista de campos configuráveis como uma tabela com Drag and Drop */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableHeadCell>Ordenar</StyledTableHeadCell>
                  <StyledTableHeadCell>Campo</StyledTableHeadCell>
                  <StyledTableHeadCell>Tipo</StyledTableHeadCell>
                  <StyledTableHeadCell>Obrigatório</StyledTableHeadCell>
                  <StyledTableHeadCell>Excluir</StyledTableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field) => (
                  <SortableRow key={field.id} id={field.id}>
                    <StyledTableCell>
                      <DragIndicatorIcon style={{ cursor: 'grab' }} />
                    </StyledTableCell>
                    <StyledTableCell>
                      {field.type === 'Seleção' ? (
                        <Box display="flex" alignItems="center">
                          {field.label}
                          {!fixedSelectionFields.includes(field.label) && (
                            <Tooltip title="Editar Opções">
                              <Button
                                size="small"
                                onClick={() =>
                                  handleOpenOptionsDialog(
                                    field.id,
                                    field.options || []
                                  )
                                }
                                sx={{ marginLeft: 1 }}
                              >
                                Editar Opções
                              </Button>
                            </Tooltip>
                          )}
                          {fixedSelectionFields.includes(field.label) && (
                            <Tooltip title="Opções fixas e não editáveis">
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                sx={{ marginLeft: 1 }}
                              >
                                (Opções fixas)
                              </Typography>
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        field.label
                      )}
                    </StyledTableCell>
                    <StyledTableCell>{field.type}</StyledTableCell>
                    <StyledTableCell>
                      <Switch
                        checked={field.required}
                        onChange={() => {
                          const updatedFields = fields.map((f) =>
                            f.id === field.id
                              ? { ...f, required: !f.required }
                              : f
                          );
                          setFields(updatedFields);
                        }}
                        size="small"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: colors.primary,
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: colors.primary,
                          },
                        }}
                      />
                    </StyledTableCell>
                    <StyledTableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(field.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </StyledTableCell>
                  </SortableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </SortableContext>
      </DndContext>

      {/* Adicionar Nova Pergunta */}
      {newQuestionVisible && (
        <Box
          sx={{
            marginTop: '2rem',
            backgroundColor: '#fff',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Adicionar Novo Campo
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Pergunta"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>Tipo de Resposta</InputLabel>
                <Select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as string)}
                  label="Tipo de Resposta"
                >
                  <MenuItem value="Texto">Texto</MenuItem>
                  <MenuItem value="Número">Número</MenuItem>
                  <MenuItem value="Data">Data</MenuItem>
                  <MenuItem value="Seleção">Seleção</MenuItem>
                  <MenuItem value="Verdadeiro/Falso">Verdadeiro/Falso</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box
            sx={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}
          >
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setNewQuestion('');
                setQuestionType('Texto');
                setNewQuestionVisible(false);
              }}
              sx={{ marginRight: '1rem' }}
            >
              Cancelar
            </Button>
            <SaveButtonStyled variant="contained" onClick={handleAddQuestion}>
              Adicionar Pergunta
            </SaveButtonStyled>
          </Box>
        </Box>
      )}

      {/* Botões na parte inferior */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          marginTop: '2rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <SaveButtonStyled
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={saveFormFields}
        >
          Salvar Alterações
        </SaveButtonStyled>
        <ViewButton
          variant="contained"
          startIcon={<VisibilityIcon />}
          onClick={() => setModalOpen(true)}
        >
          Visualizar Formulário
        </ViewButton>
        {!newQuestionVisible && (
          <AddButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewQuestionVisible(true)}
          >
            Adicionar Novo Campo
          </AddButton>
        )}
      </Box>

      {/* Modal para Visualização do Formulário */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            backgroundColor: '#fff',
            padding: '2rem',
            margin: '2rem auto',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto',
            borderRadius: '8px',
            boxShadow: 24,
          }}
        >
          <SectionHeader variant="h6">Visualização do Formulário</SectionHeader>

          {/* Disclaimer */}
          <Box sx={{ marginBottom: '1rem' }}>
            <Typography variant="body2" color="textSecondary">
              Veja abaixo como os participantes visualizarão o formulário com os campos que você configurou.
            </Typography>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {fields
                  .sort((a, b) => a.order - b.order)
                  .map((field) => (
                    <TableRow key={field.id}>
                      <TableCell>{field.label}</TableCell>
                      <TableCell>
                        {field.type === 'Texto' && (
                          <TextField
                            fullWidth
                            label={field.label}
                            variant="outlined"
                            margin="normal"
                            required={field.required}
                            InputProps={{
                              readOnly: true,
                            }}
                            sx={{
                              backgroundColor: '#f5f5f5',
                              borderRadius: '4px',
                            }}
                          />
                        )}
                        {field.type === 'Número' && (
                          <TextField
                            fullWidth
                            type="number"
                            label={field.label}
                            variant="outlined"
                            margin="normal"
                            required={field.required}
                            InputProps={{
                              readOnly: true,
                            }}
                            sx={{
                              backgroundColor: '#f5f5f5',
                              borderRadius: '4px',
                            }}
                          />
                        )}
                        {field.type === 'Data' && (
                          <TextField
                            fullWidth
                            type="date"
                            label={field.label}
                            variant="outlined"
                            margin="normal"
                            required={field.required}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            InputProps={{
                              readOnly: true,
                            }}
                            sx={{
                              backgroundColor: '#f5f5f5',
                              borderRadius: '4px',
                            }}
                          />
                        )}
                        {field.type === 'Seleção' && (
                          <FormControl fullWidth variant="outlined" margin="normal">
                            <InputLabel>{field.label}</InputLabel>
                            <Select
                              label={field.label}
                              value=""
                              disabled
                              displayEmpty
                              sx={{
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px',
                              }}
                            >
                              <MenuItem value="">
                                <em>Selecione</em>
                              </MenuItem>
                              {field.options &&
                                field.options.map((option, idx) => (
                                  <MenuItem key={idx} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        )}
                        {field.type === 'Verdadeiro/Falso' && (
                          <Switch
                            checked={false}
                            disabled
                            sx={{
                              '& .MuiSwitch-thumb': {
                                backgroundColor: '#f5f5f5',
                              },
                              '& .MuiSwitch-track': {
                                backgroundColor: '#f5f5f5',
                              },
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>

      {/* Dialog para editar opções de campos do tipo 'Seleção' */}
      <Dialog open={optionsDialogOpen} onClose={handleCloseOptionsDialog}>
        <DialogTitle>Editar Opções</DialogTitle>
        <DialogContent>
          <List>
            {currentOptions.map((option, index) => (
              <ListItem key={index}>
                <ListItemText>
                  <TextField
                    fullWidth
                    label={`Opção ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDeleteOption(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddOption}
          >
            Adicionar Opção
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOptionsDialog} color="error">
            Cancelar
          </Button>
          <Button onClick={handleSaveOptions} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </FormContainer>
  );
};

export default FormCard;
