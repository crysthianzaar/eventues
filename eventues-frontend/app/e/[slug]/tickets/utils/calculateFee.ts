export const calculatePlatformFee = (price: number): number => {
  if (price === 0) return 0; // Gratuito
  if (price < 20) return 2; // Taxa mínima
  return Number(((price * 7.99) / 100).toFixed(2)); // 7.99% com 2 casas decimais
};
