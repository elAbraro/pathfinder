import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';
const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {}
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('API: No token found in localStorage');
        }
        // Debug URL
        console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => Promise.reject(error)
);

export const authAPI = {
    register: (userData) => api.post('/students/register', userData),
    login: (credentials) => api.post('/students/login', credentials),
    getProfile: () => api.get('/students/profile'),
    updateProfile: (data) => api.put('/students/profile', data),
    logInteraction: (data) => api.post('/students/interaction', data),
    getAnalytics: () => api.get('/students/analytics')
};

export const universityAPI = {
    search: (params) => api.get('/universities', { params }),
    getById: (id) => api.get(`/universities/${id}`),
    getFitScore: (id) => api.get(`/universities/${id}/fit-score`),
    searchWithFitScore: (params) => api.get('/universities/search/with-fit-scores', { params })
};

export const shortlistAPI = {
    add: (universityId, data) => api.post(`/students/shortlist/${universityId}`, data),
    remove: (universityId) => api.delete(`/students/shortlist/${universityId}`),
    updateStatus: (universityId, data) => api.put(`/students/shortlist/${universityId}/status`, data),
    updateTimeline: (universityId, data) => api.put(`/students/shortlist/${universityId}/timeline`, data),
    updateChecklist: (universityId, data) => api.put(`/students/shortlist/${universityId}/checklist`, data)
};

export const resourceAPI = {
    getAll: (params) => api.get('/resources', { params }),
    create: (data) => api.post('/resources', data),
    delete: (id) => api.delete(`/resources/${id}`)
};

export const aiAPI = {
    brainstorm: (data) => api.post('/ai/brainstorm', data)
};

export const scholarshipAPI = {
    getAll: (params) => api.get('/scholarships', { params }),
    getMatch: () => api.get('/scholarships/match'),
    create: (data) => api.post('/scholarships', data)
};

export const commentsAPI = {
    get: (uniId) => api.get(`/comments/${uniId}`),
    create: (data) => api.post('/comments', data)
};

export const collaborationAPI = {
    getMessages: (withUserId) => api.get(`/collaboration/messages/${withUserId}`),
    sendMessage: (data) => api.post('/collaboration/messages', data),
    getChats: () => api.get('/collaboration/chats'),
    invite: (data) => api.post('/collaboration/collaborate', data),
    searchUsers: (query) => api.get(`/collaboration/users/search?q=${query}`),
    getUniversityMessages: (uniId) => api.get(`/collaboration/university/${uniId}`),
    sendUniversityMessage: (uniId, data) => api.post(`/collaboration/university/${uniId}`, data)
};

export const consultationAPI = {
    getSessions: () => api.get('/consultations'),
    bookSession: (data) => api.post('/consultations', data), // data now includes paymentMethod, etc.
    cancelSession: (id) => api.put(`/consultations/${id}/cancel`)
};

export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    runPipeline: () => api.post('/admin/run-pipeline'),
    getUsers: () => api.get('/admin/users'),
    deleteUser: (id) => api.delete(`/admin/user/${id}`)
};

export default api;
