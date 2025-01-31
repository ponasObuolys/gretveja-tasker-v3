import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { createUser } from '../lib/auth';
import { useAuthStore } from '../stores/authStore';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function Register() {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<RegisterForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsSubmitting(true);

      // Create user and get the user data back
      const user = await createUser(data.email, data.password, data.name);
      
      // Get token from localStorage (it was stored during createUser)
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication failed');
      }
      
      // Set auth state
      setAuth({ 
        id: user.id, 
        email: user.email, 
        name: user.name 
      }, token);
      
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message === 'User already exists') {
          setError('email', {
            type: 'manual',
            message: 'This email is already registered'
          });
        } else {
          setError('root', {
            type: 'manual',
            message: 'Registration failed. Please try again.'
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-8">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Create your account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {errors.root && (
            <div className="p-3 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
              {errors.root.message}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name', { 
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register('password', { 
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}