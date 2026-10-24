import sqlite3 from 'sqlite3';
import path from 'path';

let dbInstance: sqlite3.Database | null = null;

export const getDb = (): sqlite3.Database => {
  if (!dbInstance) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return dbInstance;
};

export const initDb = (dbPath?: string): Promise<sqlite3.Database> => {
  return new Promise((resolve, reject) => {
    const finalPath = dbPath || (process.env.NODE_ENV === 'test' 
      ? ':memory:' 
      : path.resolve(__dirname, '../../dealership.sqlite'));

    dbInstance = new sqlite3.Database(finalPath, (err) => {
      if (err) {
        return reject(err);
      }

      // Enable foreign keys
      dbInstance!.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
        if (pragmaErr) return reject(pragmaErr);

        // Create Users table
        const createUsersTable = `
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `;

        // Create Vehicles table
        const createVehiclesTable = `
          CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            make TEXT NOT NULL,
            model TEXT NOT NULL,
            category TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `;

        dbInstance!.serialize(() => {
          dbInstance!.run(createUsersTable);
          dbInstance!.run(createVehiclesTable, (createErr) => {
            if (createErr) return reject(createErr);
            resolve(dbInstance!);
          });
        });
      });
    });
  });
};

export const closeDb = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      dbInstance.close((err) => {
        dbInstance = null;
        if (err) return reject(err);
        resolve();
      });
    } else {
      resolve();
    }
  });
};
