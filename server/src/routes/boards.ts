import express from 'express';
import { query } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all boards for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const result = await query(
      'SELECT * FROM boards WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single board
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const boardId = req.params.id;
    
    const result = await query(
      'SELECT * FROM boards WHERE id = $1 AND user_id = $2',
      [boardId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create board
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { title } = req.body;
    
    const result = await query(
      'INSERT INTO boards (title, user_id) VALUES ($1, $2) RETURNING *',
      [title, userId]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update board
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const boardId = req.params.id;
    const { title } = req.body;
    
    const result = await query(
      'UPDATE boards SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [title, boardId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete board
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const boardId = req.params.id;
    
    const result = await query(
      'DELETE FROM boards WHERE id = $1 AND user_id = $2 RETURNING *',
      [boardId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Board not found' });
    }
    
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 