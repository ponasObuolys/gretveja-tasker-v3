import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Card, CardData } from './Card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { run } from '../lib/db';

interface ListProps {
  id: number;
  title: string;
  cards: CardData[];
  isDragging?: boolean;
}

export function List({ id, title, cards, isDragging }: ListProps) {
  const [showNewCardInput, setShowNewCardInput] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const queryClient = useQueryClient();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: `list-${id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const createCard = useMutation({
    mutationFn: async (title: string) => {
      const position = cards.length;
      await run(
        'INSERT INTO cards (title, list_id, position) VALUES (?, ?, ?)',
        [title, id, position]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setNewCardTitle('');
      setShowNewCardInput(false);
    },
  });

  const opacity = isDragging || isSortableDragging ? 0.5 : 1;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, opacity }}
      className="w-72 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg"
    >
      <div
        className="p-3 flex items-center justify-between cursor-grab"
        {...attributes}
        {...listeners}
      >
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
          <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="px-3 pb-3 space-y-2">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}

        {showNewCardInput ? (
          <div>
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter a title for this card..."
              className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 resize-none"
              rows={3}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && newCardTitle.trim()) {
                  e.preventDefault();
                  createCard.mutate(newCardTitle.trim());
                }
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  if (newCardTitle.trim()) {
                    createCard.mutate(newCardTitle.trim());
                  }
                }}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Card
              </button>
              <button
                onClick={() => setShowNewCardInput(false)}
                className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewCardInput(true)}
            className="flex items-center gap-2 w-full p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <Plus className="w-4 h-4" />
            <span>Add a card</span>
          </button>
        )}
      </div>
    </div>
  );
}