import axios from 'axios';

let API_URL;
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Force production to use relative /api route (ignoring any errant Vercel env variables)
    API_URL = `${window.location.origin}/api`;
} else {
    // Local dev fallback
    API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
}

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
    guestSubmit: (responses, groupId, guestName) => api.post('/quiz/guest-submit', { responses, group_id: groupId, guest_name: guestName }),
    getStatus: () => api.get('/quiz/status'),
    retake: () => api.post('/quiz/retake')
};

// Group API
export const groupAPI = {
    create: (data) => api.post('/groups/create', data),
    join: (groupId) => api.post(`/groups/${groupId}/join`),
    joinByCode: (inviteCode) => api.post('/groups/join-by-code', { invite_code: inviteCode }),
    getStatus: (groupId) => api.get(`/groups/${groupId}/status`),
    updateWeights: (groupId, weights) => api.put(`/groups/${groupId}/weights`, { weights })
};

// Profile API
export const profileAPI = {
    getMyProfile: () => api.get('/profile/me'),
    getGroupReport: () => api.get('/profile/group-report'),
    mergeProfiles: () => api.post('/profile/merge'),
    togglePersonalization: (personalization_on) =>
        api.put('/profile/toggle', { personalization_on }),
    addToCart: (productId) => api.post('/profile/cart', { productId }),
    removeFromCart: (productId) => api.delete(`/profile/cart/${productId}`),
    addToWishlist: (productId, folder) => api.post('/profile/wishlist', { productId, folder }),
    removeFromWishlist: (productId) => api.delete(`/profile/wishlist/${productId}`),
    addAddress: (data) => api.post('/profile/address', data),
    deleteAddress: (id) => api.delete(`/profile/address/${id}`),
    saveCard: (data) => api.post('/profile/saved-card', data),
    saveUpi: (data) => api.post('/profile/saved-upi', data),
    addMoney: (amount) => api.post('/profile/wallet/add', { amount })
};

// Moodboard API
export const moodboardAPI = {
    generate: (mode = 'personal') => api.get('/moodboard/generate', { params: { mode } }),
    regenerate: (pool) => api.post('/moodboard/regenerate', { pool })
};

// Products API
export const productsAPI = {
    getFeed: (feedMode = 'personal', page = 1, limit = 12) => 
        api.get('/products', { params: { feed_mode: feedMode, page, limit } }),
    getProduct: (id) => api.get(`/products/${id}`),
    search: (params) => {
        const { page = 1, limit = 12, ...rest } = params;
        return api.get('/products/search', { params: { ...rest, page, limit } });
    },
    getCategories: () => api.get('/products/categories'),
    getFilterOptions: () => api.get('/products/filters')
};

// Orders API
export const ordersAPI = {
    createOrder: (orderData) => api.post('/orders', orderData),
    getUserOrders: () => api.get('/orders'),
    checkQrStatus: (orderId) => api.get(`/orders/${orderId}/qr-status`)
};

export default api;
