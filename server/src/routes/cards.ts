import express from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all cards for a list
router.get('/list/:listId', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { listId } = req.params;

    // Verify list belongs to user's board
    const listCheck = await query(
      'SELECT l.id FROM lists l JOIN boards b ON l.board_id = b.id WHERE l.id = $1 AND b.user_id = $2',
      [listId, userId]
    );

    if (listCheck.rows.length === 0) {
      return res.status(404).json({ message: 'List not found' });
    }

    const result = await query(
      'SELECT c.*, array_agg(u.name) as assigned_users FROM cards c ' +
      'LEFT JOIN card_assignments ca ON c.id = ca.card_id ' +
      'LEFT JOIN users u ON ca.user_id = u.id ' +
      'WHERE c.list_id = $1 ' +
      'GROUP BY c.id ' +
      'ORDER BY c.position',
      [listId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create card
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { title, description, listId, position, dueDate, priority } = req.body;

    // Verify list belongs to user's board
    const listCheck = await query(
      'SELECT l.id FROM lists l JOIN boards b ON l.board_id = b.id WHERE l.id = $1 AND b.user_id = $2',
      [listId, userId]
    );

    if (listCheck.rows.length === 0) {
      return res.status(404).json({ message: 'List not found' });
    }

    const result = await query(
      'INSERT INTO cards (title, description, list_id, position, due_date, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, listId, position, dueDate, priority]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update card
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const cardId = req.params.id;
    const { title, description, listId, position, dueDate, priority } = req.body;

    // Verify card belongs to user's board
    const cardCheck = await query(
      'SELECT c.id FROM cards c ' +
      'JOIN lists l ON c.list_id = l.id ' +
      'JOIN boards b ON l.board_id = b.id ' +
      'WHERE c.id = $1 AND b.user_id = $2',
      [cardId, userId]
    );

    if (cardCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const result = await query(
      'UPDATE cards SET title = $1, description = $2, list_id = $3, position = $4, due_date = $5, priority = $6 WHERE id = $7 RETURNING *',
      [title, description, listId, position, dueDate, priority, cardId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete card
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const cardId = req.params.id;

    // Verify card belongs to user's board
    const cardCheck = await query(
      'SELECT c.id FROM cards c ' +
      'JOIN lists l ON c.list_id = l.id ' +
      'JOIN boards b ON l.board_id = b.id ' +
      'WHERE c.id = $1 AND b.user_id = $2',
      [cardId, userId]
    );

    if (cardCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }

    await query('DELETE FROM cards WHERE id = $1', [cardId]);
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign user to card
router.post('/:id/assign', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const cardId = req.params.id;
    const { assignedUserId } = req.body;

    // Verify card belongs to user's board
    const cardCheck = await query(
      'SELECT c.id FROM cards c ' +
      'JOIN lists l ON c.list_id = l.id ' +
      'JOIN boards b ON l.board_id = b.id ' +
      'WHERE c.id = $1 AND b.user_id = $2',
      [cardId, userId]
    );

    if (cardCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }

    await query(
      'INSERT INTO card_assignments (card_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [cardId, assignedUserId]
    );
    res.json({ message: 'User assigned successfully' });
  } catch (error) {
    console.error('Assign user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove user from card
router.delete('/:id/assign/:userId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = (req as any).user.userId;
    const cardId = req.params.id;
    const assignedUserId = req.params.userId;

    // Verify card belongs to user's board
    const cardCheck = await query(
      'SELECT c.id FROM cards c ' +
      'JOIN lists l ON c.list_id = l.id ' +
      'JOIN boards b ON l.board_id = b.id ' +
      'WHERE c.id = $1 AND b.user_id = $2',
      [cardId, currentUserId]
    );

    if (cardCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }

    await query(
      'DELETE FROM card_assignments WHERE card_id = $1 AND user_id = $2',
      [cardId, assignedUserId]
    );
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Remove user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 