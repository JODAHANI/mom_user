import axios from 'axios';

const apiURL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://mom-store-server-production.up.railway.app';
const api = axios.create({ baseURL: `${apiURL}/api` });

export default api;
