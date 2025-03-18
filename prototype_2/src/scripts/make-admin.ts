import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function makeAdmin() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Email of the user you want to make admin
    const email = 'admin@example.com';
    
    // Update the user to be an admin
    const result = await UserModel.findOneAndUpdate(
      { email },
      { isAdmin: true },
      { new: true }
    );
    
    if (result) {
      console.log('User updated to admin:', {
        id: result._id,
        name: result.name,
        email: result.email,
        isAdmin: result.isAdmin
      });
    } else {
      console.log('No user found with email:', email);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

makeAdmin(); 