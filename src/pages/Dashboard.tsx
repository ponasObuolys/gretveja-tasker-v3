import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, LogOut, LayoutGrid } from 'lucide-react';
import { query, run } from '../lib/db';
import { useAuthStore } from '../stores/authStore';

interface Board {
  id: number;
  title: string;
  created_at: string;
}

export default function Dashboard() {
  const [showNewBoardInput, setShowNewBoardInput] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { data: boards = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const result = await query(
        'SELECT * FROM boards WHERE user_id = ? ORDER BY created_at DESC',
        [user?.id]
      );
      return (result[0]?.values || []) as Board[];
    },
  });

  const createBoard = useMutation({
    mutationFn: async (title: string) => {
      await run(
        'INSERT INTO boards (title, user_id) VALUES (?, ?)',
        [title, user?.id]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setNewBoardTitle('');
      setShowNewBoardInput(false);
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Boards
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => navigate(`/board/${board.id}`)}
              className="aspect-video bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {board.title}
                </h3>
                <LayoutGrid className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}

          {showNewBoardInput ? (
            <div className="aspect-video bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <input
                type="text"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
                placeholder="Enter board title..."
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newBoardTitle.trim()) {
                    createBoard.mutate(newBoardTitle.trim());
                  }
                }}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    if (newBoardTitle.trim()) {
                      createBoard.mutate(newBoardTitle.trim());
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewBoardInput(false)}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewBoardInput(true)}
              className="aspect-video bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Create new board
                </span>
              </div>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}