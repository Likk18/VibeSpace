import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me')
};

// Quiz API
export const quizAPI = {
    getQuestions: () => api.get('/quiz/questions'),
    submitQuiz: (responses) => api.post('/quiz/submit', { responses }),
    getStatus: () => api.get('/quiz/status')
};

// Group API
export const groupAPI = {
    create: (data) => api.post('/groups/create', data),
    join: (groupId) => api.post(`/groups/${groupId}/join`),
    getStatus: (groupId) => api.get(`/groups/${groupId}/status`)
};

// Profile API
export const profileAPI = {
    getMyProfile: () => api.get('/profile/me'),
    mergeProfiles: () => api.post('/profile/merge'),
    togglePersonalization: (personalization_on) =>
        api.put('/profile/toggle', { personalization_on }),
    addToCart: (productId) => api.post('/profile/cart', { productId }),
    removeFromCart: (productId) => api.delete(`/profile/cart/${productId}`),
    addToWishlist: (productId, folder) => api.post('/profile/wishlist', { productId, folder }),
    removeFromWishlist: (productId) => api.delete(`/profile/wishlist/${productId}`),
};

// Moodboard API
export const moodboardAPI = {
    generate: () => api.get('/moodboard/generate'),
    regenerate: (pool) => api.post('/moodboard/regenerate', { pool })
};

// Products API
export const productsAPI = {
    getFeed: () => api.get('/products'),
    getProduct: (id) => api.get(`/products/${id}`),
    search: (params) => api.get('/products/search', { params }),
    getCategories: () => api.get('/products/categories')
};

export default api;
