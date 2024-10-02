import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
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
  Modal,
  Card,
  CardContent,
  Grid,
  TableContainer,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, ExpandMore } from '@mui/icons-material';
import {useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Importando o gerador de UUID

const colors = {
  primary: '#5A67D8',
  green: '#4778ff',
  grayDark: '#2D3748',
  grayLight: '#F7FAFC',
  white: '#FFFFFF',
  categoriaBg: '#E2E8F0', // Light gray for categories
  priceConfigBg: '#E2E8F0', // Light green for price configurations
};

// Interfaces atualizadas
interface Batch {
  id: string;
  name: string;
  type: 'temporal' | 'quantity';
  start_date?: string;
  end_date?: string;
  start_quantity?: number;
  end_quantity?: number;
  price: number;
}

interface Subcategoria {
  id: string;
  name: string;
  description?: string;
  category_id?: string; // Adicionado para mapear a categoria
}

interface categoria {
  id: string;
  name: string;
  description?: string;
  subcategories: Subcategoria[];
}

interface PriceConfiguration {
  id: string;
  name: string;
  type: 'standard' | 'batch';
  applies_to: 'global' | 'categoria' | 'subcategoria';
  categories?: string[];
  subcategories?: string[];
  price?: number;
  batch_configs?: Batch[];
}

interface TicketsCardProps {
  eventId: string; // Definindo a prop eventId
}

const TicketsCard: React.FC<TicketsCardProps> = ({ eventId }) => {
  const [categories, setCategories] = useState<categoria[]>([]);
  const [priceConfigurations, setPriceConfigurations] = useState<PriceConfiguration[]>([]);

  // Estados para feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Estados para carregamento e erro durante a busca de dados
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const theme = useTheme();

  // State variables para categoria
  const [opencategoriaModal, setOpencategoriaModal] = useState(false);
  const [categoriaName, setcategoriaName] = useState('');
  const [categoriaDescription, setcategoriaDescription] = useState('');
  const [editingcategoriaIndex, setEditingcategoriaIndex] = useState<number | null>(null);

  // State variables para Subcategoria
  const [openSubcategoriaModal, setOpenSubcategoriaModal] = useState(false);
  const [currentcategoriaIndex, setCurrentcategoriaIndex] = useState<number | null>(null);
  const [subcategoriaName, setSubcategoriaName] = useState('');
  const [subcategoriaDescription, setSubcategoriaDescription] = useState('');
  const [editingSubcategoriaIndex, setEditingSubcategoriaIndex] = useState<number | null>(null);

  // State variables para Configurações de Preços
  const [openPriceConfigModal, setOpenPriceConfigModal] = useState(false);
  const [editingPriceConfigIndex, setEditingPriceConfigIndex] = useState<number | null>(null);
  const [priceConfigType, setPriceConfigType] = useState<'standard' | 'batch'>('standard');
  const [priceConfigAppliesTo, setPriceConfigAppliesTo] = useState<
    'global' | 'categoria' | 'subcategoria'
  >('global');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [price, setPrice] = useState<number | null>(null);
  const [batchConfigs, setBatchConfigs] = useState<Batch[]>([]);

  // Funções para categoria
  const handleAddcategoria = () => {
    setOpencategoriaModal(true);
  };

  const handleEditcategoria = (index: number) => {
    const categoriaToEdit = categories[index];
    setcategoriaName(categoriaToEdit.name);
    setcategoriaDescription(categoriaToEdit.description || '');
    setEditingcategoriaIndex(index);
    setOpencategoriaModal(true);
  };

  const handleDeletecategoria = (index: number) => {
    const categoriaIdToDelete = categories[index].id;
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    // Remove categoria IDs das configurações de preços
    const updatedPriceConfigs = priceConfigurations.map((config) => {
      if (config.applies_to === 'categoria' && config.categories) {
        return {
          ...config,
          categories: config.categories.filter((id) => id !== categoriaIdToDelete),
        };
      }
      return config;
    });
    setPriceConfigurations(updatedPriceConfigs);
  };

  const handleClosecategoriaModal = () => {
    setOpencategoriaModal(false);
    setcategoriaName('');
    setcategoriaDescription('');
    setEditingcategoriaIndex(null);
  };

  const handleSavecategoria = () => {
    const newcategoria: categoria = {
      id: editingcategoriaIndex !== null ? categories[editingcategoriaIndex].id : uuidv4(), // Preservar ID se editar
      name: categoriaName,
      description: categoriaDescription,
      subcategories:
        editingcategoriaIndex !== null ? categories[editingcategoriaIndex].subcategories : [],
    };

    if (editingcategoriaIndex !== null) {
      const updatedCategories = [...categories];
      updatedCategories[editingcategoriaIndex] = newcategoria;
      setCategories(updatedCategories);
    } else {
      setCategories([...categories, newcategoria]);
    }
    handleClosecategoriaModal();
  };

  // Funções para Subcategoria
  const handleAddSubcategoria = (index: number) => {
    setCurrentcategoriaIndex(index);
    setOpenSubcategoriaModal(true);
  };

  const handleEditSubcategoria = (categoriaIndex: number, subcategoriaIndex: number) => {
    const subcategoriaToEdit = categories[categoriaIndex].subcategories[subcategoriaIndex];
    setSubcategoriaName(subcategoriaToEdit.name);
    setSubcategoriaDescription(subcategoriaToEdit.description || '');
    setCurrentcategoriaIndex(categoriaIndex);
    setEditingSubcategoriaIndex(subcategoriaIndex);
    setOpenSubcategoriaModal(true);
  };

  const handleDeleteSubcategoria = (categoriaIndex: number, subcategoriaIndex: number) => {
    const subcategoriaIdToDelete = categories[categoriaIndex].subcategories[subcategoriaIndex]?.id;
    const updatedCategories = [...categories];
    updatedCategories[categoriaIndex].subcategories = updatedCategories[categoriaIndex].subcategories.filter(
      (_, i) => i !== subcategoriaIndex
    );
    setCategories(updatedCategories);
    // Remove subcategoria IDs das configurações de preços
    const updatedPriceConfigs = priceConfigurations.map((config) => {
      if (config.applies_to === 'subcategoria' && config.subcategories) {
        return {
          ...config,
          subcategories: config.subcategories.filter((id) => id !== subcategoriaIdToDelete),
        };
      }
      return config;
    });
    setPriceConfigurations(updatedPriceConfigs);
  };

  const handleCloseSubcategoriaModal = () => {
    setOpenSubcategoriaModal(false);
    setSubcategoriaName('');
    setSubcategoriaDescription('');
    setEditingSubcategoriaIndex(null);
    setCurrentcategoriaIndex(null);
  };
  
  const SectionHeader = styled(Typography)(({ theme }) => ({
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(1),
    },
  }));

  const handleSaveSubcategoria = () => {
    if (currentcategoriaIndex !== null) {
      const existingSubcategoria = editingSubcategoriaIndex !== null
        ? categories[currentcategoriaIndex].subcategories[editingSubcategoriaIndex]
        : null;

      const newSubcategoria: Subcategoria = {
        id: existingSubcategoria ? existingSubcategoria.id : uuidv4(), // Preservar ID se editar
        name: subcategoriaName,
        description: subcategoriaDescription,
        category_id: categories[currentcategoriaIndex].id,
      };

      const updatedCategories = [...categories];
      if (editingSubcategoriaIndex !== null) {
        updatedCategories[currentcategoriaIndex].subcategories[editingSubcategoriaIndex] =
          newSubcategoria;
      } else {
        updatedCategories[currentcategoriaIndex].subcategories.push(newSubcategoria);
      }
      setCategories(updatedCategories);
      handleCloseSubcategoriaModal();
    }
  };

  // Funções para Configurações de Preços
  const handleOpenPriceConfigModal = () => {
    setOpenPriceConfigModal(true);
  };

  const handleClosePriceConfigModal = () => {
    setOpenPriceConfigModal(false);
    setPriceConfigType('standard');
    setPriceConfigAppliesTo('global');
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setPrice(null);
    setBatchConfigs([]);
    setEditingPriceConfigIndex(null);
  };

  const generatePriceConfigName = (config: PriceConfiguration): string => {
    const typeLabel = config.type === 'standard' ? 'Padrão' : 'Lote';
    const appliesToLabel =
      config.applies_to === 'global'
        ? 'Global'
        : config.applies_to === 'categoria'
        ? 'Categoria'
        : 'Subcategoria';
    if (config.type === 'standard' && config.price !== undefined) {
      return `${typeLabel} - ${appliesToLabel} - R$${config.price.toFixed(2)}`;
    }
    return `${typeLabel} - ${appliesToLabel}`;
  };

  const handleSavePriceConfig = () => {
    // Validação antes de salvar (opcional)
    // ... adicione validações conforme necessário

    // Gera o nome automaticamente
    const newConfig: PriceConfiguration = {
      id: editingPriceConfigIndex !== null ? priceConfigurations[editingPriceConfigIndex].id : uuidv4(), // Preservar ID se editar
      name: '', // Será preenchido depois
      type: priceConfigType,
      applies_to: priceConfigAppliesTo,
      categories: priceConfigAppliesTo === 'categoria' ? selectedCategories : undefined,
      subcategories: priceConfigAppliesTo === 'subcategoria' ? selectedSubcategories : undefined,
      price: priceConfigType === 'standard' ? (price !== null ? price : undefined) : undefined,
      batch_configs: priceConfigType === 'batch' ? batchConfigs : undefined,
    };

    // Gera o nome baseado nas informações
    newConfig.name = generatePriceConfigName(newConfig);

    if (editingPriceConfigIndex !== null) {
      const updatedConfigs = [...priceConfigurations];
      updatedConfigs[editingPriceConfigIndex] = newConfig;
      setPriceConfigurations(updatedConfigs);
    } else {
      setPriceConfigurations([...priceConfigurations, newConfig]);
    }
    handleClosePriceConfigModal();
  };

  const handleEditPriceConfig = (index: number) => {
    const configToEdit = priceConfigurations[index];
    setPriceConfigType(configToEdit.type);
    setPriceConfigAppliesTo(configToEdit.applies_to);
    setSelectedCategories(configToEdit.categories || []);
    setSelectedSubcategories(configToEdit.subcategories || []);
    setPrice(configToEdit.price || null);
    setBatchConfigs(configToEdit.batch_configs || []);
    setEditingPriceConfigIndex(index);
    setOpenPriceConfigModal(true);
  };

  const handleDeletePriceConfig = (index: number) => {
    const updatedConfigs = priceConfigurations.filter((_, i) => i !== index);
    setPriceConfigurations(updatedConfigs);
  };

  // Função para determinar o preço efetivo
  const getEffectivePrice = (subcategoria: Subcategoria, categoria: categoria): number | null => {
    // 1. Verificar lotes ativos começando do nível mais específico
    // a) Lotes no nível de subcategoria
    for (const config of priceConfigurations.filter((pc) => pc.type === 'batch')) {
      if (
        config.applies_to === 'subcategoria' &&
        config.subcategories?.includes(subcategoria.id)
      ) {
        for (const batch of config.batch_configs || []) {
          if (isBatchActive(batch)) {
            return batch.price;
          }
        }
      }
    }

    // b) Lotes no nível de categoria
    for (const config of priceConfigurations.filter((pc) => pc.type === 'batch')) {
      if (config.applies_to === 'categoria' && config.categories?.includes(categoria.id)) {
        for (const batch of config.batch_configs || []) {
          if (isBatchActive(batch)) {
            return batch.price;
          }
        }
      }
    }

    // c) Lotes Globais
    for (const config of priceConfigurations.filter((pc) => pc.type === 'batch')) {
      if (config.applies_to === 'global') {
        for (const batch of config.batch_configs || []) {
          if (isBatchActive(batch)) {
            return batch.price;
          }
        }
      }
    }

    // 2. Sem lotes ativos encontrados, verificar preços fixos começando do nível mais específico
    // a) Preço da subcategoria
    for (const config of priceConfigurations.filter((pc) => pc.type === 'standard')) {
      if (
        config.applies_to === 'subcategoria' &&
        config.subcategories?.includes(subcategoria.id) &&
        config.price !== undefined
      ) {
        return config.price;
      }
    }

    // b) Preço da categoria
    for (const config of priceConfigurations.filter((pc) => pc.type === 'standard')) {
      if (
        config.applies_to === 'categoria' &&
        config.categories?.includes(categoria.id) &&
        config.price !== undefined
      ) {
        return config.price;
      }
    }

    // c) Preço Global
    const globalConfig = priceConfigurations.find(
      (pc) => pc.type === 'standard' && pc.applies_to === 'global' && pc.price !== undefined
    );
    if (globalConfig) {
      return globalConfig.price!;
    }

    // Preço não definido
    return null;
  };

  const isBatchActive = (batch: Batch): boolean => {
    const currentDate = new Date();
    if (batch.type === 'temporal') {
      const startDate = new Date(batch.start_date || '');
      const endDate = new Date(batch.end_date || '');
      return currentDate >= startDate && currentDate <= endDate;
    } else if (batch.type === 'quantity') {
      // Lógica de placeholder para lotes por quantidade
      return false;
    }
    return false;
  };

  const getConfigTypeLabel = (type: string) => {
    if (type === 'standard') return 'Padrão';
    if (type === 'batch') return 'Lote';
    return '';
  };

  // useEffect para adicionar um lote padrão quando 'batch' é selecionado
  useEffect(() => {
    if (priceConfigType === 'batch' && batchConfigs.length === 0) {
      const defaultBatch: Batch = {
        id: uuidv4(), // Gerando UUID
        name: '',
        type: 'temporal',
        start_date: '',
        end_date: '',
        price: 0,
      };
      setBatchConfigs([defaultBatch]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceConfigType]);

  // useEffect para buscar dados existentes ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/organizer_detail/${eventId}/get_categories`
        );

        if (response.status === 200) {
          const data = response.data;

          // Supondo que a resposta tenha 'categories' e 'price_configurations'
          const typedData = data as { categories: categoria[], price_configurations: PriceConfiguration[] };
          setCategories(typedData.categories || []);
          setPriceConfigurations(typedData.price_configurations || []);
        } else {
          setFetchError(`Erro ao buscar dados: ${response.statusText}`);
        }
      } catch (error: any) {
        setFetchError(error.message || 'Ocorreu um erro ao buscar os dados.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  // Função para consolidar e enviar os dados
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    // Validação básica
    for (const cat of categories) {
      if (cat.subcategories.length === 0) {
        setSaveError(`A categoria "${cat.name}" deve ter pelo menos uma subcategoria.`);
        setIsSaving(false);
        return;
      }
    }

    for (const config of priceConfigurations) {
      if (config.type === 'standard' && (config.price ?? 0) <= 0) {
        setSaveError(`A configuração "${config.name}" deve ter um preço válido.`);
        setIsSaving(false);
        return;
      }

      if (config.type === 'batch') {
        if (!config.batch_configs || config.batch_configs.length === 0) {
          setSaveError(`A configuração "${config.name}" deve ter pelo menos um lote.`);
          setIsSaving(false);
          return;
        }

        for (const batch of config.batch_configs) {
          if (!batch.name) {
            setSaveError(`Todos os lotes na configuração "${config.name}" devem ter um nome.`);
            setIsSaving(false);
            return;
          }
          if (batch.price === null || batch.price <= 0) {
            setSaveError(`Todos os lotes na configuração "${config.name}" devem ter um preço válido.`);
            setIsSaving(false);
            return;
          }
          if (batch.type === 'temporal') {
            if (!batch.start_date || !batch.end_date) {
              setSaveError(`Todos os lotes temporais na configuração "${config.name}" devem ter datas de início e fim.`);
              setIsSaving(false);
              return;
            }
            const start = new Date(batch.start_date);
            const end = new Date(batch.end_date);
            if (start >= end) {
              setSaveError(`A data de início do lote "${batch.name}" deve ser anterior à data de fim.`);
              setIsSaving(false);
              return;
            }
          }
          // Adicione mais validações conforme necessário
        }
      }
    }

    // Estruturando os dados conforme as interfaces e o backend
    const dataToSend = {
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        subcategories: cat.subcategories.map((subcat) => ({
          id: subcat.id,
          name: subcat.name,
          description: subcat.description,
          category_id: cat.id, // Adiciona o ID da categoria
        })),
      })),
      price_configurations: priceConfigurations.map((config) => ({
        id: config.id,
        name: config.name,
        type: config.type,
        applies_to: config.applies_to, // snake_case
        categories: config.applies_to === 'categoria' ? config.categories : undefined,
        subcategories: config.applies_to === 'subcategoria' ? config.subcategories : undefined,
        price: config.type === 'standard' ? config.price : undefined,
        batch_configs: config.type === 'batch'
          ? config.batch_configs?.map((batch) => ({
              id: batch.id,
              name: batch.name,
              type: batch.type,
              start_date: batch.type === 'temporal' ? batch.start_date : undefined,
              end_date: batch.type === 'temporal' ? batch.end_date : undefined,
              start_quantity: batch.type === 'quantity' ? batch.start_quantity : undefined,
              end_quantity: batch.type === 'quantity' ? batch.end_quantity : undefined,
              price: batch.price,
            }))
          : undefined,
      })),
    };

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/organizer_detail/${eventId}/categories`,
        dataToSend
      );

      if (response.status === 200 || response.status === 201) {
        setSaveSuccess(true);
        // Opcional: Limpar os estados após o salvamento
        // setCategories([]);
        // setPriceConfigurations([]);
      } else {
        setSaveSuccess(false);
        setSaveError(`Erro: ${response.statusText}`);
      }
    } catch (error: any) {
      setSaveSuccess(false);
      setSaveError(error.message || 'Ocorreu um erro ao salvar os dados.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box
      sx={{
        padding: { xs: '20px', md: '40px' },
        maxWidth: { xs: '100%', md: '1400px' },
        margin: '0 auto',
        position: 'relative',
        backgroundColor: colors.grayLight,
        borderRadius: '12px',
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <SectionHeader variant="h6">Gerenciamento de Categorias e Valores</SectionHeader>
      </Box>

      {/* Indicador de Carregamento ou Erro */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" my={4}>
          <CircularProgress />
        </Box>
      ) : fetchError ? (
        <Box display="flex" justifyContent="center" alignItems="center" my={4}>
          <Typography variant="body1" color="error">
            {fetchError}
          </Typography>
        </Box>
      ) : (
        <>
          {/* Buttons "Add categoria" and "Add Price Configuration" */}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mb={4}
            sx={{ gap: '16px', flexWrap: 'wrap' }}
          >
            <Button
              variant="contained"
              onClick={handleAddcategoria}
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
              }}
              disabled={isSaving}
            >
              Adicionar Categoria
            </Button>
            <Button
              variant="contained"
              onClick={handleOpenPriceConfigModal}
              sx={{
                backgroundColor: colors.green,
                color: colors.white,
                '&:hover': {
                  backgroundColor: '#2F855A',
                },
                padding: '12px 24px',
                fontSize: '16px',
                borderRadius: '8px',
                textTransform: 'none',
              }}
              disabled={isSaving}
            >
              Adicionar Configuração de Valores
            </Button>
          </Box>

          {/* Categories Section */}
          <Card
            sx={{
              backgroundColor: colors.categoriaBg,
              marginBottom: '40px',
              boxShadow: 3,
              borderRadius: '12px',
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  color: colors.primary,
                  fontWeight: 'bold',
                  marginBottom: '20px',
                }}
              >
                Categorias
              </Typography>

              {/* List of Categories */}
              {categories.length === 0 ? (
                <Typography variant="body1" sx={{ color: colors.grayDark }}>
                  Nenhuma categoria adicionada.
                </Typography>
              ) : (
                categories.map((categoria, index) => (
                  <Paper
                    key={categoria.id}
                    elevation={2}
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
                          Categoria: {categoria.name}
                        </Typography>
                        <Button
                          variant="text"
                          startIcon={<Add sx={{ color: colors.white }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddSubcategoria(index);
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
                            handleEditcategoria(index);
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
                            handleDeletecategoria(index);
                          }}
                          sx={{ color: colors.white }}
                        >
                          <Tooltip title="Excluir Categoria">
                            <Delete />
                          </Tooltip>
                        </IconButton>
                      </AccordionSummary>
                      <AccordionDetails sx={{ padding: 0 }}>
                        <TableContainer sx={{ overflowX: 'auto' }}>
                          <Table>
                            <TableBody>
                              {categoria.description && (
                                <TableRow>
                                  <TableCell colSpan={3}>
                                    <Typography variant="body2" sx={{ color: colors.grayDark, margin: 2 }}>
                                      {categoria.description}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              )}
                              {categoria.subcategories.map((subcategoria, subIndex) => (
                                <TableRow
                                  key={subcategoria.id}
                                  sx={{
                                    backgroundColor: subIndex % 2 === 0 ? colors.grayLight : colors.white,
                                  }}
                                >
                                  <TableCell>
                                    <Typography variant="body1">{subcategoria.name}</Typography>
                                    {subcategoria.description && (
                                      <Typography variant="body2" sx={{ color: colors.grayDark }}>
                                        {subcategoria.description}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {/* Display effective price */}
                                    {(() => {
                                      const price = getEffectivePrice(subcategoria, categoria);
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
                                      onClick={() => handleEditSubcategoria(index, subIndex)}
                                      sx={{ color: colors.primary }}
                                    >
                                      <Tooltip title="Editar Subcategoria">
                                        <Edit />
                                      </Tooltip>
                                    </IconButton>
                                    <IconButton
                                      onClick={() => handleDeleteSubcategoria(index, subIndex)}
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
                        </TableContainer>
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                ))
              )}
            </CardContent>
          </Card>

          {/* Price Configurations Section */}
          <Card
            sx={{
              backgroundColor: colors.priceConfigBg,
              boxShadow: 3,
              borderRadius: '12px',
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  color: colors.green,
                  fontWeight: 'bold',
                  marginBottom: '20px',
                }}
              >
                Configurações de Valores
              </Typography>

              {/* List of Price Configurations */}
              {priceConfigurations.length === 0 ? (
                <Typography variant="body1" sx={{ color: colors.grayDark }}>
                  Nenhuma configuração de valores adicionada.
                </Typography>
              ) : (
                priceConfigurations.map((config, index) => (
                  <Paper
                    key={config.id}
                    elevation={2}
                    sx={{ marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}
                  >
                    <Accordion defaultExpanded={false}>
                      <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: colors.green }} />}
                        sx={{
                          backgroundColor: colors.green,
                          color: colors.white,
                          padding: '0 16px',
                        }}
                      >
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {config.name}
                        </Typography>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPriceConfig(index);
                          }}
                          sx={{ color: colors.white }}
                        >
                          <Tooltip title="Editar Configuração">
                            <Edit />
                          </Tooltip>
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePriceConfig(index);
                          }}
                          sx={{ color: colors.white }}
                        >
                          <Tooltip title="Excluir Configuração">
                            <Delete />
                          </Tooltip>
                        </IconButton>
                      </AccordionSummary>
                      <AccordionDetails sx={{ padding: 2 }}>
                        <Typography variant="body1">
                          <strong>Tipo:</strong> {getConfigTypeLabel(config.type)}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Aplicado a:</strong>{' '}
                          {config.applies_to.charAt(0).toUpperCase() + config.applies_to.slice(1)}
                        </Typography>
                        {/* Display linked categories or subcategories */}
                        {(config.applies_to === 'categoria' && config.categories?.length) && (
                          <Box sx={{ marginTop: 1 }}>
                            <Typography variant="body1">
                              <strong>Categorias Vinculadas:</strong>
                            </Typography>
                            <ul>
                              {categories
                                .filter((cat) => config.categories?.includes(cat.id))
                                .map((cat) => (
                                  <li key={cat.id}>{cat.name}</li>
                                ))}
                            </ul>
                          </Box>
                        )}
                        {(config.applies_to === 'subcategoria' && config.subcategories?.length) && (
                          <Box sx={{ marginTop: 1 }}>
                            <Typography variant="body1">
                              <strong>Subcategorias Vinculadas:</strong>
                            </Typography>
                            <ul>
                              {categories
                                .flatMap((cat) => cat.subcategories)
                                .filter((sub) => config.subcategories?.includes(sub.id))
                                .map((sub) => (
                                  <li key={sub.id}>{sub.name}</li>
                                ))}
                            </ul>
                          </Box>
                        )}
                        {/* Display price or batch configurations */}
                        {config.type === 'standard' && config.price !== undefined && (
                          <Typography variant="body1" sx={{ marginTop: 1 }}>
                            <strong>Preço:</strong> R$ {config.price.toFixed(2)}
                          </Typography>
                        )}
                        {config.type === 'batch' && config.batch_configs && config.batch_configs.length > 0 && (
                          <Box sx={{ marginTop: 2 }}>
                            <Typography variant="body1" gutterBottom>
                              <strong>Configurações de Lote:</strong>
                            </Typography>
                            <TableContainer sx={{ overflowX: 'auto' }}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Nome do Lote</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Data Início</TableCell>
                                    <TableCell>Data Fim</TableCell>
                                    <TableCell>Preço</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {config.batch_configs.map((batch) => (
                                    <TableRow key={batch.id}>
                                      <TableCell>{batch.name}</TableCell>
                                      <TableCell>{batch.type === 'temporal' ? 'Temporal' : 'Por Quantidade'}</TableCell>
                                      <TableCell>
                                        {batch.type === 'temporal' && batch.start_date
                                          ? new Date(batch.start_date).toLocaleDateString()
                                          : '-'}
                                      </TableCell>
                                      <TableCell>
                                        {batch.type === 'temporal' && batch.end_date
                                          ? new Date(batch.end_date).toLocaleDateString()
                                          : '-'}
                                      </TableCell>
                                      <TableCell>R$ {batch.price.toFixed(2)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Paper>
                ))
              )}
            </CardContent>
          </Card>

          {/* Botão "Salvar Tudo" */}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={4}
            sx={{ gap: '16px', flexWrap: 'wrap' }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={handleSaveAll}
              sx={{
                padding: '12px 24px',
                fontSize: '16px',
                borderRadius: '8px',
                textTransform: 'none',
              }}
              disabled={isSaving || isLoading}
            >
              {isSaving ? 'Salvando...' : 'Salvar Tudo'}
            </Button>
          </Box>

          {/* Feedback ao Usuário */}
          {saveSuccess && (
            <Box mt={2} display="flex" justifyContent="center">
              <Typography variant="body1" color="success.main">
                Dados salvos com sucesso!
              </Typography>
            </Box>
          )}

          {saveSuccess === false && saveError && (
            <Box mt={2} display="flex" justifyContent="center">
              <Typography variant="body1" color="error.main">
                {saveError}
              </Typography>
            </Box>
          )}

          {/* Modal para categoria */}
          <Modal open={opencategoriaModal} onClose={handleClosecategoriaModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: 300, sm: 400 },
                bgcolor: colors.white,
                p: 4,
                borderRadius: '8px',
                boxShadow: 24,
              }}
            >
              <Typography variant="h6" sx={{ color: colors.grayDark, mb: 2 }}>
                {editingcategoriaIndex !== null ? 'Editar Categoria' : 'Adicionar Categoria'}
              </Typography>
              <TextField
                label="Nome da Categoria"
                fullWidth
                required
                value={categoriaName}
                onChange={(e) => setcategoriaName(e.target.value)}
                sx={{ marginBottom: 2 }}
              />
              <TextField
                label="Descrição da Categoria"
                fullWidth
                value={categoriaDescription}
                onChange={(e) => setcategoriaDescription(e.target.value)}
                sx={{ marginBottom: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSavecategoria}
                disabled={!categoriaName}
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
          <Modal open={openSubcategoriaModal} onClose={handleCloseSubcategoriaModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: 300, sm: 400 },
                bgcolor: colors.white,
                p: 4,
                borderRadius: '8px',
                boxShadow: 24,
              }}
            >
              <Typography variant="h6" sx={{ color: colors.grayDark, mb: 2 }}>
                {editingSubcategoriaIndex !== null
                  ? 'Editar Subcategoria'
                  : 'Adicionar Subcategoria'}
              </Typography>
              <TextField
                label="Nome da Subcategoria"
                fullWidth
                required
                value={subcategoriaName}
                onChange={(e) => setSubcategoriaName(e.target.value)}
                sx={{ marginBottom: 2 }}
              />
              <TextField
                label="Descrição da Subcategoria"
                fullWidth
                value={subcategoriaDescription}
                onChange={(e) => setSubcategoriaDescription(e.target.value)}
                sx={{ marginBottom: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleSaveSubcategoria}
                disabled={!subcategoriaName}
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

          {/* Modal para Configuração de Preços */}
          <Modal open={openPriceConfigModal} onClose={handleClosePriceConfigModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '90%', md: '80%' },
                maxWidth: 1200,
                bgcolor: colors.white,
                p: 4,
                borderRadius: '8px',
                boxShadow: 24,
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <Typography variant="h6" sx={{ color: colors.grayDark, mb: 2 }}>
                {editingPriceConfigIndex !== null
                  ? 'Editar Configuração de Valores'
                  : 'Adicionar Configuração de Valores'}
              </Typography>
              {/* Removido o campo de Nome da Configuração */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="price-config-type-label">Tipo de Precificação</InputLabel>
                    <Select
                      labelId="price-config-type-label"
                      value={priceConfigType}
                      label="Tipo de Precificação"
                      onChange={(e) => setPriceConfigType(e.target.value as any)}
                    >
                      <MenuItem value="standard">Padrão</MenuItem>
                      <MenuItem value="batch">Lote</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="price-config-applies-to-label">Aplicar a</InputLabel>
                    <Select
                      labelId="price-config-applies-to-label"
                      value={priceConfigAppliesTo}
                      label="Aplicar a"
                      onChange={(e) => {
                        setPriceConfigAppliesTo(e.target.value as any);
                        setSelectedCategories([]);
                        setSelectedSubcategories([]);
                      }}
                    >
                      <MenuItem value="global">Global</MenuItem>
                      <MenuItem value="categoria">Categoria</MenuItem>
                      <MenuItem value="subcategoria">Subcategoria</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Seleção de Categorias ou Subcategorias */}
              {priceConfigAppliesTo === 'categoria' && (
                <Box sx={{ marginTop: 2 }}>
                  <Typography variant="subtitle1">Selecione as Categorias:</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: 1,
                    }}
                  >
                    {categories.map((categoria) => (
                      <FormControlLabel
                        key={categoria.id}
                        control={
                          <Checkbox
                            checked={selectedCategories.includes(categoria.id)}
                            onChange={(e) => {
                              const updatedSelectedCategories = e.target.checked
                                ? [...selectedCategories, categoria.id]
                                : selectedCategories.filter((id) => id !== categoria.id);
                              setSelectedCategories(updatedSelectedCategories);
                            }}
                          />
                        }
                        label={categoria.name}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              {priceConfigAppliesTo === 'subcategoria' && (
                <Box sx={{ marginTop: 2 }}>
                  <Typography variant="subtitle1">Selecione as Subcategorias:</Typography>
                  {categories.map((categoria) => (
                    <Box key={categoria.id} sx={{ marginLeft: 2, marginTop: 1 }}>
                      <Typography variant="subtitle2">{categoria.name}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: 2 }}>
                        {categoria.subcategories.map((subcategoria) => (
                          <FormControlLabel
                            key={subcategoria.id}
                            control={
                              <Checkbox
                                checked={selectedSubcategories.includes(subcategoria.id)}
                                onChange={(e) => {
                                  const updatedSelectedSubcategories = e.target.checked
                                    ? [...selectedSubcategories, subcategoria.id]
                                    : selectedSubcategories.filter((id) => id !== subcategoria.id);
                                  setSelectedSubcategories(updatedSelectedSubcategories);
                                }}
                              />
                            }
                            label={subcategoria.name}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}

              {priceConfigType === 'standard' && (
                <Box sx={{ marginTop: 2 }}>
                  <TextField
                    label="Preço"
                    fullWidth
                    type="number"
                    value={price !== null ? price : ''}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                  />
                </Box>
              )}

              {priceConfigType === 'batch' && (
                <Box sx={{ marginTop: 2 }}>
                  {/* Tabela de Lotes */}
                  {batchConfigs.length > 0 && (
                    <TableContainer sx={{ overflowX: 'auto' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Nome do Lote</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Data Início</TableCell>
                            <TableCell>Data Fim</TableCell>
                            <TableCell>Preço</TableCell>
                            <TableCell>Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {batchConfigs.map((batch, index) => (
                            <TableRow key={batch.id}>
                              <TableCell>
                                <TextField
                                  placeholder="Ex: Lote 1"
                                  value={batch.name}
                                  onChange={(e) => {
                                    const updatedBatches = [...batchConfigs];
                                    updatedBatches[index].name = e.target.value;
                                    setBatchConfigs(updatedBatches);
                                  }}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={batch.type}
                                  onChange={(e) => {
                                    const updatedBatches = [...batchConfigs];
                                    updatedBatches[index].type = e.target.value as any;
                                    setBatchConfigs(updatedBatches);
                                  }}
                                  fullWidth
                                >
                                  <MenuItem value="temporal">Temporal</MenuItem>
                                  <MenuItem value="quantity">Por Quantidade</MenuItem>
                                </Select>
                              </TableCell>
                              <TableCell>
                                {batch.type === 'temporal' ? (
                                  <TextField
                                    type="date"
                                    value={batch.start_date || ''}
                                    onChange={(e) => {
                                      const updatedBatches = [...batchConfigs];
                                      updatedBatches[index].start_date = e.target.value;
                                      setBatchConfigs(updatedBatches);
                                    }}
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    fullWidth
                                  />
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell>
                                {batch.type === 'temporal' ? (
                                  <TextField
                                    type="date"
                                    value={batch.end_date || ''}
                                    onChange={(e) => {
                                      const updatedBatches = [...batchConfigs];
                                      updatedBatches[index].end_date = e.target.value;
                                      setBatchConfigs(updatedBatches);
                                    }}
                                    InputLabelProps={{
                                      shrink: true,
                                    }}
                                    fullWidth
                                  />
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell>
                                <TextField
                                  type="number"
                                  placeholder="Preço"
                                  value={batch.price || ''}
                                  onChange={(e) => {
                                    const updatedBatches = [...batchConfigs];
                                    updatedBatches[index].price = parseFloat(e.target.value);
                                    setBatchConfigs(updatedBatches);
                                  }}
                                  fullWidth
                                />
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  onClick={() => {
                                    const updatedBatches = batchConfigs.filter((_, i) => i !== index);
                                    setBatchConfigs(updatedBatches);
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                  {/* Botão "Adicionar Nova Linha" abaixo da tabela */}
                  <Button
                    variant="outlined"
                    onClick={() => {
                      const newBatch: Batch = {
                        id: uuidv4(), // Gerando UUID
                        name: '',
                        type: 'temporal',
                        start_date: '',
                        end_date: '',
                        price: 0,
                      };
                      setBatchConfigs([...batchConfigs, newBatch]);
                    }}
                    sx={{
                      marginTop: 2,
                      color: colors.green,
                      borderColor: colors.green,
                      '&:hover': {
                        backgroundColor: colors.grayLight,
                        borderColor: colors.green,
                      },
                    }}
                  >
                    Adicionar Nova Linha
                  </Button>
                </Box>
              )}

              <Button
                variant="contained"
                onClick={handleSavePriceConfig}
                disabled={
                  (priceConfigType === 'standard' &&
                    (price === null || price === undefined)) ||
                  (priceConfigType === 'batch' && batchConfigs.length === 0) ||
                  (priceConfigAppliesTo === 'categoria' && selectedCategories.length === 0) ||
                  (priceConfigAppliesTo === 'subcategoria' && selectedSubcategories.length === 0)
                }
                sx={{
                  backgroundColor: colors.green,
                  color: colors.white,
                  '&:hover': {
                    backgroundColor: '#2F855A',
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
        </>
      )}

      {/* Modal para categoria */}
      <Modal open={opencategoriaModal} onClose={handleClosecategoriaModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 300, sm: 400 },
            bgcolor: colors.white,
            p: 4,
            borderRadius: '8px',
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ color: colors.grayDark, mb: 2 }}>
            {editingcategoriaIndex !== null ? 'Editar Categoria' : 'Adicionar Categoria'}
          </Typography>
          <TextField
            label="Nome da Categoria"
            fullWidth
            required
            value={categoriaName}
            onChange={(e) => setcategoriaName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Descrição da Categoria"
            fullWidth
            value={categoriaDescription}
            onChange={(e) => setcategoriaDescription(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSavecategoria}
            disabled={!categoriaName}
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
      <Modal open={openSubcategoriaModal} onClose={handleCloseSubcategoriaModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 300, sm: 400 },
            bgcolor: colors.white,
            p: 4,
            borderRadius: '8px',
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" sx={{ color: colors.grayDark, mb: 2 }}>
            {editingSubcategoriaIndex !== null
              ? 'Editar Subcategoria'
              : 'Adicionar Subcategoria'}
          </Typography>
          <TextField
            label="Nome da Subcategoria"
            fullWidth
            required
            value={subcategoriaName}
            onChange={(e) => setSubcategoriaName(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <TextField
            label="Descrição da Subcategoria"
            fullWidth
            value={subcategoriaDescription}
            onChange={(e) => setSubcategoriaDescription(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSaveSubcategoria}
            disabled={!subcategoriaName}
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

      {/* Modal para Configuração de Preços */}
      <Modal open={openPriceConfigModal} onClose={handleClosePriceConfigModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: '80%' },
            maxWidth: 1200,
            bgcolor: colors.white,
            p: 4,
            borderRadius: '8px',
            boxShadow: 24,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          <Typography variant="h6" sx={{ color: colors.grayDark, mb: 2 }}>
            {editingPriceConfigIndex !== null
              ? 'Editar Configuração de Valores'
              : 'Adicionar Configuração de Valores'}
          </Typography>
          {/* Removido o campo de Nome da Configuração */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="price-config-type-label">Tipo de Precificação</InputLabel>
                <Select
                  labelId="price-config-type-label"
                  value={priceConfigType}
                  label="Tipo de Precificação"
                  onChange={(e) => setPriceConfigType(e.target.value as any)}
                >
                  <MenuItem value="standard">Padrão</MenuItem>
                  <MenuItem value="batch">Lote</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="price-config-applies-to-label">Aplicar a</InputLabel>
                <Select
                  labelId="price-config-applies-to-label"
                  value={priceConfigAppliesTo}
                  label="Aplicar a"
                  onChange={(e) => {
                    setPriceConfigAppliesTo(e.target.value as any);
                    setSelectedCategories([]);
                    setSelectedSubcategories([]);
                  }}
                >
                  <MenuItem value="global">Global</MenuItem>
                  <MenuItem value="categoria">Categoria</MenuItem>
                  <MenuItem value="subcategoria">Subcategoria</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Seleção de Categorias ou Subcategorias */}
          {priceConfigAppliesTo === 'categoria' && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="subtitle1">Selecione as Categorias:</Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: 1,
                }}
              >
                {categories.map((categoria) => (
                  <FormControlLabel
                    key={categoria.id}
                    control={
                      <Checkbox
                        checked={selectedCategories.includes(categoria.id)}
                        onChange={(e) => {
                          const updatedSelectedCategories = e.target.checked
                            ? [...selectedCategories, categoria.id]
                            : selectedCategories.filter((id) => id !== categoria.id);
                          setSelectedCategories(updatedSelectedCategories);
                        }}
                      />
                    }
                    label={categoria.name}
                  />
                ))}
              </Box>
            </Box>
          )}
          {priceConfigAppliesTo === 'subcategoria' && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="subtitle1">Selecione as Subcategorias:</Typography>
              {categories.map((categoria) => (
                <Box key={categoria.id} sx={{ marginLeft: 2, marginTop: 1 }}>
                  <Typography variant="subtitle2">{categoria.name}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: 2 }}>
                    {categoria.subcategories.map((subcategoria) => (
                      <FormControlLabel
                        key={subcategoria.id}
                        control={
                          <Checkbox
                            checked={selectedSubcategories.includes(subcategoria.id)}
                            onChange={(e) => {
                              const updatedSelectedSubcategories = e.target.checked
                                ? [...selectedSubcategories, subcategoria.id]
                                : selectedSubcategories.filter((id) => id !== subcategoria.id);
                              setSelectedSubcategories(updatedSelectedSubcategories);
                            }}
                          />
                        }
                        label={subcategoria.name}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {priceConfigType === 'standard' && (
            <Box sx={{ marginTop: 2 }}>
              <TextField
                label="Preço"
                fullWidth
                type="number"
                value={price !== null ? price : ''}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
              />
            </Box>
          )}

          {priceConfigType === 'batch' && (
            <Box sx={{ marginTop: 2 }}>
              {/* Tabela de Lotes */}
              {batchConfigs.length > 0 && (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Nome do Lote</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Data Início</TableCell>
                        <TableCell>Data Fim</TableCell>
                        <TableCell>Preço</TableCell>
                        <TableCell>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {batchConfigs.map((batch, index) => (
                        <TableRow key={batch.id}>
                          <TableCell>
                            <TextField
                              placeholder="Ex: Lote 1"
                              value={batch.name}
                              onChange={(e) => {
                                const updatedBatches = [...batchConfigs];
                                updatedBatches[index].name = e.target.value;
                                setBatchConfigs(updatedBatches);
                              }}
                              fullWidth
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={batch.type}
                              onChange={(e) => {
                                const updatedBatches = [...batchConfigs];
                                updatedBatches[index].type = e.target.value as any;
                                setBatchConfigs(updatedBatches);
                              }}
                              fullWidth
                            >
                              <MenuItem value="temporal">Temporal</MenuItem>
                              <MenuItem value="quantity">Por Quantidade</MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {batch.type === 'temporal' ? (
                              <TextField
                                type="date"
                                value={batch.start_date || ''}
                                onChange={(e) => {
                                  const updatedBatches = [...batchConfigs];
                                  updatedBatches[index].start_date = e.target.value;
                                  setBatchConfigs(updatedBatches);
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {batch.type === 'temporal' ? (
                              <TextField
                                type="date"
                                value={batch.end_date || ''}
                                onChange={(e) => {
                                  const updatedBatches = [...batchConfigs];
                                  updatedBatches[index].end_date = e.target.value;
                                  setBatchConfigs(updatedBatches);
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                fullWidth
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              placeholder="Preço"
                              value={batch.price || ''}
                              onChange={(e) => {
                                const updatedBatches = [...batchConfigs];
                                updatedBatches[index].price = parseFloat(e.target.value);
                                setBatchConfigs(updatedBatches);
                              }}
                              fullWidth
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              onClick={() => {
                                const updatedBatches = batchConfigs.filter((_, i) => i !== index);
                                setBatchConfigs(updatedBatches);
                              }}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {/* Botão "Adicionar Nova Linha" abaixo da tabela */}
              <Button
                variant="outlined"
                onClick={() => {
                  const newBatch: Batch = {
                    id: uuidv4(), // Gerando UUID
                    name: '',
                    type: 'temporal',
                    start_date: '',
                    end_date: '',
                    price: 0,
                  };
                  setBatchConfigs([...batchConfigs, newBatch]);
                }}
                sx={{
                  marginTop: 2,
                  color: colors.green,
                  borderColor: colors.green,
                  '&:hover': {
                    backgroundColor: colors.grayLight,
                    borderColor: colors.green,
                  },
                }}
              >
                Adicionar Nova Linha
              </Button>
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleSavePriceConfig}
            disabled={
              (priceConfigType === 'standard' &&
                (price === null || price === undefined)) ||
              (priceConfigType === 'batch' && batchConfigs.length === 0) ||
              (priceConfigAppliesTo === 'categoria' && selectedCategories.length === 0) ||
              (priceConfigAppliesTo === 'subcategoria' && selectedSubcategories.length === 0)
            }
            sx={{
              backgroundColor: colors.green,
              color: colors.white,
              '&:hover': {
                backgroundColor: '#2F855A',
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
    </Box>
  );
};

export default TicketsCard;
