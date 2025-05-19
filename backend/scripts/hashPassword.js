import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { Employee } from '../models/index.js';

const hashPassword = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1/newDb');
        
        const plainPassword = 'b5wgxwt5';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        
        const result = await Employee.findOneAndUpdate(
            { employeeEmail: 'mente@gmail.com' },
            { $set: { password: hashedPassword } },
            { new: true }
        ).select('+password');

        console.log('Password updated:', {
            email: result.employeeEmail,
            hashedPassword: result.password
        });

        // Verify the password works
        const isValid = await bcrypt.compare(plainPassword, result.password);
        console.log('Password verification:', isValid);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

hashPassword();
