import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';

// Mock JWT secret for testing
process.env.JWT_SECRET = 'test-secret-key';

let mongoServer;

export const connectDB = async () => {
    try {
        // Close any existing connection first
        await mongoose.disconnect();
        
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};

export const closeDatabase = async () => {
    try {
        await mongoose.disconnect();
        await mongoServer.stop();
    } catch (error) {
        console.error('Error closing database:', error);
        throw error;
    }
};

export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    }
};

export const generateTestCompany = (overrides = {}) => ({
    companyName: 'Test Company',
    adminName: 'Test Admin',
    shortDescription: 'Test Description',
    adminEmail: 'blockerapp01@gmail.com',
    password: 'TestPassword123!',
    streetNumber: '123',
    city: 'Test City',
    state: 'Test State',
    zipcode: '12345',
    country: 'Test Country',
    favoriteWord: 'test',
    ...overrides
});

export const generateTestEmployee = (companyId, overrides = {}, options = {}) => {
    const data = {
        firstName: 'Test',
        lastName: 'Employee',
        employeeEmail: `test.employee${Math.random().toString(36).substring(7)}@company.com`,
        password: 'TestPassword123!',
        streetNumber: '123',
        city: 'Test City',
        state: 'Test State',
        zipcode: '12345',
        country: 'Test Country',
        birthDate: new Date('1990-01-01'),
        company: companyId,
        authorization: options.authorization || 'employee',
        favoriteWord: 'test'
    };
    return { ...data, ...overrides };
};

export const generateTestTeam = (companyId, teamLeaderId, overrides = {}) => ({
    teamName: 'Test Team',
    description: 'Test team description',
    company: companyId,
    teamLeader: teamLeaderId,
    ...overrides
});

export const generateTestToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

export const apiRequest = async (request, endpoint, method, data = null, token = null) => {
    let req = request[method](endpoint);
    
    if (token) {
        req = req.set('Authorization', `Bearer ${token}`);
    }
    
    if (data && ['post', 'put'].includes(method)) {
        req = req.send(data);
    }
    
    return req;
};
