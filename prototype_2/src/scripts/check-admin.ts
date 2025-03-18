import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminUser = await UserModel.findOne({ email: 'admin@example.com' });
    
    if (adminUser) {
      console.log('Admin user found:', {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin
      });
    } else {
      console.log('No admin user found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkAdmin(); 