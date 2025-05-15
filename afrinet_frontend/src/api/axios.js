import axios from 'axios';

const baseURL = 'https://afrinet-project.onrender.com'; // change if deployed

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;