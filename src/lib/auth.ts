import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { query, run } from './db';

const JWT_SECRET = new TextEncoder().encode('your-secret-key');

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createUser(email: string, password: string, name: string) {
  try {
    const hashedPassword = await hashPassword(password);
    
    // First, check if the user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser[0]?.values?.length > 0) {
      throw new Error('User already exists');
    }

    // Create the user
    await run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    // Get the created user
    const result = await query(
      'SELECT id, email, name FROM users WHERE email = ?',
      [email]
    );

    if (!result[0]?.values?.length) {
      throw new Error('Failed to create user');
    }

    return result[0].values[0];
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

export async function generateToken(userId: number) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}