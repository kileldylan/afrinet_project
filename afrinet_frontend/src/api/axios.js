import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000'; // change if deployed

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;