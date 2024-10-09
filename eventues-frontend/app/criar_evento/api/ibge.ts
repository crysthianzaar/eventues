import axios from 'axios';

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

export interface Cidade {
  id: number;
  nome: string;
}

export const fetchEstados = async (): Promise<Estado[]> => {
  try {
    const response = await axios.get<Estado[]>(
      'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar estados:', error);
    throw error;
  }
};

export const fetchCidades = async (estadoSigla: string): Promise<Cidade[]> => {
  try {
    const response = await axios.get<Cidade[]>(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSigla}/municipios`
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao carregar cidades:', error);
    throw error;
  }
};
