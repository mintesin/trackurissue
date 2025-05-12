import mongoose from 'mongoose';
import companyModel from '../models/companyModel.js';

async function testCompany() {
    try {
        await mongoose.connect('mongodb://127.0.0.1/newDb');
        console.log('Connected to database');
        
        const company = await companyModel.findOne();
        console.log('Found company:', company);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database');
    }
}

testCompany();
