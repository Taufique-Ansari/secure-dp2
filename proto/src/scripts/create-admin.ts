import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function createAdmin() {
    try {
        // Verify MongoDB URI is loaded
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env.local');
        }

        // Connect to MongoDB directly
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Admin credentials
        const adminData = {
            name: "Admin User",
            email: "admin@example.com",
            password: "admin123", // You should change this
            isAdmin: true
        };

        // Check if admin already exists
        const existingAdmin = await UserModel.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Existing admin details:', {
                email: existingAdmin.email,
                isAdmin: existingAdmin.isAdmin,
                id: existingAdmin._id
            });
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        // Create admin user
        const admin = new UserModel({
            ...adminData,
            password: hashedPassword
        });

        await admin.save();
        console.log('Admin user created successfully with details:', {
            email: admin.email,
            isAdmin: admin.isAdmin,
            id: admin._id
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdmin(); 