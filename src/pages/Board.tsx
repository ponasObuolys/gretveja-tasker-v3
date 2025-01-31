import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreVertical } from 'lucide-react';
import { query, run } from '../lib/db';
import { List } from '../components/List';
import { Card } from '../components/Card';
import { useAuthStore } from '../stores/authStore';

interface BoardData {
  id: number;
  title: string;
  user_id: number;
}

interface ListData {
  id: number;
  title: string;
  board_id: number;
  position: number;
}

interface CardData {
  id: number;
  title: string;
  description: string | null;
  list_id: number;
  position: number;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
}

export default function Board() {
  const { id: boardId } = useParams();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newListTitle, setNewListTitle] = useState('');
  const [showNewListInput, setShowNewListInput] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const { data: board } = useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      const result = await query(
        'SELECT * FROM boards WHERE id = ? AND user_id = ?',
        [boardId, user?.id]
      );
      return result[0].values[0] as BoardData;
    },
  });

  const { data: lists = [] } = useQuery({
    queryKey: ['lists', boardId],
    queryFn: async () => {
      const result = await query(
        'SELECT * FROM lists WHERE board_id = ? ORDER BY position',
        [boardId]
      );
      return result[0].values as ListData[];
    },
  });

  const { data: cards = [] } = useQuery({
    queryKey: ['cards', boardId],
    queryFn: async () => {
      const result = await query(
        `SELECT * FROM cards 
         WHERE list_id IN (
           SELECT id FROM lists WHERE board_id = ?
         )
         ORDER BY position`,
        [boardId]
      );
      return result[0].values as CardData[];
    },
  });

  const createList = useMutation({
    mutationFn: async (title: string) => {
      const position = lists.length;
      await run(
        'INSERT INTO lists (title, board_id, position) VALUES (?, ?, ?)',
        [title, boardId, position]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
      setNewListTitle('');
      setShowNewListInput(false);
    },
  });

  const updateListPosition = useMutation({
    mutationFn: async ({ listId, newPosition }: { listId: number; newPosition: number }) => {
      await run(
        'UPDATE lists SET position = ? WHERE id = ?',
        [newPosition, listId]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lists', boardId] });
    },
  });

  const updateCardPosition = useMutation({
    mutationFn: async ({
      cardId,
      listId,
      position,
    }: {
      cardId: number;
      listId: number;
      position: number;
    }) => {
      await run(
        'UPDATE cards SET list_id = ?, position = ? WHERE id = ?',
        [listId, position, cardId]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards', boardId] });
    },
  });

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) return;

    if (active.id !== over.id) {
      const isList = active.id.toString().startsWith('list-');
      
      if (isList) {
        const oldIndex = lists.findIndex(
          (list) => `list-${list.id}` === active.id
        );
        const newIndex = lists.findIndex(
          (list) => `list-${list.id}` === over.id
        );

        const newLists = arrayMove(lists, oldIndex, newIndex);
        newLists.forEach((list, index) => {
          updateListPosition.mutate({
            listId: list.id,
            newPosition: index,
          });
        });
      } else {
        const activeListId = parseInt(active.id.toString().split('-')[1]);
        const overListId = parseInt(over.id.toString().split('-')[1]);
        
        const activeCards = cards.filter((card) => card.list_id === activeListId);
        const overCards = cards.filter((card) => card.list_id === overListId);
        
        const oldIndex = activeCards.findIndex((card) => card.id === parseInt(active.id.toString()));
        const newIndex = overCards.length;

        updateCardPosition.mutate({
          cardId: parseInt(active.id.toString()),
          listId: overListId,
          position: newIndex,
        });
      }
    }

    setActiveId(null);
  }

  if (!board) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {board.title}
        </h1>
        <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
          <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <SortableContext
            items={lists.map((list) => `list-${list.id}`)}
            strategy={horizontalListSortingStrategy}
          >
            {lists.map((list) => (
              <List
                key={list.id}
                id={list.id}
                title={list.title}
                cards={cards.filter((card) => card.list_id === list.id)}
              />
            ))}
          </SortableContext>

          {showNewListInput ? (
            <div className="w-72 shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
              <input
                type="text"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title..."
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newListTitle.trim()) {
                    createList.mutate(newListTitle.trim());
                  }
                }}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    if (newListTitle.trim()) {
                      createList.mutate(newListTitle.trim());
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add List
                </button>
                <button
                  onClick={() => setShowNewListInput(false)}
                  className="px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewListInput(true)}
              className="flex items-center gap-2 w-72 shrink-0 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Plus className="w-5 h-5" />
              <span>Add another list</span>
            </button>
          )}
        </div>

        <DragOverlay>
          {activeId ? (
            activeId.startsWith('list-') ? (
              <List
                id={parseInt(activeId.split('-')[1])}
                title={lists.find((l) => `list-${l.id}` === activeId)?.title || ''}
                cards={cards.filter(
                  (card) =>
                    card.list_id === parseInt(activeId.split('-')[1])
                )}
                isDragging
              />
            ) : (
              <Card
                card={cards.find((c) => c.id === parseInt(activeId)) || cards[0]}
                isDragging
              />
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}