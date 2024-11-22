import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/', // URL de tu backend
});

export default api;