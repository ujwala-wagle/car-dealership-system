import { getDb } from '../config/database';
import { Vehicle } from '../models/types';

export interface VehicleSearchParams {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export class VehicleService {
  static async createVehicle(vehicleData: {
    make: string;
    model: string;
    category: string;
    price: number;
    quantity: number;
    image_url?: string;
  }): Promise<Vehicle> {
    const { make, model, category, price, quantity, image_url } = vehicleData;

    if (!make || !model || !category || price === undefined || quantity === undefined) {
      throw { status: 400, message: 'make, model, category, price, and quantity are required' };
    }

    if (price < 0 || quantity < 0) {
      throw { status: 400, message: 'price and quantity cannot be negative' };
    }

    const db = getDb();
    const finalImageUrl = image_url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d';

    const insertId = await new Promise<number>((resolve, reject) => {
      db.run(
        `INSERT INTO vehicles (make, model, category, price, quantity, image_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [make, model, category, price, quantity, finalImageUrl],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });

    return await this.getVehicleById(insertId);
  }

  static async getAllVehicles(): Promise<Vehicle[]> {
    const db = getDb();
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM vehicles ORDER BY id DESC', (err, rows) => {
        if (err) return reject(err);
        resolve(rows as Vehicle[]);
      });
    });
  }

  static async getVehicleById(id: number): Promise<Vehicle> {
    const db = getDb();
    const vehicle = await new Promise<Vehicle | undefined>((resolve, reject) => {
      db.get('SELECT * FROM vehicles WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row as Vehicle | undefined);
      });
    });

    if (!vehicle) {
      throw { status: 404, message: 'Vehicle not found' };
    }

    return vehicle;
  }

  static async searchVehicles(params: VehicleSearchParams): Promise<Vehicle[]> {
    const db = getDb();
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const values: any[] = [];

    if (params.make) {
      query += ' AND LOWER(make) LIKE ?';
      values.push(`%${params.make.toLowerCase()}%`);
    }

    if (params.model) {
      query += ' AND LOWER(model) LIKE ?';
      values.push(`%${params.model.toLowerCase()}%`);
    }

    if (params.category) {
      query += ' AND LOWER(category) = ?';
      values.push(params.category.toLowerCase());
    }

    if (params.minPrice !== undefined && !isNaN(params.minPrice)) {
      query += ' AND price >= ?';
      values.push(params.minPrice);
    }

    if (params.maxPrice !== undefined && !isNaN(params.maxPrice)) {
      query += ' AND price <= ?';
      values.push(params.maxPrice);
    }

    query += ' ORDER BY id DESC';

    return new Promise((resolve, reject) => {
      db.all(query, values, (err, rows) => {
        if (err) return reject(err);
        resolve(rows as Vehicle[]);
      });
    });
  }

  static async updateVehicle(id: number, updates: Partial<Vehicle>): Promise<Vehicle> {
    // Check if vehicle exists
    await this.getVehicleById(id);

    const allowedFields = ['make', 'model', 'category', 'price', 'quantity', 'image_url'];
    const fieldsToUpdate: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fieldsToUpdate.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fieldsToUpdate.length === 0) {
      return await this.getVehicleById(id);
    }

    fieldsToUpdate.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const db = getDb();
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE vehicles SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    return await this.getVehicleById(id);
  }

  static async deleteVehicle(id: number): Promise<void> {
    await this.getVehicleById(id);
    const db = getDb();
    await new Promise<void>((resolve, reject) => {
      db.run('DELETE FROM vehicles WHERE id = ?', [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static async purchaseVehicle(id: number): Promise<Vehicle> {
    const vehicle = await this.getVehicleById(id);

    if (vehicle.quantity <= 0) {
      throw { status: 400, message: 'Cannot purchase: vehicle is out of stock (quantity is zero)' };
    }

    const db = getDb();
    await new Promise<void>((resolve, reject) => {
      db.run(
        'UPDATE vehicles SET quantity = quantity - 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    return await this.getVehicleById(id);
  }

  static async restockVehicle(id: number, quantityToAdd: number): Promise<Vehicle> {
    if (typeof quantityToAdd !== 'number' || isNaN(quantityToAdd) || quantityToAdd <= 0) {
      throw { status: 400, message: 'Restock quantity must be a positive number' };
    }

    await this.getVehicleById(id);

    const db = getDb();
    await new Promise<void>((resolve, reject) => {
      db.run(
        'UPDATE vehicles SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [quantityToAdd, id],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    return await this.getVehicleById(id);
  }
}
