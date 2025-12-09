// src/utils/config.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  USERS: `${API_BASE_URL}/api/users`,
  DOCUMENTOS: `${API_BASE_URL}/api/documentos`,
  BUSCAR_AVANZADO: `${API_BASE_URL}/api/users/buscar-avanzado`,
};

// Color palette for group badges
export const GROUP_BADGE_COLORS = [
  '#8B4513', // SaddleBrown
  '#CD853F', // Peru
  '#DEB887', // BurlyWood
  '#D2691E', // Chocolate
  '#A0522D', // Sienna
  '#BC8F8F'  // RosyBrown
];

export default API_ENDPOINTS;
