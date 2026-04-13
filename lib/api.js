import axios from 'axios';

const port = process.env.NEXT_PUBLIC_API_PORT || 5001;
const baseURL =
  typeof window !== 'undefined'
    ? `http://${window.location.hostname}:${port}/api`
    : `http://localhost:${port}/api`;

const api = axios.create({ baseURL });

export default api;
