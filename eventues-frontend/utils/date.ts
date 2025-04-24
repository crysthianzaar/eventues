// Função para formatar datas em formato brasileiro (dia de mês de ano)
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Usando Intl API para garantir que a data está em português brasileiro
  const day = date.getDate();
  const month = date.toLocaleString('pt-BR', { month: 'long' });
  const year = date.getFullYear();
  
  return `${day} de ${month} de ${year}`;
};
