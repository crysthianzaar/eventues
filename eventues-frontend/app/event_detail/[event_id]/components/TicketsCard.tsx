// components/OrganizatorEventDetails/TicketsCard.tsx
"use client";

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
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/system';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Define your color palette
const colors = {
  primary: '#5A67D8',
  green: '#4778ff',
  grayDark: '#2D3748',
  grayLight: '#F7FAFC',
  white: '#FFFFFF',
  categoriaBg: '#E2E8F0', // Light gray for categories
  priceConfigBg: '#E2E8F0', // Light green for price configurations
};

// Interfaces
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

interface Subcategory {
  id: string;
  name: string;
  description?: string;
  category_id?: string; // Added to map the category
}

interface Category {
  id: string;
  name: string;
  description?: string;
  subcategories: Subcategory[];
}

interface PriceConfiguration {
  id: string;
  name: string;
  type: 'standard' | 'batch';
  applies_to: 'global' | 'category' | 'subcategory';
  categories?: string[];
  subcategories?: string[];
  price?: number;
  batch_configs?: Batch[];
}

interface TicketsCardProps {
  eventId: string;
  onNotify: (
    message: string,
    severity: 'success' | 'error' | 'info' | 'warning'
  ) => void;
  onUpdate: () => void;
}

const TicketsCard: React.FC<TicketsCardProps> = ({
  eventId,
  onNotify,
  onUpdate,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceConfigurations, setPriceConfigurations] = useState<
    PriceConfiguration[]
  >([]);

  // States for feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // States for loading and error during data fetching
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const theme = useTheme();

  // State variables for Category
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<
    number | null
  >(null);

  // State variables for Subcategory
  const [openSubcategoryModal, setOpenSubcategoryModal] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<
    number | null
  >(null);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategoryDescription, setSubcategoryDescription] = useState('');
  const [editingSubcategoryIndex, setEditingSubcategoryIndex] = useState<
    number | null
  >(null);

  // State variables for Price Configurations
  const [openPriceConfigModal, setOpenPriceConfigModal] = useState(false);
  const [editingPriceConfigIndex, setEditingPriceConfigIndex] = useState<
    number | null
  >(null);
  const [priceConfigType, setPriceConfigType] = useState<
    'standard' | 'batch'
  >('standard');
  const [priceConfigAppliesTo, setPriceConfigAppliesTo] = useState<
    'global' | 'category' | 'subcategory'
  >('global');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<
    string[]
  >([]);
  const [price, setPrice] = useState<number | null>(null);
  const [batchConfigs, setBatchConfigs] = useState<Batch[]>([]);

  // Styled components
  const SectionHeader = styled(Typography)(({ theme }) => ({
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(1),
    },
  }));

  // Functions for Category management
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
    const categoryIdToDelete = categories[index].id;
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    // Remove category IDs from price configurations
    const updatedPriceConfigs = priceConfigurations.map((config) => {
      if (config.applies_to === 'category' && config.categories) {
        return {
          ...config,
          categories: config.categories.filter(
            (id) => id !== categoryIdToDelete
          ),
        };
      }
      return config;
    });
    setPriceConfigurations(updatedPriceConfigs);
  };

  const handleCloseCategoryModal = () => {
    setOpenCategoryModal(false);
    setCategoryName('');
    setCategoryDescription('');
    setEditingCategoryIndex(null);
  };

  const handleSaveCategory = () => {
    const newCategory: Category = {
      id:
        editingCategoryIndex !== null
          ? categories[editingCategoryIndex].id
          : uuidv4(),
      name: categoryName,
      description: categoryDescription,
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

  // Functions for Subcategory management
  const handleAddSubcategory = (index: number) => {
    setCurrentCategoryIndex(index);
    setOpenSubcategoryModal(true);
  };

  const handleEditSubcategory = (
    categoryIndex: number,
    subcategoryIndex: number
  ) => {
    const subcategoryToEdit =
      categories[categoryIndex].subcategories[subcategoryIndex];
    setSubcategoryName(subcategoryToEdit.name);
    setSubcategoryDescription(subcategoryToEdit.description || '');
    setCurrentCategoryIndex(categoryIndex);
    setEditingSubcategoryIndex(subcategoryIndex);
    setOpenSubcategoryModal(true);
  };

  const handleDeleteSubcategory = (
    categoryIndex: number,
    subcategoryIndex: number
  ) => {
    const subcategoryIdToDelete =
      categories[categoryIndex].subcategories[subcategoryIndex]?.id;
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].subcategories = updatedCategories[
      categoryIndex
    ].subcategories.filter((_, i) => i !== subcategoryIndex);
    setCategories(updatedCategories);
    // Remove subcategory IDs from price configurations
    const updatedPriceConfigs = priceConfigurations.map((config) => {
      if (config.applies_to === 'subcategory' && config.subcategories) {
        return {
          ...config,
          subcategories: config.subcategories.filter(
            (id) => id !== subcategoryIdToDelete
          ),
        };
      }
      return config;
    });
    setPriceConfigurations(updatedPriceConfigs);
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
      const existingSubcategory =
        editingSubcategoryIndex !== null
          ? categories[currentCategoryIndex].subcategories[
              editingSubcategoryIndex
            ]
          : null;

      const newSubcategory: Subcategory = {
        id: existingSubcategory ? existingSubcategory.id : uuidv4(),
        name: subcategoryName,
        description: subcategoryDescription,
        category_id: categories[currentCategoryIndex].id,
      };

      const updatedCategories = [...categories];
      if (editingSubcategoryIndex !== null) {
        updatedCategories[currentCategoryIndex].subcategories[
          editingSubcategoryIndex
        ] = newSubcategory;
      } else {
        updatedCategories[currentCategoryIndex].subcategories.push(
          newSubcategory
        );
      }
      setCategories(updatedCategories);
      handleCloseSubcategoryModal();
    }
  };

  // Functions for Price Configuration management
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
        : config.applies_to === 'category'
        ? 'Categoria'
        : 'Subcategoria';
    if (config.type === 'standard' && config.price !== undefined) {
      return `${typeLabel} - ${appliesToLabel} - R$${config.price.toFixed(2)}`;
    }
    return `${typeLabel} - ${appliesToLabel}`;
  };

  const handleSavePriceConfig = () => {
    const newConfig: PriceConfiguration = {
      id:
        editingPriceConfigIndex !== null
          ? priceConfigurations[editingPriceConfigIndex].id
          : uuidv4(),
      name: '',
      type: priceConfigType,
      applies_to: priceConfigAppliesTo,
      categories:
        priceConfigAppliesTo === 'category' ? selectedCategories : undefined,
      subcategories:
        priceConfigAppliesTo === 'subcategory'
          ? selectedSubcategories
          : undefined,
      price:
        priceConfigType === 'standard'
          ? price !== null
            ? price
            : undefined
          : undefined,
      batch_configs:
        priceConfigType === 'batch' ? batchConfigs : undefined,
    };

    // Generate the name based on the configuration
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

  // Function to determine the effective price
  const getEffectivePrice = (
    subcategory: Subcategory,
    category: Category
  ): number | null => {
    // 1. Check for active batches starting from the most specific level
    // a) Batches at the subcategory level
    for (const config of priceConfigurations.filter(
      (pc) => pc.type === 'batch'
    )) {
      if (
        config.applies_to === 'subcategory' &&
        config.subcategories?.includes(subcategory.id)
      ) {
        for (const batch of config.batch_configs || []) {
          if (isBatchActive(batch)) {
            return batch.price;
          }
        }
      }
    }

    // b) Batches at the category level
    for (const config of priceConfigurations.filter(
      (pc) => pc.type === 'batch'
    )) {
      if (
        config.applies_to === 'category' &&
        config.categories?.includes(category.id)
      ) {
        for (const batch of config.batch_configs || []) {
          if (isBatchActive(batch)) {
            return batch.price;
          }
        }
      }
    }

    // c) Global batches
    for (const config of priceConfigurations.filter(
      (pc) => pc.type === 'batch'
    )) {
      if (config.applies_to === 'global') {
        for (const batch of config.batch_configs || []) {
          if (isBatchActive(batch)) {
            return batch.price;
          }
        }
      }
    }

    // 2. No active batches found, check fixed prices starting from the most specific level
    // a) Subcategory price
    for (const config of priceConfigurations.filter(
      (pc) => pc.type === 'standard'
    )) {
      if (
        config.applies_to === 'subcategory' &&
        config.subcategories?.includes(subcategory.id) &&
        config.price !== undefined
      ) {
        return config.price;
      }
    }

    // b) Category price
    for (const config of priceConfigurations.filter(
      (pc) => pc.type === 'standard'
    )) {
      if (
        config.applies_to === 'category' &&
        config.categories?.includes(category.id) &&
        config.price !== undefined
      ) {
        return config.price;
      }
    }

    // c) Global price
    const globalConfig = priceConfigurations.find(
      (pc) =>
        pc.type === 'standard' &&
        pc.applies_to === 'global' &&
        pc.price !== undefined
    );
    if (globalConfig) {
      return globalConfig.price!;
    }

    // Price not defined
    return null;
  };

  const isBatchActive = (batch: Batch): boolean => {
    const currentDate = new Date();
    if (batch.type === 'temporal') {
      const startDate = new Date(batch.start_date || '');
      const endDate = new Date(batch.end_date || '');
      return currentDate >= startDate && currentDate <= endDate;
    } else if (batch.type === 'quantity') {
      // Placeholder logic for quantity batches
      return false;
    }
    return false;
  };

  const getConfigTypeLabel = (type: string) => {
    if (type === 'standard') return 'Padrão';
    if (type === 'batch') return 'Lote';
    return '';
  };

  // useEffect to add a default batch when 'batch' is selected
  useEffect(() => {
    if (priceConfigType === 'batch' && batchConfigs.length === 0) {
      const defaultBatch: Batch = {
        id: uuidv4(),
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

  // useEffect to fetch existing data when the component mounts
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

          // Assuming the response has 'categories' and 'price_configurations'
          const typedData = data as {
            categories: Category[];
            price_configurations: PriceConfiguration[];
          };
          setCategories(typedData.categories || []);
          setPriceConfigurations(typedData.price_configurations || []);
        } else {
          setFetchError(`Erro ao buscar dados: ${response.statusText}`);
        }
      } catch (error: any) {
        setFetchError(
          error.message || 'Ocorreu um erro ao buscar os dados.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  // Function to consolidate and send data
  const handleSaveAll = async () => {
    setIsSaving(true);

    // Reset previous errors
    setSaveError(null);

    // Basic validation
    for (const cat of categories) {
      if (cat.subcategories.length === 0) {
        const errorMsg = `A categoria "${cat.name}" deve ter pelo menos uma subcategoria.`;
        setSaveError(errorMsg);
        onNotify(errorMsg, 'error');
        setIsSaving(false);
        return;
      }
    }

    for (const config of priceConfigurations) {
      if (config.type === 'standard' && (config.price ?? 0) <= 0) {
        const errorMsg = `A configuração "${config.name}" deve ter um preço válido.`;
        setSaveError(errorMsg);
        onNotify(errorMsg, 'error');
        setIsSaving(false);
        return;
      }

      if (config.type === 'batch') {
        if (!config.batch_configs || config.batch_configs.length === 0) {
          const errorMsg = `A configuração "${config.name}" deve ter pelo menos um lote.`;
          setSaveError(errorMsg);
          onNotify(errorMsg, 'error');
          setIsSaving(false);
          return;
        }

        for (const batch of config.batch_configs) {
          if (!batch.name) {
            const errorMsg = `Todos os lotes na configuração "${config.name}" devem ter um nome.`;
            setSaveError(errorMsg);
            onNotify(errorMsg, 'error');
            setIsSaving(false);
            return;
          }
          if (batch.price === null || batch.price <= 0) {
            const errorMsg = `Todos os lotes na configuração "${config.name}" devem ter um preço válido.`;
            setSaveError(errorMsg);
            onNotify(errorMsg, 'error');
            setIsSaving(false);
            return;
          }
          if (batch.type === 'temporal') {
            if (!batch.start_date || !batch.end_date) {
              const errorMsg = `Todos os lotes temporais na configuração "${config.name}" devem ter datas de início e fim.`;
              setSaveError(errorMsg);
              onNotify(errorMsg, 'error');
              setIsSaving(false);
              return;
            }
            const start = new Date(batch.start_date);
            const end = new Date(batch.end_date);
            if (start >= end) {
              const errorMsg = `A data de início do lote "${batch.name}" deve ser anterior à data de fim.`;
              setSaveError(errorMsg);
              onNotify(errorMsg, 'error');
              setIsSaving(false);
              return;
            }
          }
          // Add more validations as needed
        }
      }
    }

    // Structuring data according to interfaces and backend requirements
    const dataToSend = {
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        subcategories: cat.subcategories.map((subcat) => ({
          id: subcat.id,
          name: subcat.name,
          description: subcat.description,
          category_id: cat.id,
        })),
      })),
      price_configurations: priceConfigurations.map((config) => ({
        id: config.id,
        name: config.name,
        type: config.type,
        applies_to: config.applies_to,
        categories:
          config.applies_to === 'category' ? config.categories : undefined,
        subcategories:
          config.applies_to === 'subcategory'
            ? config.subcategories
            : undefined,
        price: config.type === 'standard' ? config.price : undefined,
        batch_configs:
          config.type === 'batch'
            ? config.batch_configs?.map((batch) => ({
                id: batch.id,
                name: batch.name,
                type: batch.type,
                start_date:
                  batch.type === 'temporal' ? batch.start_date : undefined,
                end_date:
                  batch.type === 'temporal' ? batch.end_date : undefined,
                start_quantity:
                  batch.type === 'quantity' ? batch.start_quantity : undefined,
                end_quantity:
                  batch.type === 'quantity' ? batch.end_quantity : undefined,
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
        onNotify('Categorias e valores salvos com sucesso!', 'success');
        onUpdate();
      } else {
        const errorMsg = `Erro: ${response.statusText}`;
        setSaveError(errorMsg);
        onNotify(errorMsg, 'error');
      }
    } catch (error: any) {
      const errorMsg =
        error.message || 'Ocorreu um erro ao salvar os dados.';
      setSaveError(errorMsg);
      onNotify(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // The rest of your component's JSX and modals go here...

  return (
    <Box
      sx={{
        padding: { xs: '20px', md: '40px' },
        maxWidth: { xs: '100%', md: '1400px' },
        borderRadius: '12px',
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <SectionHeader variant="h6">
          Gerenciamento de Categorias e Valores
        </SectionHeader>
      </Box>

      {/* Loading Indicator or Error */}
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
          {/* Your component's main content goes here, including buttons, tables, modals, etc. */}
          {/* ... */}
        </>
      )}
    </Box>
  );
};

export default TicketsCard;
