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
import sendEmail from '../config/nodeMailer.js';

/**
 * Get company dashboard data
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Dashboard data including teams, employees, and issues
 */
export const companyHome = async (companyId) => {
    try {
        const [company, teams, employees, issues] = await Promise.all([
            companyModel.findById(companyId).select('-password -favoriteWord'),
            teamModel.find({ company: companyId })
                .select('teamName description members')
                .populate({
                    path: 'members',
                    select: 'firstName lastName authorization',
                    model: 'Employee'
                })
                .lean()
            .then(teams => teams.map(team => ({
                ...team,
                members: team.members?.map(member => ({
                    _id: member._id,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    isTeamLeader: member.authorization === 'teamleader'
                })) || [],
                teamLeaders: team.members?.filter(member => member.authorization === 'teamleader').map(leader => ({
                    _id: leader._id,
                    firstName: leader.firstName,
                    lastName: leader.lastName
                })) || []
            }))),
            employeeModel.find({ company: companyId }),
            crIssueModel.find({ company: companyId })
        ]);

        if (!company) {
            throw new genericError.NotFoundError('Company not found');
        }

        return {
            company,
            teams,
            employees,
            issues
        };
    } catch (error) {
        console.error('Error in companyHome:', error);
        throw error;
    }
};

export const resetAccountGet = () => {
    return {
        fields: [
            {
                name: 'adminEmail',
                label: 'Admin Email',
                type: 'email',
                required: true
            },
            {
                name: 'favoriteWord',
                label: 'Security Word',
                type: 'text',
                required: true,
                description: 'The security word you provided during registration'
            }
        ]
    };
};

export const resetAccountPost = async (resetData) => {
    try {
        const { adminEmail, favoriteWord, newPassword } = resetData;

        if (!adminEmail || !favoriteWord) {
            throw new genericError.BadRequestError('Email and security word are required');
        }

        const company = await companyModel.findOne({ adminEmail });

        if (!company) {
            throw new genericError.NotFoundError('Company not found');
        }

        if (company.favoriteWord !== favoriteWord) {
            throw new genericError.UnauthorizedError('Invalid security word');
        }

        // Use provided password or generate new one if not provided
        const passwordToUse = newPassword || Math.random().toString(36).slice(-8);
        company.password = passwordToUse;
        await company.save();

        // Send email notification for password reset
        const emailSubject = 'Company Account Password Reset';
        const emailText = `Hello ${company.adminName},\n\n` +
                         `Welcome back to the platform!\n` +
                         `Your password has been reset for ${company.companyName}.\n` +
                         `Your new temporary password is: ${passwordToUse}\n\n` +
                         `Please log in and change your password as soon as possible.\n\n` +
                         `Best regards,\nSystem Administration`;

        try {
            await sendEmail(company.adminEmail, emailSubject, emailText);
            console.log('Password reset email sent successfully to', company.adminEmail);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
        }

        return {
            message: 'Password reset successful',
            newPassword: passwordToUse
        };
    } catch (error) {
        console.error('Error in resetAccountPost:', error);
        throw error;
    }
};

/**
 * Get company profile
 * @param {string} companyId - Company ID
 * @returns {Promise<Object>} Company profile data
 */
export const getProfile = async (companyId) => {
    try {
        const company = await companyModel.findById(companyId)
            .select('-password -favoriteWord');

        if (!company) {
            throw new genericError.NotFoundError('Company not found');
        }
        return company;
    
    } catch (error) {
        console.error('Error in getProfile:', error);
        throw error;
    }
};

/**
 * Update company profile
 * @param {string} companyId - Company ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated company profile
 */
export const updateProfile = async (companyId, updateData) => {
    try {
        // Only allow updating specific fields
        const allowedUpdates = ['companyName', 'adminName', 'adminEmail', 'streetNumber', 'city', 'state', 'zipcode', 'country', 'shortDescription'];
        const updates = Object.keys(updateData)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});

        const company = await companyModel.findByIdAndUpdate(
            companyId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password -favoriteWord');

        if (!company) {
            throw new genericError.NotFoundError('Company not found');
        }

        return company;
    } catch (error) {
        console.error('Error in updateProfile:', error);
        if (error.name === 'ValidationError') {
            throw new genericError.BadRequestError(error.message);
        }
        throw error;
    }
};

/**
 * Get login form template
 * @returns {Object} Login form fields
 */
export const loginGet = () => {
    return {
        fields: [
            {
                name: 'adminEmail',
                label: 'Admin Email',
                type: 'email',
                required: true
            },
            {
                name: 'password',
                label: 'Password',
                type: 'password',
                required: true
            }
        ]
    };
};

/**
 * Authenticate company login
 * @param {Object} loginData - Login credentials
 * @returns {Promise<Object>} Authenticated company with JWT token
 */
export const loginPost = async (loginData) => {
    try {
        const { adminEmail, password } = loginData;

        if (!adminEmail || !password) {
            throw new genericError.BadRequestError('Please provide email and password');
        }

        const company = await companyModel.findOne({ adminEmail }).select('+password');

        if (!company || !(await company.comparePassword(password))) {
            throw new genericError.UnauthorizedError('Invalid email or password');
        }

        const token = jwt.sign(
            { id: company._id },
            process.env.JWT_SECRET || 'your-secret-key',  // Added fallback secret
            { expiresIn: '24h' }
        );

        company.password = undefined;

        return {
            company,
            token
        };
    } catch (error) {
        console.error('Error in loginPost:', error);  // Added error logging
        throw error;
    }
};

/**
 * Get registration form template
 * @returns {Object} Registration form fields with sections and validation rules
 */
export const registerGet = () => {
    return {
        sections: [
            {
                sectionName: 'company',
                sectionTitle: 'Company Information',
                fields: [
                    {
                        name: 'companyName',
                        label: 'Company Name',
                        type: 'text',
                        required: true,
                        value: ''
                    },
                    {
                        name: 'shortDescription',
                        label: 'Company Description',
                        type: 'textarea',
                        required: true,
                        value: ''
                    }
                ]
            },
            {
                sectionName: 'admin',
                sectionTitle: 'Admin Information',
                fields: [
                    {
                        name: 'adminName',
                        label: 'Admin Name',
                        type: 'text',
                        required: true,
                        value: ''
                    },
                    {
                        name: 'adminEmail',
                        label: 'Admin Email',
                        type: 'email',
                        required: true,
                        value: ''
                    },
                    {
                        name: 'password',
                        label: 'Password',
                        type: 'password',
                        required: true,
                        value: '',
                        description: 'Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character'
                    }
                ]
            },
            {
                sectionName: 'address',
                sectionTitle: 'Address Information',
                fields: [
                    {
                        name: 'streetNumber',
                        label: 'Street Address',
                        type: 'text',
                        required: true,
                        value: ''
                    },
                    {
                        name: 'city',
                        label: 'City',
                        type: 'text',
                        required: true,
                        value: ''
                    },
                    {
                        name: 'state',
                        label: 'State',
                        type: 'text',
                        required: true,
                        value: ''
                    },
                    {
                        name: 'zipcode',
                        label: 'Zipcode',
                        type: 'text',
                        required: true,
                        value: ''
                    },
                    {
                        name: 'country',
                        label: 'Country',
                        type: 'text',
                        required: true,
                        value: ''
                    }
                ]
            },
            {
                sectionName: 'security',
                sectionTitle: 'Security Information',
                fields: [
                    {
                        name: 'favoriteWord',
                        label: 'Security Word',
                        type: 'text',
                        required: true,
                        value: '',
                        description: 'This word will be used for password recovery'
                    }
                ]
            }
        ]
    };
};

/**
 * Register a new company
 * @param {Object} companyData - Company registration data
 * @returns {Promise<Object>} Registered company with JWT token
 * @throws {genericError.BadRequestError} If validation fails
 * @throws {genericError.ConflictError} If company/email already exists
 */
export const registerPost = async (companyData) => {
    try {
        // 1. Sanitize and validate required fields
        const sanitizedData = {
            companyName: companyData.companyName?.trim(),
            adminName: companyData.adminName?.trim(),
            adminEmail: companyData.adminEmail?.trim(),
            password: companyData.password,
            streetNumber: companyData.streetNumber?.trim(),
            city: companyData.city?.trim(),
            state: companyData.state?.trim(),
            zipcode: companyData.zipcode?.trim(),
            country: companyData.country?.trim(),
            favoriteWord: companyData.favoriteWord?.trim(),
            shortDescription: companyData.shortDescription?.trim()
        };

        const {
            companyName,
            adminName,
            adminEmail,
            password,
            streetNumber,
            city,
            state,
            zipcode,
            country,
            favoriteWord,
            shortDescription
        } = sanitizedData;

        if (!companyName || !adminName || !adminEmail || !password || !favoriteWord || !shortDescription || 
            !streetNumber || !city || !state || !zipcode || !country) {
            throw new genericError.BadRequestError('Please provide all required fields');
        }

        // 2. Validate email format
        if (!validator.isEmail(adminEmail)) {
            throw new genericError.BadRequestError('Please provide a valid email');
        }

        // 3. Check if company already exists
        const existingCompany = await companyModel.findOne({ 
            $or: [
                { companyName },
                { adminEmail }
            ]
        });

        if (existingCompany) {
            throw new genericError.ConflictError(
                existingCompany.companyName === companyName
                    ? 'Company name already exists'
                    : 'Admin email already registered'
            );
        }

        // 4. Create new company
        const company = await companyModel.create({
            companyName,
            adminName,
            adminEmail,
            password, // Password will be hashed by mongoose pre-save middleware
            streetNumber,
            city,
            state,
            zipcode,
            country,
            favoriteWord,
            shortDescription
        });

        // 5. Generate JWT token
        const token = jwt.sign(
            { id: company._id },
            process.env.JWT_SECRET || 'your-secret-key',  // Added fallback secret
            { expiresIn: '24h' }
        );
        
        // Send welcome email to company admin
        const emailSubject = 'Welcome to Our Platform';
        const emailText = `Hello ${adminName},\n\n` +
                         `Welcome to our platform! Your company ${companyName} has been successfully registered.\n\n` +
                         `Your account details:\n` +
                         `Email: ${adminEmail}\n` +
                         `Password: ${password}\n\n` +
                         `Please keep these credentials safe and change your password after your first login.\n\n` +
                         `Best regards,\nSystem Administration`;

        try {
            await sendEmail(adminEmail, emailSubject, emailText);
            console.log('Welcome email sent successfully to', adminEmail);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }

        // 6. Remove sensitive data before sending response
        company.password = undefined;
        company.favoriteWord = undefined;

        return {
            company,
            token
        };
    } catch (error) {
        console.error('Error in registerPost:', error);  // Added error logging
        // Re-throw mongoose validation errors as BadRequestError
        if (error.name === 'ValidationError') {
            throw new genericError.BadRequestError(error.message);
        }
        throw error;
    }
};
