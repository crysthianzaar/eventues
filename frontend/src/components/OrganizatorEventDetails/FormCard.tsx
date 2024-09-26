import React, { useState } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save'; // Importação do SaveIcon
import VisibilityIcon from '@mui/icons-material/Visibility'; // Importação do VisibilityIcon
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'; // Ícone de arrastar
import { styled } from '@mui/system';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';

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

// Função para reordenar a lista após o drag
const reorder = (list: FormField[], startIndex: number, endIndex: number): FormField[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// Container do Formulário
const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

// Cabeçalho das Seções
const SectionHeader = styled(Typography)(({ theme }) => ({
  color: colors.primary,
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
  },
}));

// Container da Tabela
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  backgroundColor: colors.white,
}));

// Célula da Tabela
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
  color: colors.grayDark,
  fontWeight: '500',
}));

// Cabeçalho da Tabela
const StyledTableHeadCell = styled(StyledTableCell)(() => ({
  backgroundColor: colors.tableHeaderBg,
  fontWeight: 'bold',
  fontSize: '1rem',
  color: colors.primary,
}));

// Botão Adicionar (Azul Claro)
const AddButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.lightBlue,
  color: '#fff',
  '&:hover': {
    backgroundColor: '#4299e1', // Azul mais escuro
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

// Botão Salvar (Verde) com ícone
const SaveButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.secondary,
  color: '#fff',
  '&:hover': {
    backgroundColor: '#56c078', // Verde mais escuro
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

// Botão Visualizar Formulário (Azul) com ícone
const ViewButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.primary,
  color: '#fff',
  '&:hover': {
    backgroundColor: '#4c5db8', // Azul mais escuro
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  },
}));

interface FormField {
  id: string; // Adicionado um ID único para cada campo
  label: string;
  include: boolean;
  required: boolean;
  type: string; // Tipo de resposta
}

const initialFields: FormField[] = [
  { id: '1', label: 'Nome Completo', include: true, required: true, type: 'Texto' },
  { id: '2', label: 'Data de Nascimento', include: true, required: true, type: 'Data' },
  { id: '3', label: 'Gênero', include: true, required: true, type: 'Seleção' }, // Masculino, Feminino, Outro
  { id: '4', label: 'Cidade', include: true, required: false, type: 'Seleção' },
  { id: '5', label: 'Estado', include: true, required: false, type: 'Seleção' },
  { id: '6', label: 'Endereço', include: true, required: false, type: 'Texto' },
  { id: '7', label: 'Email', include: true, required: true, type: 'Texto' },
  { id: '8', label: 'Telefone', include: true, required: true, type: 'Número' },
  { id: '9', label: 'Contato de Emergência', include: true, required: true, type: 'Texto' },
  { id: '10', label: 'Tamanho da Camiseta', include: true, required: false, type: 'Seleção' },
  { id: '11', label: 'Informações Médicas', include: false, required: false, type: 'Texto' },
  { id: '12', label: 'Equipe', include: false, required: false, type: 'Texto' },
  { id: '13', label: 'Aceitação de Termos e Condições', include: true, required: true, type: 'Verdadeiro/Falso' },
];

const FormCard: React.FC = () => {
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [newQuestionVisible, setNewQuestionVisible] = useState<boolean>(false);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [questionType, setQuestionType] = useState<string>('Texto');
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const handleToggleInclude = (index: number) => {
    const updatedFields = [...fields];
    updatedFields[index].include = !updatedFields[index].include;
    setFields(updatedFields);
  };

  const handleToggleRequired = (index: number) => {
    const updatedFields = [...fields];
    updatedFields[index].required = !updatedFields[index].required;
    setFields(updatedFields);
  };

  const handleAddQuestion = () => {
    if (newQuestion.trim()) { // Verifica se a pergunta não está vazia
      const newField: FormField = {
        id: (fields.length + 1).toString(),
        label: newQuestion.trim(),
        include: true,
        required: false,
        type: questionType,
      };
      setFields([...fields, newField]);
      setNewQuestion('');
      setQuestionType('Texto');
      setNewQuestionVisible(false);
    }
  };

  const handleDelete = (index: number) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Se não houver destino, não faz nada
    if (!destination) {
      return;
    }

    // Se a posição não mudou, não faz nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const reorderedFields = reorder(
      fields,
      source.index,
      destination.index
    );

    setFields(reorderedFields);
  };

  return (
    <FormContainer>
      <SectionHeader variant="h6">Configuração dos Campos</SectionHeader>

      {/* Lista de campos configuráveis como tabela com Drag and Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <StyledTableContainer sx={{ marginTop: 2, borderRadius: 1, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', backgroundColor: colors.white }}>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Ordenar</StyledTableHeadCell> {/* Coluna para arrastar */}
                <StyledTableHeadCell>Campo</StyledTableHeadCell>
                <StyledTableHeadCell>Exibir</StyledTableHeadCell>
                <StyledTableHeadCell>Obrigatório</StyledTableHeadCell>
                <StyledTableHeadCell>Excluir</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <Droppable droppableId="fields">
              {(provided) => (
                <TableBody
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided, snapshot) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{
                            backgroundColor: index % 2 === 0 ? colors.rowEvenBg : colors.rowOddBg, // Efeito de linhas alternadas
                          }}
                        >
                          <StyledTableCell {...provided.dragHandleProps}>
                            <DragIndicatorIcon style={{ cursor: 'grab' }} />
                          </StyledTableCell>
                          <StyledTableCell>{field.label}</StyledTableCell>
                          <StyledTableCell>
                            <Switch
                              checked={field.include}
                              onChange={() => handleToggleInclude(index)}
                              size="small"
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: colors.secondary,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: colors.secondary,
                                },
                              }}
                            />
                          </StyledTableCell>
                          <StyledTableCell>
                            <Switch
                              checked={field.required}
                              onChange={() => handleToggleRequired(index)}
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
                            <Button
                              variant="text"
                              color="error"
                              onClick={() => handleDelete(index)}
                            >
                              <DeleteIcon />
                            </Button>
                          </StyledTableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </StyledTableContainer>
      </DragDropContext>

      {/* Adicionar Pergunta Personalizada */}
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
            Adicionar Nova Pergunta
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
                  <MenuItem value="Verdadeiro/Falso">Verdadeiro/Falso</MenuItem>
                  {/* Adicione outros tipos conforme necessário */}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
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
            <SaveButton variant="contained" onClick={handleAddQuestion}>
              Adicionar Pergunta
            </SaveButton>
          </Box>
        </Box>
      )}

      {/* Botões Inferiores */}
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
        <SaveButton variant="contained" startIcon={<SaveIcon />}>
          Salvar Alterações
        </SaveButton>
        <ViewButton variant="contained" startIcon={<VisibilityIcon />} onClick={() => setModalOpen(true)}>
          Visualizar Formulário
        </ViewButton>
        {!newQuestionVisible && (
          <AddButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewQuestionVisible(true)}
          >
            Adicionar Nova Pergunta
          </AddButton>
        )}
      </Box>

      {/* Modal de visualização (read-only) */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            backgroundColor: '#fff',
            padding: '2rem',
            margin: '2rem auto',
            maxWidth: '600px',
            maxHeight: '80vh',          // Limita a altura máxima
            overflowY: 'auto',          // Habilita o scroll vertical
            borderRadius: '8px',
            boxShadow: 24,               // Adiciona sombra para destaque
          }}
        >
          <SectionHeader variant="h6">Visualização do Formulário</SectionHeader>
          
          {/* Disclaimer */}
          <Box sx={{ marginBottom: '1rem' }}>
            <Typography variant="body2" color="textSecondary">
              Veja abaixo como os inscritos visualizarão o formulário de inscrição com os campos que você configurou.
            </Typography>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {fields.map(
                  (field, index) =>
                    field.include && (
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
                                readOnly: true, // Torna o campo read-only
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
                            <Select
                              fullWidth
                              label={field.label}
                              value=""
                              disabled
                              displayEmpty
                              variant="outlined"
                              sx={{
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px',
                              }}
                            >
                              <MenuItem value="">
                                <em>Selecione</em>
                              </MenuItem>
                              {/* Opcional: Preencher com opções reais */}
                            </Select>
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
                    )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Modal>
    </FormContainer>
  );
};

export default FormCard;
