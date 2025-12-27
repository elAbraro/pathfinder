import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to attach the token
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

export const authAPI = {
    register: (userData) => api.post('/students/register', userData),
    login: (credentials) => api.post('/students/login', credentials),
    getProfile: () => api.get('/students/profile'),
    updateProfile: (data) => api.put('/students/profile', data)
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
    create: (data) => api.post('/resources', data)
};

export const aiAPI = {
    brainstorm: (data) => api.post('/ai/brainstorm', data)
};

export const scholarshipAPI = {
    getAll: (params) => api.get('/scholarships', { params }),
    create: (data) => api.post('/scholarships', data)
};

export const commentsAPI = {
    get: (uniId) => api.get(`/comments/${uniId}`),
    create: (data) => api.post('/comments', data)
};

export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    runPipeline: () => api.post('/admin/run-pipeline')
};

export default api;
