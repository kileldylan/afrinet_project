import axios from 'axios';

const baseURL =
  import.meta.env.MODE === 'development'
    ? 'http://127.0.0.1:8000' // Local Django server
    : 'https://afrinet-project.onrender.com'; // Deployed URL

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
