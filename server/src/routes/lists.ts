import express from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all lists for a board
router.get('/board/:boardId', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { boardId } = req.params;

    // Verify board belongs to user
    const boardCheck = await query(
      'SELECT id FROM boards WHERE id = $1 AND user_id = $2',
      [boardId, userId]
    );

    if (boardCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const result = await query(
      'SELECT * FROM lists WHERE board_id = $1 ORDER BY position',
      [boardId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get lists error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create list
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { title, boardId, position } = req.body;

    // Verify board belongs to user
    const boardCheck = await query(
      'SELECT id FROM boards WHERE id = $1 AND user_id = $2',
      [boardId, userId]
    );

    if (boardCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const result = await query(
      'INSERT INTO lists (title, board_id, position) VALUES ($1, $2, $3) RETURNING *',
      [title, boardId, position]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update list
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const listId = req.params.id;
    const { title, position } = req.body;

    // Verify list belongs to user's board
    const listCheck = await query(
      'SELECT l.id FROM lists l JOIN boards b ON l.board_id = b.id WHERE l.id = $1 AND b.user_id = $2',
      [listId, userId]
    );

    if (listCheck.rows.length === 0) {
      return res.status(404).json({ message: 'List not found' });
    }

    const result = await query(
      'UPDATE lists SET title = $1, position = $2 WHERE id = $3 RETURNING *',
      [title, position, listId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete list
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const listId = req.params.id;

    // Verify list belongs to user's board
    const listCheck = await query(
      'SELECT l.id FROM lists l JOIN boards b ON l.board_id = b.id WHERE l.id = $1 AND b.user_id = $2',
      [listId, userId]
    );

    if (listCheck.rows.length === 0) {
      return res.status(404).json({ message: 'List not found' });
    }

    await query('DELETE FROM lists WHERE id = $1', [listId]);
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 