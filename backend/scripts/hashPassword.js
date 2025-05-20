import bcrypt from 'bcrypt'; // For hashing and verifying passwords securely
import mongoose from 'mongoose'; // To connect and interact with MongoDB
import { Employee } from '../models/index.js'; // Import the Employee model

// Async function to hash a password and update an employee's record
const hashPassword = async () => {
    try {
        // Connect to the MongoDB database
        await mongoose.connect('mongodb://127.0.0.1/newDb');
        
        // The plaintext password to be hashed
        const plainPassword = 'b5wgxwt5';

        // Generate a salt with 10 rounds (cost factor)
        const salt = await bcrypt.genSalt(10);

        // Create a secure hash of the plaintext password using the salt
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        
        // Find the employee by email and update their password
        const result = await Employee.findOneAndUpdate(
            { employeeEmail: 'mente@gmail.com' },        // Filter criteria
            { $set: { password: hashedPassword } },       // Update operation
            { new: true }                                 // Return the updated document
        ).select('+password'); // Ensure the password field is included (in case it's excluded by default in the schema)

        // If no employee is found, warn and exit early
        if (!result) {
            console.warn('No employee found with that email.');
            return;
        }

        // Log the email and hashed password for confirmation
        console.log('Password updated:', {
            email: result.employeeEmail,
            hashedPassword: result.password
        });

        // Verify that the hashed password matches the original plaintext one
        const isValid = await bcrypt.compare(plainPassword, result.password);
        console.log('Password verification:', isValid); // Should log: true

    } catch (error) {
        // Log any errors that occur during the process
        console.error('Error:', error);
    } finally {
        // Ensure the MongoDB connection is closed whether successful or not
        await mongoose.disconnect();
    }
};

// Run the password hashing and update function
hashPassword();
