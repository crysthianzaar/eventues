import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  TableHead,
  Card,
  CardContent,
} from '@mui/material';
import { Add, Edit, Delete, ExpandMore } from '@mui/icons-material';

const colors = {
  primary: '#5A67D8',
  green: '#48BB78',
  grayDark: '#2D3748',
  grayLight: '#F7FAFC',
  white: '#FFFFFF',
};

interface PriceConfig {
  type: 'unique' | 'category' | 'subcategory' | 'batch';
  value?: number;
  batches?: Batch[];
}

interface Batch {
  id: string;
  name: string;
  type: 'temporal' | 'quantity';
  startDate?: string;
  endDate?: string;
  quantity?: number;
  price: number;
  appliesTo: 'global' | 'category' | 'subcategory';
  categoryIds?: string[];
  subcategoryIds?: string[];
}

interface Subcategory {
  id: string;
  name: string;
  description?: string;
  price?: number;
  batches?: Batch[];
}

interface Category {
  id: string;
  name: string;
  description?: string;
  price?: number;
  batches?: Batch[];
  subcategories: Subcategory[];
}

const TicketsCard: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);

  const [openSubcategoryModal, setOpenSubcategoryModal] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number | null>(null);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategoryDescription, setSubcategoryDescription] = useState('');
  const [editingSubcategoryIndex, setEditingSubcategoryIndex] = useState<number | null>(null);

  const [openPriceModal, setOpenPriceModal] = useState(false);
  const [priceConfigType, setPriceConfigType] = useState<'unique' | 'category' | 'subcategory' | 'batch'>('unique');
  const [globalPrice, setGlobalPrice] = useState<number | null>(null);
  const [globalBatches, setGlobalBatches] = useState<Batch[]>([]);

  const [batchApplicationLevel, setBatchApplicationLevel] = useState<'global' | 'category' | 'subcategory'>('global');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [batchConfigs, setBatchConfigs] = useState<Batch[]>([]);
  const [editingBatchIndex, setEditingBatchIndex] = useState<number | null>(null);

  const [openSummaryModal, setOpenSummaryModal] = useState(false);

    // Funções para Categoria
    const handleAddCategory = () => {
      setOpenCategoryModal(true);
    };
  
    const handleEditCategory = (index: number) => {
      const categoryToEdit = categories[index];
      setCategoryName(categoryToEdit.name);
      setCategoryDescription(categoryToEdit.description || '');
      setEditingCategoryIndex(index);
      setOpenCategoryModal(true);
    };
  
    const handleDeleteCategory = (index: number) => {
      const updatedCategories = categories.filter((_, i) => i !== index);
      setCategories(updatedCategories);
    };
  
    const handleCloseCategoryModal = () => {
      setOpenCategoryModal(false);
      setCategoryName('');
      setCategoryDescription('');
      setEditingCategoryIndex(null);
    };
  
    const handleSaveCategory = () => {
      const newCategory: Category = {
        id: `${Date.now()}`,
        name: categoryName,
        description: categoryDescription,
        price: editingCategoryIndex !== null ? categories[editingCategoryIndex].price : undefined,
        batches: editingCategoryIndex !== null ? categories[editingCategoryIndex].batches : [],
        subcategories:
          editingCategoryIndex !== null
            ? categories[editingCategoryIndex].subcategories
            : [],
      };
  
      if (editingCategoryIndex !== null) {
        const updatedCategories = [...categories];
        updatedCategories[editingCategoryIndex] = newCategory;
        setCategories(updatedCategories);
      } else {
        setCategories([...categories, newCategory]);
      }
      handleCloseCategoryModal();
    };
  
    // Funções para Subcategoria
    const handleAddSubcategory = (index: number) => {
      setCurrentCategoryIndex(index);
      setOpenSubcategoryModal(true);
    };
  
    const handleEditSubcategory = (categoryIndex: number, subcategoryIndex: number) => {
      const subcategoryToEdit =
        categories[categoryIndex].subcategories[subcategoryIndex];
      setSubcategoryName(subcategoryToEdit.name);
      setSubcategoryDescription(subcategoryToEdit.description || '');
      setCurrentCategoryIndex(categoryIndex);
      setEditingSubcategoryIndex(subcategoryIndex);
      setOpenSubcategoryModal(true);
    };
  
    const handleDeleteSubcategory = (categoryIndex: number, subcategoryIndex: number) => {
      const updatedCategories = [...categories];
      updatedCategories[categoryIndex].subcategories = updatedCategories[categoryIndex].subcategories.filter((_, i) => i !== subcategoryIndex);
      setCategories(updatedCategories);
    };
  
    const handleCloseSubcategoryModal = () => {
      setOpenSubcategoryModal(false);
      setSubcategoryName('');
      setSubcategoryDescription('');
      setEditingSubcategoryIndex(null);
      setCurrentCategoryIndex(null);
    };
  
    const handleSaveSubcategory = () => {
      if (currentCategoryIndex !== null) {
        const newSubcategory: Subcategory = {
          id: `${Date.now()}`,
          name: subcategoryName,
          description: subcategoryDescription,
          price:
            editingSubcategoryIndex !== null
              ? categories[currentCategoryIndex].subcategories[editingSubcategoryIndex].price
              : undefined,
          batches:
            editingSubcategoryIndex !== null
              ? categories[currentCategoryIndex].subcategories[editingSubcategoryIndex].batches
              : [],
        };
        const updatedCategories = [...categories];
        if (editingSubcategoryIndex !== null) {
          updatedCategories[currentCategoryIndex].subcategories[editingSubcategoryIndex] = newSubcategory;
        } else {
          updatedCategories[currentCategoryIndex].subcategories.push(newSubcategory);
        }
        setCategories(updatedCategories);
        handleCloseSubcategoryModal();
      }
    };
  
    // Funções para Configuração de Valores
    const handleOpenPriceModal = () => {
      setOpenPriceModal(true);
    };
  
    const handleClosePriceModal = () => {
      setOpenPriceModal(false);
      setPriceConfigType('unique');
      setGlobalPrice(null);
      setBatchConfigs([]);
      setEditingBatchIndex(null);
      setBatchApplicationLevel('global');
      setSelectedCategories([]);
      setSelectedSubcategories([]);
    };
  
    const handleSavePriceConfig = () => {
      if (priceConfigType === 'unique') {
        setGlobalPrice(globalPrice);
      } else if (priceConfigType === 'category') {
        // Os preços já estão atualizados nas categorias
      } else if (priceConfigType === 'subcategory') {
        // Os preços já estão atualizados nas subcategorias
      } else if (priceConfigType === 'batch') {
        if (batchApplicationLevel === 'global') {
          setGlobalBatches([...globalBatches, ...batchConfigs]);
        } else if (batchApplicationLevel === 'category') {
          const updatedCategories = categories.map((category) => {
            if (selectedCategories.includes(category.id)) {
              return {
                ...category,
                batches: [...(category.batches || []), ...batchConfigs],
              };
            }
            return category;
          });
          setCategories(updatedCategories);
        } else if (batchApplicationLevel === 'subcategory') {
          const updatedCategories = categories.map((category) => {
            const updatedSubcategories = category.subcategories.map((subcategory) => {
              if (selectedSubcategories.includes(subcategory.id)) {
                return {
                  ...subcategory,
                  batches: [...(subcategory.batches || []), ...batchConfigs],
                };
              }
              return subcategory;
            });
            return {
              ...category,
              subcategories: updatedSubcategories,
            };
          });
          setCategories(updatedCategories);
        }
      }
      handleClosePriceModal();
    };
  
    const handleAddBatch = () => {
      const newBatch: Batch = {
        id: `${Date.now()}`,
        name: '',
        type: 'temporal',
        startDate: '',
        endDate: '',
        price: 0,
        appliesTo: batchApplicationLevel,
        categoryIds: batchApplicationLevel === 'category' ? selectedCategories : undefined,
        subcategoryIds: batchApplicationLevel === 'subcategory' ? selectedSubcategories : undefined,
      };
      setBatchConfigs([...batchConfigs, newBatch]);
      setEditingBatchIndex(batchConfigs.length);
    };
  
    const handleDeleteBatch = (index: number) => {
      const updatedBatches = batchConfigs.filter((_, i) => i !== index);
      setBatchConfigs(updatedBatches);
      setEditingBatchIndex(null);
    };
  
    // Funções de Seleção de Categorias/Subcategorias
    const handleCategorySelection = (event: React.ChangeEvent<HTMLInputElement>, categoryId: string) => {
      const updatedSelectedCategories = event.target.checked
        ? [...selectedCategories, categoryId]
        : selectedCategories.filter((id) => id !== categoryId);
      setSelectedCategories(updatedSelectedCategories);
    };
  
    const handleSubcategorySelection = (event: React.ChangeEvent<HTMLInputElement>, subcategoryId: string) => {
      const updatedSelectedSubcategories = event.target.checked
        ? [...selectedSubcategories, subcategoryId]
        : selectedSubcategories.filter((id) => id !== subcategoryId);
      setSelectedSubcategories(updatedSelectedSubcategories);
    };
  
    // Função para determinar o preço efetivo
  const getEffectivePrice = (subcategory: Subcategory, category: Category): number | null => {
    // Verificar lotes ativos na subcategoria
    const activeSubcategoryBatch = subcategory.batches?.find((batch) => isBatchActive(batch));
    if (activeSubcategoryBatch) return activeSubcategoryBatch.price;

    // Verificar lotes ativos na categoria
    const activeCategoryBatch = category.batches?.find((batch) => isBatchActive(batch));
    if (activeCategoryBatch) return activeCategoryBatch.price;

    // Verificar lotes globais
    const activeGlobalBatch = globalBatches.find((batch) => isBatchActive(batch));
    if (activeGlobalBatch) return activeGlobalBatch.price;

    // Se não houver lotes ativos, seguir a hierarquia de valores fixos
    if (subcategory.price !== undefined) return subcategory.price;
    if (category.price !== undefined) return category.price;
    if (globalPrice !== null) return globalPrice;

    // Preço não definido
    return null;
  };

  const isBatchActive = (batch: Batch): boolean => {
    const currentDate = new Date();
    if (batch.type === 'temporal') {
      const startDate = new Date(batch.startDate || '');
      const endDate = new Date(batch.endDate || '');
      return currentDate >= startDate && currentDate <= endDate;
    } else if (batch.type === 'quantity') {
      // Implementar lógica para verificar a quantidade de inscrições
      // Exemplo: return totalRegistrations < batch.quantity!;
      return true; // Placeholder
    }
    return false;
  };

    // Função para abrir o modal de resumo
  const handleOpenSummaryModal = () => {
    setOpenSummaryModal(true);
  };

  const handleCloseSummaryModal = () => {
    setOpenSummaryModal(false);
  };

  return (
    <Box
      sx={{
        padding: { xs: '20px', md: '40px' },
        maxWidth: { xs: '100%', md: '1400px' },
        margin: '0 auto',
        position: 'relative',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          marginBottom: '20px',
          color: colors.primary,
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        Gerenciamento de Categorias e Valores
      </Typography>

      {/* Botões "Adicionar Categoria", "Configurar Valores" e "Resumo" */}
      <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
        <Button
          variant="contained"
          onClick={handleAddCategory}
          sx={{
            backgroundColor: colors.primary,
            color: colors.white,
            '&:hover': {
              backgroundColor: '#434190',
            },
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '8px',
            textTransform: 'none',
            marginRight: '16px',
          }}
        >
          Adicionar Categoria
        </Button>
        <Button
          variant="outlined"
          onClick={handleOpenPriceModal}
          sx={{
            color: colors.primary,
            borderColor: colors.primary,
            '&:hover': {
              backgroundColor: colors.grayLight,
              borderColor: colors.primary,
            },
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '8px',
            textTransform: 'none',
            marginRight: '16px',
          }}
        >
          Configurar Valores
        </Button>
        <Button
        variant="outlined"
        onClick={handleOpenSummaryModal}
        sx={{
          color: colors.primary,
          borderColor: colors.primary,
          '&:hover': {
            backgroundColor: colors.grayLight,
            borderColor: colors.primary,
          },
          padding: '12px 24px',
          fontSize: '16px',
          borderRadius: '8px',
          textTransform: 'none',
        }}
      >
        Resumo das Configurações
      </Button>
      </Box>

      {/* Lista de Categorias */}
      {categories.map((category, index) => (
        <Paper
          key={category.id}
          elevation={3}
          sx={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}
        >
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMore sx={{ color: colors.primary }} />}
              sx={{
                backgroundColor: colors.primary,
                color: colors.white,
                padding: '0 16px',
              }}
            >
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Categoria: {category.name}
              </Typography>
              <Button
                variant="text"
                startIcon={<Add sx={{ color: colors.white }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSubcategory(index);
                }}
                sx={{
                  textTransform: 'none',
                  color: colors.white,
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                Adicionar Subcategoria
              </Button>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCategory(index);
                }}
                sx={{ color: colors.white }}
              >
                <Tooltip title="Editar Categoria">
                  <Edit />
                </Tooltip>
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(index);
                }}
                sx={{ color: colors.white }}
              >
                <Tooltip title="Excluir Categoria">
                  <Delete />
                </Tooltip>
              </IconButton>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: 0 }}>
              <Table>
                <TableBody>
                  {category.description && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" sx={{ color: colors.grayDark, margin: 2 }}>
                          {category.description}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  {category.subcategories.map((subcategory, subIndex) => (
                    <TableRow
                      key={subcategory.id}
                      sx={{
                        backgroundColor:
                          subIndex % 2 === 0 ? colors.grayLight : colors.white,
                      }}
                    >
                      <TableCell>
                        <Typography variant="body1">{subcategory.name}</Typography>
                        {subcategory.description && (
                          <Typography variant="body2" sx={{ color: colors.grayDark }}>
                            {subcategory.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {/* Exibir preço efetivo */}
                        {(() => {
                          const price = getEffectivePrice(subcategory, category);
                          return price !== null ? (
                            <Typography variant="body1">
                              Preço Efetivo: R$ {price.toFixed(2)}
                            </Typography>
                          ) : (
                            <Typography variant="body1">Preço não definido</Typography>
                          );
                        })()}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={() => handleEditSubcategory(index, subIndex)}
                          sx={{ color: colors.primary }}
                        >
                          <Tooltip title="Editar Subcategoria">
                            <Edit />
                          </Tooltip>
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteSubcategory(index, subIndex)}
                          sx={{ color: colors.primary }}
                        >
                          <Tooltip title="Excluir Subcategoria">
                            <Delete />
                          </Tooltip>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        </Paper>
      ))}

      {/* Modal para Categoria */}
      <Modal open={openCategoryModal} onClose={handleCloseCategoryModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: colors.white,
            p: 4,
            borderRadius: '8px',
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ color: colors.grayDark, mb: 2 }}>
            {editingCategoryIndex !== null ? 'Editar Categoria' : 'Adicionar Categoria'}
          </Typography>
          <TextField
            label="Nome da Categoria"
            fullWidth
            required
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Descrição da Categoria"
            fullWidth
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSaveCategory}
            disabled={!categoryName}
            sx={{
              backgroundColor: colors.primary,
              color: colors.white,
              '&:hover': {
                backgroundColor: '#434190',
              },
              padding: '10px 0',
              borderRadius: '8px',
            }}
            fullWidth
          >
            Salvar
          </Button>
        </Box>
      </Modal>

      {/* Modal para Subcategoria */}
      <Modal open={openSubcategoryModal} onClose={handleCloseSubcategoryModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: colors.white,
            p: 4,
            borderRadius: '8px',
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ color: colors.grayDark, mb: 2 }}>
            {editingSubcategoryIndex !== null ? 'Editar Subcategoria' : 'Adicionar Subcategoria'}
          </Typography>
          <TextField
            label="Nome da Subcategoria"
            fullWidth
            required
            value={subcategoryName}
            onChange={(e) => setSubcategoryName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Descrição da Subcategoria"
            fullWidth
            value={subcategoryDescription}
            onChange={(e) => setSubcategoryDescription(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSaveSubcategory}
            disabled={!subcategoryName}
            sx={{
              backgroundColor: colors.primary,
              color: colors.white,
              '&:hover': {
                backgroundColor: '#434190',
              },
              padding: '10px 0',
              borderRadius: '8px',
            }}
            fullWidth
          >
            Salvar
          </Button>
        </Box>
      </Modal>

      {/* Modal para Configurar Valores */}
      <Modal open={openPriceModal} onClose={handleClosePriceModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: colors.white,
            p: 4,
            borderRadius: '8px',
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ color: colors.grayDark, mb: 2 }}>
            Configurar Valores
          </Typography>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel id="price-config-type-label">Tipo de Precificação</InputLabel>
            <Select
              labelId="price-config-type-label"
              value={priceConfigType}
              label="Tipo de Precificação"
              onChange={(e) => setPriceConfigType(e.target.value as any)}
            >
              <MenuItem value="unique">Valor Único para o Evento</MenuItem>
              <MenuItem value="category">Valores por Categoria</MenuItem>
              <MenuItem value="subcategory">Valores por Subcategoria</MenuItem>
              <MenuItem value="batch">Lotes</MenuItem>
            </Select>
          </FormControl>

          {priceConfigType === 'unique' && (
            <TextField
              label="Valor Único do Evento"
              fullWidth
              type="number"
              value={globalPrice !== null ? globalPrice : ''}
              onChange={(e) => setGlobalPrice(parseFloat(e.target.value))}
              sx={{ marginBottom: 2 }}
            />
          )}

          {priceConfigType === 'category' && (
            <Box sx={{ maxHeight: '300px', overflowY: 'auto', marginBottom: 2 }}>
              {categories.map((category, index) => (
                <TextField
                  key={category.id}
                  label={`Preço da Categoria: ${category.name}`}
                  fullWidth
                  type="number"
                  value={category.price !== undefined ? category.price : ''}
                  onChange={(e) => {
                    const updatedCategories = [...categories];
                    updatedCategories[index].price = parseFloat(e.target.value);
                    setCategories(updatedCategories);
                  }}
                  sx={{ marginBottom: 2 }}
                />
              ))}
            </Box>
          )}

          {priceConfigType === 'subcategory' && (
            <Box sx={{ maxHeight: '300px', overflowY: 'auto', marginBottom: 2 }}>
              {categories.map((category, categoryIndex) => (
                <Box key={category.id} sx={{ marginBottom: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: colors.grayDark }}>
                    Categoria: {category.name}
                  </Typography>
                  {category.subcategories.map((subcategory, subIndex) => (
                    <TextField
                      key={`${category.id}-${subcategory.id}`}
                      label={`Preço da Subcategoria: ${subcategory.name}`}
                      fullWidth
                      type="number"
                      value={subcategory.price !== undefined ? subcategory.price : ''}
                      onChange={(e) => {
                        const updatedCategories = [...categories];
                        updatedCategories[categoryIndex].subcategories[subIndex].price = parseFloat(
                          e.target.value
                        );
                        setCategories(updatedCategories);
                      }}
                      sx={{ marginBottom: 2 }}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          )}

          {priceConfigType === 'batch' && (
            <>
              <FormControl fullWidth sx={{ marginBottom: 2 }}>
                <InputLabel id="batch-application-level-label">Nível de Aplicação do Lote</InputLabel>
                <Select
                  labelId="batch-application-level-label"
                  value={batchApplicationLevel}
                  label="Nível de Aplicação do Lote"
                  onChange={(e) => {
                    setBatchApplicationLevel(e.target.value as any);
                    setSelectedCategories([]);
                    setSelectedSubcategories([]);
                  }}
                >
                  <MenuItem value="global">Lote Global</MenuItem>
                  <MenuItem value="category">Lote por Categoria</MenuItem>
                  <MenuItem value="subcategory">Lote por Subcategoria</MenuItem>
                </Select>
              </FormControl>

              {/* Seleção de Categorias/Subcategorias se aplicável */}
              {batchApplicationLevel === 'category' && (
                <Box sx={{ marginBottom: 2 }}>
                  <Typography variant="subtitle1">Selecione as Categorias:</Typography>
                  {categories.map((category) => (
                    <FormControlLabel
                      key={category.id}
                      control={
                        <Checkbox
                          checked={selectedCategories.includes(category.id)}
                          onChange={(e) => handleCategorySelection(e, category.id)}
                        />
                      }
                      label={category.name}
                    />
                  ))}
                </Box>
              )}

              {batchApplicationLevel === 'subcategory' && (
                <Box sx={{ marginBottom: 2 }}>
                  <Typography variant="subtitle1">Selecione as Subcategorias:</Typography>
                  {categories.map((category) => (
                    <Box key={category.id} sx={{ marginLeft: 2 }}>
                      <Typography variant="subtitle2">{category.name}</Typography>
                      {category.subcategories.map((subcategory) => (
                        <FormControlLabel
                          key={subcategory.id}
                          control={
                            <Checkbox
                              checked={selectedSubcategories.includes(subcategory.id)}
                              onChange={(e) => handleSubcategorySelection(e, subcategory.id)}
                            />
                          }
                          label={subcategory.name}
                        />
                      ))}
                    </Box>
                  ))}
                </Box>
              )}

              <Button
                variant="outlined"
                onClick={handleAddBatch}
                sx={{
                  marginBottom: 2,
                  color: colors.primary,
                  borderColor: colors.primary,
                  '&:hover': {
                    backgroundColor: colors.grayLight,
                    borderColor: colors.primary,
                  },
                }}
              >
                Adicionar Lote
              </Button>
              {batchConfigs.map((batch, index) => (
                <Paper key={batch.id} sx={{ padding: 2, marginBottom: 2 }}>
                  <TextField
                    label="Nome do Lote"
                    fullWidth
                    value={batch.name}
                    onChange={(e) => {
                      const updatedBatches = [...batchConfigs];
                      updatedBatches[index].name = e.target.value;
                      setBatchConfigs(updatedBatches);
                    }}
                    sx={{ marginBottom: 2 }}
                  />
                  <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel id={`batch-type-label-${batch.id}`}>Tipo de Lote</InputLabel>
                    <Select
                      labelId={`batch-type-label-${batch.id}`}
                      value={batch.type}
                      label="Tipo de Lote"
                      onChange={(e) => {
                        const updatedBatches = [...batchConfigs];
                        updatedBatches[index].type = e.target.value as any;
                        setBatchConfigs(updatedBatches);
                      }}
                    >
                      <MenuItem value="temporal">Temporal</MenuItem>
                      <MenuItem value="quantity">Por Quantidade</MenuItem>
                    </Select>
                  </FormControl>
                  {batch.type === 'temporal' && (
                    <>
                      <TextField
                        label="Data de Início"
                        type="date"
                        fullWidth
                        value={batch.startDate}
                        onChange={(e) => {
                          const updatedBatches = [...batchConfigs];
                          updatedBatches[index].startDate = e.target.value;
                          setBatchConfigs(updatedBatches);
                        }}
                        sx={{ marginBottom: 2 }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                      <TextField
                        label="Data de Fim"
                        type="date"
                        fullWidth
                        value={batch.endDate}
                        onChange={(e) => {
                          const updatedBatches = [...batchConfigs];
                          updatedBatches[index].endDate = e.target.value;
                          setBatchConfigs(updatedBatches);
                        }}
                        sx={{ marginBottom: 2 }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </>
                  )}
                  {batch.type === 'quantity' && (
                    <TextField
                      label="Quantidade de Inscrições"
                      type="number"
                      fullWidth
                      value={batch.quantity !== undefined ? batch.quantity : ''}
                      onChange={(e) => {
                        const updatedBatches = [...batchConfigs];
                        updatedBatches[index].quantity = parseInt(e.target.value, 10);
                        setBatchConfigs(updatedBatches);
                      }}
                      sx={{ marginBottom: 2 }}
                    />
                  )}
                  <TextField
                    label="Preço do Lote"
                    type="number"
                    fullWidth
                    value={batch.price}
                    onChange={(e) => {
                      const updatedBatches = [...batchConfigs];
                      updatedBatches[index].price = parseFloat(e.target.value);
                      setBatchConfigs(updatedBatches);
                    }}
                    sx={{ marginBottom: 2 }}
                  />
                  <Box display="flex" justifyContent="flex-end">
                    <IconButton
                      onClick={() => handleDeleteBatch(index)}
                      sx={{ color: colors.primary }}
                    >
                      <Tooltip title="Excluir Lote">
                        <Delete />
                      </Tooltip>
                    </IconButton>
                  </Box>
                </Paper>
              ))}
            </>
          )}

          <Button
            variant="contained"
            onClick={handleSavePriceConfig}
            sx={{
              backgroundColor: colors.primary,
              color: colors.white,
              '&:hover': {
                backgroundColor: '#434190',
              },
              padding: '10px 0',
              borderRadius: '8px',
              marginTop: 2,
            }}
            fullWidth
          >
            Salvar Configuração de Valores
          </Button>
        </Box>
      </Modal>

      {/* Modal de Resumo das Configurações de Valores */}
      <Modal open={openSummaryModal} onClose={handleCloseSummaryModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', md: '80%', lg: '70%' },
            maxHeight: '90vh',
            overflowY: 'auto',
            bgcolor: colors.white,
            p: 4,
            borderRadius: '8px',
            boxShadow: 24,
          }}
        >
          <Typography variant="h5" sx={{ color: colors.primary, mb: 3, fontWeight: 'bold' }}>
            Resumo das Configurações de Valores
          </Typography>

          {/* Resumo do Valor Global */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: colors.grayDark }}>
                Valor Global
              </Typography>
              {globalPrice !== null ? (
                <Typography variant="h4" sx={{ color: colors.green, fontWeight: 'bold' }}>
                  R$ {globalPrice.toFixed(2)}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: colors.grayDark }}>
                  Não definido
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Resumo dos Lotes Globais */}
          {globalBatches.length > 0 ? (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: colors.grayDark, mb: 2 }}>
                  Lotes Globais
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Preço</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Início</TableCell>
                      <TableCell>Fim</TableCell>
                      <TableCell>Quantidade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {globalBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell>{batch.name}</TableCell>
                        <TableCell>R$ {batch.price.toFixed(2)}</TableCell>
                        <TableCell>{batch.type === 'temporal' ? 'Temporal' : 'Por Quantidade'}</TableCell>
                        <TableCell>{batch.type === 'temporal' ? batch.startDate : '-'}</TableCell>
                        <TableCell>{batch.type === 'temporal' ? batch.endDate : '-'}</TableCell>
                        <TableCell>{batch.type === 'quantity' ? batch.quantity : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          {/* Resumo das Categorias */}
          {categories.map((category) => {
            const hasCategoryPriceOrBatches =
              category.price !== undefined || (category.batches && category.batches.length > 0);
            if (!hasCategoryPriceOrBatches) return null;

            return (
              <Accordion key={category.id} defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{ backgroundColor: colors.grayLight }}
                >
                  <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 'bold' }}>
                    Categoria: {category.name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Preço da Categoria */}
                  {category.price !== undefined ? (
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Preço: R$ {category.price.toFixed(2)}
                    </Typography>
                  ) : null}

                  {/* Lotes da Categoria */}
                  {category.batches && category.batches.length > 0 ? (
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ color: colors.grayDark, mb: 2 }}>
                          Lotes da Categoria
                        </Typography>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Nome</TableCell>
                              <TableCell>Preço</TableCell>
                              <TableCell>Tipo</TableCell>
                              <TableCell>Início</TableCell>
                              <TableCell>Fim</TableCell>
                              <TableCell>Quantidade</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {category.batches.map((batch) => (
                              <TableRow key={batch.id}>
                                <TableCell>{batch.name}</TableCell>
                                <TableCell>R$ {batch.price.toFixed(2)}</TableCell>
                                <TableCell>{batch.type === 'temporal' ? 'Temporal' : 'Por Quantidade'}</TableCell>
                                <TableCell>{batch.type === 'temporal' ? batch.startDate : '-'}</TableCell>
                                <TableCell>{batch.type === 'temporal' ? batch.endDate : '-'}</TableCell>
                                <TableCell>{batch.type === 'quantity' ? batch.quantity : '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ) : null}

                  {/* Subcategorias */}
                  {category.subcategories.map((subcategory) => {
                    const hasSubcategoryPriceOrBatches =
                      subcategory.price !== undefined || (subcategory.batches && subcategory.batches.length > 0);
                    if (!hasSubcategoryPriceOrBatches) return null;

                    return (
                      <Accordion key={subcategory.id}>
                        <AccordionSummary
                          expandIcon={<ExpandMore />}
                          sx={{ backgroundColor: colors.grayLight }}
                        >
                          <Typography variant="subtitle1" sx={{ color: colors.primary }}>
                            Subcategoria: {subcategory.name}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {/* Preço da Subcategoria */}
                          {subcategory.price !== undefined ? (
                            <Typography variant="body1" sx={{ mb: 2 }}>
                              Preço: R$ {subcategory.price.toFixed(2)}
                            </Typography>
                          ) : null}

                          {/* Lotes da Subcategoria */}
                          {subcategory.batches && subcategory.batches.length > 0 ? (
                            <Card sx={{ mb: 2 }}>
                              <CardContent>
                                <Typography variant="subtitle1" sx={{ color: colors.grayDark, mb: 2 }}>
                                  Lotes da Subcategoria
                                </Typography>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Nome</TableCell>
                                      <TableCell>Preço</TableCell>
                                      <TableCell>Tipo</TableCell>
                                      <TableCell>Início</TableCell>
                                      <TableCell>Fim</TableCell>
                                      <TableCell>Quantidade</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {subcategory.batches.map((batch) => (
                                      <TableRow key={batch.id}>
                                        <TableCell>{batch.name}</TableCell>
                                        <TableCell>R$ {batch.price.toFixed(2)}</TableCell>
                                        <TableCell>{batch.type === 'temporal' ? 'Temporal' : 'Por Quantidade'}</TableCell>
                                        <TableCell>{batch.type === 'temporal' ? batch.startDate : '-'}</TableCell>
                                        <TableCell>{batch.type === 'temporal' ? batch.endDate : '-'}</TableCell>
                                        <TableCell>{batch.type === 'quantity' ? batch.quantity : '-'}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </Card>
                          ) : null}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </Modal>
    </Box>
  );
};

export default TicketsCard;
