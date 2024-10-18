import axios from 'axios';

const api = axios.create({
  baseURL: 'https://seu-backend.com/api', // Substitua pela URL do seu backend
});

export default api;
