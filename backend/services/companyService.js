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

// ... (previous code remains the same until registerGet)

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

// ... (rest of the code remains the same)
