/**
 * Company Model with enhanced security features
 * Security improvements include:
 * 1. Password hashing using bcrypt
 * 2. Email validation using validator
 * 3. Password reset functionality with secure tokens
 * 4. Automatic field sanitization using trim
 * 5. Sensitive data protection using select: false
 * 6. Soft delete support via active field
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';
import crypto from 'crypto';

const Schema = mongoose.Schema;

const companySchema = new Schema({
    // Basic company information
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true // Prevents whitespace attacks
    },
    adminName: {
        type: String,
        required: [true, 'Admin name is required'],
        trim: true
    },
    shortDescription: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    // Email with validation and uniqueness check
    adminEmail: {
        type: String,
        required: [true, 'Email is required'],
        unique: true, // Prevents duplicate emails
        lowercase: true, // Ensures consistent email format
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email'
        }
    },
    // Address information
    streetNumber: {
        type: String, // Changed from Number to String to support complex street numbers
        required: [true, 'Street number is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    zipcode: {
        type: String,
        required: [true, 'Zipcode is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    // Security fields
    favoriteWord: {
        type: String,
        required: [true, 'Security word is required'],
        trim: true
    },
    // Password field with enhanced security
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Excludes password from query results by default
    },
    // Password reset functionality
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Soft delete support
    active: {
        type: Boolean,
        default: true,
        select: false // Hides this field from query results
    }
}, {
    timestamps: true // Automatically manage createdAt and updatedAt timestamps
});

/**
 * Pre-save middleware to hash password
 * Only hashes the password if it has been modified
 * Uses bcrypt with a salt factor of 12 for strong encryption
 */
companySchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Instance method to safely compare passwords
 * Uses bcrypt.compare to prevent timing attacks
 * @param {string} candidatePassword - The password to check
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
companySchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

/**
 * Instance method to generate password reset token
 * Creates a secure random token using crypto
 * Sets an expiration time for the reset token
 * @returns {string} The unhashed reset token to be sent to user
 */
companySchema.methods.createPasswordResetToken = function() {
    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token before saving to database
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    // Set token expiration (from environment variable)
    this.passwordResetExpires = Date.now() + parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN);
    
    return resetToken; // Return unhashed token for email
};

/**
 * Query middleware to exclude inactive companies
 * Automatically filters out soft-deleted companies from all queries
 */
companySchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } });
    next();
});

const Company = mongoose.model('Company', companySchema);

export default Company;
