import { api } from './api';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  try {
    const response = await api.post<AuthResponse>('/auth/register', {
      email,
      password,
      name
    });
    
    // Store the token
    localStorage.setItem('token', response.data.token);
    
    return response.data.user;
  } catch (error: any) {
    console.error('Error in createUser:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password
    });
    
    // Store the token
    localStorage.setItem('token', response.data.token);
    
    return response.data.user;
  } catch (error: any) {
    console.error('Error in login:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

export function logout() {
  localStorage.removeItem('token');
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}