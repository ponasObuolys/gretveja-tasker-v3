import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export interface CardData {
  id: number;
  title: string;
  description: string | null;
  list_id: number;
  position: number;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
}

interface CardProps {
  card: CardData;
  isDragging?: boolean;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function Card({ card, isDragging }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const opacity = isDragging || isSortableDragging ? 0.5 : 1;

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, opacity }}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm cursor-grab hover:bg-gray-50 dark:hover:bg-gray-600"
    >
      <h4 className="text-gray-900 dark:text-white font-medium mb-2">
        {card.title}
      </h4>
      
      <div className="flex items-center gap-2 text-sm">
        {card.due_date && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(card.due_date), 'MMM d')}</span>
          </div>
        )}
        
        {card.priority && (
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              priorityColors[card.priority]
            }`}
          >
            {card.priority}
          </span>
        )}
        
        {card.description && (
          <AlertCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    </div>
  );
}