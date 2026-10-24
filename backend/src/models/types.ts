export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  created_at?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  created_at?: string;
}

export interface Vehicle {
  id?: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthPayload {
  userId: number;
  email: string;
  role: 'admin' | 'user';
}
