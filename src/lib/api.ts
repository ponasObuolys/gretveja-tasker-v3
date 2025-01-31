import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    // @ts-ignore
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (email: string, password: string, name: string) =>
  api.post('/auth/register', { email, password, name });

// Boards API
export const getBoards = () => api.get('/boards');

export const getBoard = (id: number) => api.get(`/boards/${id}`);

export const createBoard = (title: string) => api.post('/boards', { title });

export const updateBoard = (id: number, title: string) =>
  api.put(`/boards/${id}`, { title });

export const deleteBoard = (id: number) => api.delete(`/boards/${id}`);

// Lists API
export const getLists = (boardId: number) => api.get(`/lists/board/${boardId}`);

export const createList = (title: string, boardId: number, position: number) =>
  api.post('/lists', { title, boardId, position });

export const updateList = (id: number, title: string, position: number) =>
  api.put(`/lists/${id}`, { title, position });

export const deleteList = (id: number) => api.delete(`/lists/${id}`);

// Cards API
export const getCards = (listId: number) => api.get(`/cards/list/${listId}`);

export const createCard = (
  title: string,
  description: string,
  listId: number,
  position: number,
  dueDate?: Date,
  priority?: 'low' | 'medium' | 'high'
) =>
  api.post('/cards', {
    title,
    description,
    listId,
    position,
    dueDate,
    priority,
  });

export const updateCard = (
  id: number,
  title: string,
  description: string,
  listId: number,
  position: number,
  dueDate?: Date,
  priority?: 'low' | 'medium' | 'high'
) =>
  api.put(`/cards/${id}`, {
    title,
    description,
    listId,
    position,
    dueDate,
    priority,
  });

export const deleteCard = (id: number) => api.delete(`/cards/${id}`);

export const assignUserToCard = (cardId: number, assignedUserId: number) =>
  api.post(`/cards/${cardId}/assign`, { assignedUserId });

export const removeUserFromCard = (cardId: number, userId: number) =>
  api.delete(`/cards/${cardId}/assign/${userId}`); 