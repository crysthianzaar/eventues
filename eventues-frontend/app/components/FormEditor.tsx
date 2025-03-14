'use client';
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Checkbox, 
  CircularProgress,
  Divider,
  Chip,
  Grid
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  DragIndicator as DragIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FormField, getEventForm, updateEventForm, createEventForm } from '../apis/api';
import { toast } from 'react-hot-toast';

interface FormEditorProps {
  eventId: string;
}

export default function FormEditor({ eventId }: FormEditorProps) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  
  // Form field state
  const [fieldId, setFieldId] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldOptions, setFieldOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const formFields = await getEventForm(eventId);
        
        // Sort fields by order
        const sortedFields = [...formFields].sort((a, b) => a.order - b.order);
        setFields(sortedFields);
      } catch (error) {
        console.error('Error fetching form:', error);
        toast.error('Erro ao carregar o formulário');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [eventId]);

  const handleOpenDialog = (field: FormField | null = null, index: number | null = null) => {
    if (field) {
      setEditingField(field);
      setEditIndex(index);
      setFieldId(field.id);
      setFieldLabel(field.label);
      setFieldType(field.type);
      setFieldRequired(field.required);
      setFieldOptions(field.options || []);
    } else {
      setEditingField(null);
      setEditIndex(null);
      setFieldId('');
      setFieldLabel('');
      setFieldType('text');
      setFieldRequired(false);
      setFieldOptions([]);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingField(null);
    setEditIndex(null);
  };

  const handleAddOption = () => {
    if (newOption.trim() && !fieldOptions.includes(newOption.trim())) {
      setFieldOptions([...fieldOptions, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...fieldOptions];
    newOptions.splice(index, 1);
    setFieldOptions(newOptions);
  };

  const handleSaveField = () => {
    if (!fieldLabel.trim()) {
      toast.error('O rótulo do campo é obrigatório');
      return;
    }

    if (fieldType === 'select' && fieldOptions.length === 0) {
      toast.error('Adicione pelo menos uma opção para o campo de seleção');
      return;
    }

    const newField: FormField = {
      id: fieldId || fieldLabel.toLowerCase().replace(/\s+/g, ''),
      label: fieldLabel,
      type: fieldType,
      required: fieldRequired,
      options: fieldType === 'select' ? fieldOptions : undefined,
      order: editIndex !== null ? fields[editIndex].order : fields.length
    };

    let updatedFields;
    if (editIndex !== null) {
      updatedFields = [...fields];
      updatedFields[editIndex] = newField;
    } else {
      updatedFields = [...fields, newField];
    }

    setFields(updatedFields);
    handleCloseDialog();
  };

  const handleDeleteField = (index: number) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    
    // Update order for remaining fields
    const reorderedFields = updatedFields.map((field, idx) => ({
      ...field,
      order: idx
    }));
    
    setFields(reorderedFields);
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === fields.length - 1)) {
      return;
    }

    const updatedFields = [...fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap fields
    [updatedFields[index], updatedFields[newIndex]] = [updatedFields[newIndex], updatedFields[index]];
    
    // Update order
    const reorderedFields = updatedFields.map((field, idx) => ({
      ...field,
      order: idx
    }));
    
    setFields(reorderedFields);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order for all fields
    const reorderedFields = items.map((field, idx) => ({
      ...field,
      order: idx
    }));
    
    setFields(reorderedFields);
  };

  const handleSaveForm = async () => {
    try {
      setSaving(true);
      await updateEventForm(eventId, fields);
      toast.success('Formulário salvo com sucesso');
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Erro ao salvar o formulário');
    } finally {
      setSaving(false);
    }
  };

  const getFieldTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Texto';
      case 'date': return 'Data';
      case 'select': return 'Seleção';
      case 'checkbox': return 'Caixa de Seleção';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Formulário de Inscrição
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: '#5A67D8',
              '&:hover': {
                backgroundColor: '#434190',
              },
            }}
          >
            Adicionar Campo
          </Button>
        </Box>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fields">
            {(provided) => (
              <List {...provided.droppableProps} ref={provided.innerRef}>
                {fields.length === 0 ? (
                  <Typography variant="body1" sx={{ textAlign: 'center', p: 2 }}>
                    Nenhum campo adicionado. Clique em "Adicionar Campo" para começar.
                  </Typography>
                ) : (
                  fields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          sx={{ 
                            border: '1px solid #e0e0e0', 
                            borderRadius: '4px', 
                            mb: 1,
                            backgroundColor: '#f9f9f9'
                          }}
                        >
                          <Box {...provided.dragHandleProps} sx={{ mr: 1 }}>
                            <DragIcon />
                          </Box>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1">{field.label}</Typography>
                                {field.required && (
                                  <Chip 
                                    label="Obrigatório" 
                                    size="small" 
                                    color="primary" 
                                    sx={{ ml: 1 }} 
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="textSecondary">
                                  Tipo: {getFieldTypeLabel(field.type)}
                                </Typography>
                                {field.options && field.options.length > 0 && (
                                  <Typography variant="body2" color="textSecondary">
                                    Opções: {field.options.join(', ')}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <Box>
                            <IconButton 
                              onClick={() => handleMoveField(index, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUpIcon />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleMoveField(index, 'down')}
                              disabled={index === fields.length - 1}
                            >
                              <ArrowDownIcon />
                            </IconButton>
                            <IconButton onClick={() => handleOpenDialog(field, index)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteField(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </ListItem>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </List>
            )}
          </Droppable>
        </DragDropContext>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSaveForm}
            disabled={saving}
            sx={{
              minWidth: 200,
              backgroundColor: '#5A67D8',
              '&:hover': {
                backgroundColor: '#434190',
              },
            }}
          >
            {saving ? <CircularProgress size={24} /> : 'Salvar Formulário'}
          </Button>
        </Box>
      </CardContent>

      {/* Dialog for adding/editing fields */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingField ? 'Editar Campo' : 'Adicionar Campo'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Rótulo"
                value={fieldLabel}
                onChange={(e) => setFieldLabel(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  label="Tipo"
                >
                  <MenuItem value="text">Texto</MenuItem>
                  <MenuItem value="date">Data</MenuItem>
                  <MenuItem value="select">Seleção</MenuItem>
                  <MenuItem value="checkbox">Caixa de Seleção</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={fieldRequired}
                    onChange={(e) => setFieldRequired(e.target.checked)}
                  />
                }
                label="Campo Obrigatório"
              />
            </Grid>

            {fieldType === 'select' && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Opções
                </Typography>
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <TextField
                    label="Nova Opção"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleAddOption}
                    sx={{ ml: 1 }}
                  >
                    Adicionar
                  </Button>
                </Box>
                <List dense>
                  {fieldOptions.map((option, index) => (
                    <ListItem 
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleRemoveOption(index)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={option} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveField} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
