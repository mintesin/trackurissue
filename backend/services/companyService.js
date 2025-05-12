/**
 * Company Service
 * Security improvements implemented:
 * 1. Secure password handling
 * 2. JWT token generation
 * 3. Safe error handling
 * 4. Input validation
 * 5. Secure password reset flow
 */

import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import companyModel from '../models/companyModel.js';
import teamModel from '../models/teamModel.js';
import employeeModel from '../models/employeeModel.js';
import crIssueModel from '../models/createdIssueModel.js';
import * as genericError from './genericError.js';
import validator from 'validator';

/**
 * Generate JWT Token
 * @param {string} id - Company ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET || 'test-secret-key',
        { expiresIn: '24h' }  // Set a default expiration time
    );
};

/**
 * Validate company registration data
 * @param {Object} data - Company registration data
 * @throws {Error} If validation fails
 */
const validateCompanyData = (data) => {
    // Sanitize email first
    if (!data.adminEmail) {
        throw new genericError.BadRequestError('Invalid email format');
    }
    data.adminEmail = data.adminEmail.toLowerCase().trim();

    // Validate email after trimming
    if (!validator.isEmail(data.adminEmail)) {
        throw new genericError.BadRequestError('Invalid email format');
    }
    
    // Validate password
    if (!data.password || data.password.length < 8) {
        throw new genericError.BadRequestError('Password must be at least 8 characters long');
    }
    if (!validator.isStrongPassword(data.password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    })) {
        throw new genericError.BadRequestError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // Sanitize other fields
    if (data.companyName) data.companyName = data.companyName.trim();
    if (data.adminName) data.adminName = data.adminName.trim();
    if (data.shortDescription) data.shortDescription = data.shortDescription.trim();
    if (data.streetNumber) data.streetNumber = data.streetNumber.trim();
    if (data.city) data.city = data.city.trim();
    if (data.state) data.state = data.state.trim();
    if (data.zipcode) data.zipcode = data.zipcode.trim();
    if (data.country) data.country = data.country.trim();
    if (data.favoriteWord) data.favoriteWord = data.favoriteWord.trim();
};

/**
 * Get registration form template
 * @returns {Object} Default company registration form values
 */
export const registerGet = () => {
    const companyDetail = {
        companyName: '',
        adminName: '',
        shortDescription: '',
        adminEmail: '',
        streetNumber: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        favoriteWord: '',
        password: ''
    };
    return { ...companyDetail };
};

/**
 * Register new company
 * @param {Object} companyData - Company registration data
 * @returns {Promise<Object>} Created company instance and JWT token
 */
export const registerPost = async (companyData) => {
    try {
        // Validate input data
        validateCompanyData(companyData);

        // Check if email already exists
        const existingCompany = await companyModel.findOne({ adminEmail: companyData.adminEmail });
        if (existingCompany) {
            throw new genericError.ConflictError('Email already registered');
        }

        // Create new company
        const company = new companyModel(companyData);
        await company.save();

        // Generate token
        const token = generateToken(company._id);

        // Return company data without sensitive information
        const companyResponse = {
            token,
            company: {
                _id: company._id,
                companyName: company.companyName,
                adminName: company.adminName,
                shortDescription: company.shortDescription,
                adminEmail: company.adminEmail,
                streetNumber: company.streetNumber,
                city: company.city,
                state: company.state,
                zipcode: company.zipcode,
                country: company.country
            }
        };

        return companyResponse;
    } catch (err) {
        if (err.code === 11000) { // MongoDB duplicate key error
            throw new genericError.ConflictError('Company already exists');
        }
        if (err.name === 'BadRequestError') {
            throw err; // Re-throw validation errors
        }
        throw new genericError.BadRequestError(err.message);
    }
};

/**
 * Get login form template
 * @returns {Object} Default login form values
 */
export const loginGet = () => {
    return {
        adminEmail: '',
        password: ''
    };
};

/**
 * Authenticate company login
 * @param {Object} credentials - Login credentials
 * @returns {Promise<Object>} Authenticated company and JWT token
 */
export const loginPost = async (credentials) => {
    try {
        const { adminEmail, password } = credentials;

        // Check if email and password exist
        if (!adminEmail || !password) {
            throw new genericError.BadRequestError('Please provide email and password');
        }

        // Find company and include password for comparison
        const company = await companyModel
            .findOne({ adminEmail })
            .select('+password');

        if (!company || !(await company.comparePassword(password))) {
            throw new genericError.UnauthorizedError('Invalid credentials');
        }

        // Generate token
        const token = generateToken(company._id);

        // Remove sensitive data
        const companyResponse = company.toObject();
        delete companyResponse.password;

        return {
            token,
            company: companyResponse
        };
    } catch (err) {
        if (err.name === 'UnauthorizedError' || err.name === 'BadRequestError') {
            throw err;
        }
        throw new genericError.OperationError('Login failed: ' + err.message);
    }
};

/**
 * Get password reset form template
 * @returns {Object} Default password reset form values
 */
export const resetAccountGet = () => {
    return {
        adminEmail: '',
        favoriteWord: '',
        newPassword: ''
    };
};

/**
 * Reset company password
 * @param {Object} resetData - Password reset data
 * @returns {Promise<Object>} Reset confirmation
 */
export const resetAccountPost = async (resetData) => {
    try {
        const { adminEmail, favoriteWord, newPassword } = resetData;

        // Validate new password
        if (!newPassword || newPassword.length < 8) {
            throw new genericError.BadRequestError('New password must be at least 8 characters long');
        }
        if (!validator.isStrongPassword(newPassword, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })) {
            throw new genericError.BadRequestError('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
        }

        // Find company
        const company = await companyModel.findOne({ adminEmail });
        if (!company) {
            throw new genericError.NotFoundError('No account found with that email');
        }

        // Verify favorite word
        if (company.favoriteWord !== favoriteWord) {
            throw new genericError.UnauthorizedError('Invalid security word');
        }

        // Update password
        company.password = newPassword;
        await company.save();

        return { message: 'Password reset successful' };
    } catch (err) {
        if (err.name === 'NotFoundError' || err.name === 'UnauthorizedError') {
            throw err;
        }
        throw new genericError.OperationError('Password reset failed: ' + err.message);
    }
};

/**
 * Get company dashboard data
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Dashboard data
 */
/**
 * Update company details
 * @param {string} companyId - Company ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated company data
 */
export const updateCompany = async (companyId, updateData) => {
    try {
        // Validate update data
        if (updateData.adminEmail && !validator.isEmail(updateData.adminEmail)) {
            throw new genericError.BadRequestError('Invalid email format');
        }

        // Find and update company
        const company = await companyModel.findById(companyId);
        if (!company) {
            throw new genericError.NotFoundError('Company not found');
        }

        // Update allowed fields
        const allowedUpdates = ['companyName', 'adminName', 'shortDescription', 'adminEmail', 'streetNumber', 'city', 'state', 'zipcode', 'country'];
        Object.keys(updateData).forEach(update => {
            if (allowedUpdates.includes(update)) {
                company[update] = updateData[update];
            }
        });

        await company.save();

        // Return updated company without sensitive information
        const companyResponse = company.toObject();
        delete companyResponse.password;
        delete companyResponse.passwordResetToken;
        delete companyResponse.passwordResetExpires;

        return companyResponse;
    } catch (err) {
        if (err.name === 'BadRequestError' || err.name === 'NotFoundError') {
            throw err;
        }
        throw new genericError.OperationError('Update failed: ' + err.message);
    }
};

export const companyHome = async (companyId) => {
    try {
        const [companyData, employeesData, teamsData, createdIssuesData] = await Promise.all([
            companyModel.findById(companyId)
                .select('companyName adminName shortDescription adminEmail')
                .lean(),
            employeeModel.find({ company: companyId })
                .select('employeeEmail firstName lastName authorization')
                .lean(),
            teamModel.find({ company: companyId })
                .select('teamName teamAdmin')
                .lean(),
            crIssueModel.find({ company: companyId })
                .select('topic description createdAt createdBy urgency status')
                .lean()
        ]);

        if (!companyData) {
            throw new genericError.NotFoundError('Company not found');
        }

        return {
            company: companyData,
            employees: employeesData,
            teams: teamsData,
            createdIssues: createdIssuesData
        };
    } catch (err) {
        if (err.name === 'NotFoundError') {
            throw err;
        }
        throw new genericError.OperationError('Failed to fetch company data: ' + err.message);
    }
};
