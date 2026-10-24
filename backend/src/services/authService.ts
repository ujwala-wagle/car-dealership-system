import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../config/database';
import { User, UserResponse, AuthPayload } from '../models/types';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_car_dealership_jwt_key_2026';
const SALT_ROUNDS = 10;

export class AuthService {
  static async register(userData: { username: string; email: string; password?: string; role?: string }): Promise<UserResponse> {
    const { username, email, password, role } = userData;

    if (!username || !email || !password) {
      throw { status: 400, message: 'Username, email, and password are required' };
    }

    const db = getDb();

    // Check if email already exists
    const existing = await new Promise<User | undefined>((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return reject(err);
        resolve(row as User | undefined);
      });
    });

    if (existing) {
      throw { status: 400, message: 'Email is already registered' };
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const assignedRole = role === 'admin' ? 'admin' : 'user';

    const userId = await new Promise<number>((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, assignedRole],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });

    return {
      id: userId,
      username,
      email,
      role: assignedRole
    };
  }

  static async login(credentials: { email?: string; password?: string }): Promise<{ token: string; user: UserResponse }> {
    const { email, password } = credentials;

    if (!email || !password) {
      throw { status: 400, message: 'Email and password are required' };
    }

    const db = getDb();

    const user = await new Promise<User | undefined>((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return reject(err);
        resolve(row as User | undefined);
      });
    });

    if (!user || !user.password) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const payload: AuthPayload = {
      userId: user.id!,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    const userResponse: UserResponse = {
      id: user.id!,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };

    return { token, user: userResponse };
  }
}
