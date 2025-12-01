// src/utils/config.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  USERS: `${API_BASE_URL}/api/users`,
  DOCUMENTOS: `${API_BASE_URL}/api/documentos`,
  BUSCAR_AVANZADO: `${API_BASE_URL}/api/users/buscar-avanzado`,
};

export default API_ENDPOINTS;
