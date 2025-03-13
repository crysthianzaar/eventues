/**
 * Utilitários para manipulação de localStorage com verificação de disponibilidade no ambiente
 */

/**
 * Verifica se o localStorage está disponível no ambiente atual
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    
    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Salva um item no localStorage com verificação de disponibilidade
 * @param key Chave para armazenamento
 * @param value Valor a ser armazenado
 */
export const setLocalStorageItem = (key: string, value: any): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    window.localStorage.setItem(key, serializedValue);
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
  }
};

/**
 * Recupera um item do localStorage com verificação de disponibilidade
 * @param key Chave do item a ser recuperado
 * @param defaultValue Valor padrão caso o item não exista
 */
export const getLocalStorageItem = <T>(key: string, defaultValue: T): T => {
  if (!isLocalStorageAvailable()) return defaultValue;
  
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) return defaultValue;
    
    try {
      return JSON.parse(item) as T;
    } catch {
      // Se não for um JSON válido, retorna o valor como string
      return item as unknown as T;
    }
  } catch (e) {
    console.error('Erro ao recuperar do localStorage:', e);
    return defaultValue;
  }
};

/**
 * Remove um item do localStorage com verificação de disponibilidade
 * @param key Chave do item a ser removido
 */
export const removeLocalStorageItem = (key: string): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    console.error('Erro ao remover do localStorage:', e);
  }
};

/**
 * Limpa todos os itens do localStorage com verificação de disponibilidade
 */
export const clearLocalStorage = (): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    window.localStorage.clear();
  } catch (e) {
    console.error('Erro ao limpar o localStorage:', e);
  }
};
