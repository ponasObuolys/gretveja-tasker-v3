import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', { email: req.body.email, name: req.body.name });
    
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const userCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
    console.log('User check result:', { exists: userCheck.rows.length > 0 });
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );
    console.log('User created:', result.rows[0]);

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default_secret');

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error('Registration error details:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and send token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default_secret');
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 