import app from './app';
import { initDb } from './config/database';
import { VehicleService } from './services/vehicleService';
import { AuthService } from './services/authService';

const PORT = process.env.PORT || 5000;

async function seedDataIfEmpty() {
  const vehicles = await VehicleService.getAllVehicles();
  if (vehicles.length === 0) {
    console.log('Seeding initial dealership inventory...');
    const seedVehicles = [
      {
        make: 'Tesla',
        model: 'Model S Plaid',
        category: 'Sedan',
        price: 89990,
        quantity: 4,
        image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80'
      },
      {
        make: 'Porsche',
        model: '911 Carrera 4S',
        category: 'Coupe',
        price: 130000,
        quantity: 2,
        image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
      },
      {
        make: 'BMW',
        model: 'M4 Competition',
        category: 'Coupe',
        price: 78500,
        quantity: 5,
        image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80'
      },
      {
        make: 'Mercedes-Benz',
        model: 'G 63 AMG',
        category: 'SUV',
        price: 179000,
        quantity: 3,
        image_url: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&w=800&q=80'
      },
      {
        make: 'Audi',
        model: 'RS e-tron GT',
        category: 'Sedan',
        price: 106500,
        quantity: 3,
        image_url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80'
      },
      {
        make: 'Ford',
        model: 'Mustang Dark Horse',
        category: 'Coupe',
        price: 61000,
        quantity: 6,
        image_url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=800&q=80'
      },
      {
        make: 'Rivian',
        model: 'R1T Adventure',
        category: 'Truck',
        price: 73000,
        quantity: 0, // Deliberately 0 to demonstrate disabled purchase button
        image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
      },
      {
        make: 'Range Rover',
        model: 'Sport Autobiography',
        category: 'SUV',
        price: 118000,
        quantity: 2,
        image_url: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=800&q=80'
      }
    ];

    for (const v of seedVehicles) {
      await VehicleService.createVehicle(v);
    }

    // Seed default admin and user
    try {
      await AuthService.register({
        username: 'admin',
        email: 'admin@dealership.com',
        password: 'AdminPassword123!',
        role: 'admin'
      });
      await AuthService.register({
        username: 'customer',
        email: 'customer@dealership.com',
        password: 'UserPassword123!',
        role: 'user'
      });
      console.log('Default accounts seeded: admin@dealership.com & customer@dealership.com');
    } catch (e) {
      // Ignored if already existing
    }
  }
}

async function startServer() {
  try {
    await initDb();
    console.log('Connected to SQLite database successfully.');
    await seedDataIfEmpty();

    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
