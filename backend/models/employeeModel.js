import mongoose from "mongoose"
import bcrypt from 'bcrypt'

const Schema = mongoose.Schema

const employeeSchema = new Schema({
    employeeEmail:{
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    firstName: {
        type: String, 
        required: true, 
        trim: true
    },
    lastName: {
        type: String, 
        required: true, 
        trim: true
    },
    streetNumber: {
        type: String, 
        required: true,
        trim: true
    },
    birthDate:{
        type: Date, 
        required: true
    },
    city:{
        type: String, 
        required: true, 
        trim: true
    },
    state: {
        type: String, 
        required: true, 
        trim: true
    },
    zipcode:{
        type: String, 
        required: true, 
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    favoriteWord: {
        type: String,
        required: true,
        trim: true,
        select: false
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        select: false
    },
    authorization: {
        type: String,
        enum: ["admin", "teamleader", "employee"],
        required: true,
        default: "employee",
        trim: true
    },
    company:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Company'
    },
    teams: [{
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: false
    }],
    leadingTeams: [{
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: false
    }],
    team: {  // Add this field for backward compatibility
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: false
    },
    passwordChangedAt: {
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
    timestamps: true
})

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`
})

// Hash password and favoriteWord before saving
employeeSchema.pre('save', async function(next) {
    try {
        // Hash password if modified
        if (this.isModified('password')) {
            console.log('Backend - Password Hashing:');
            console.log('- Employee email:', this.employeeEmail);
            console.log('- Plain password length:', this.password.length);
            
            const salt = await bcrypt.genSalt(10)
            this.password = await bcrypt.hash(this.password, salt)
            
            console.log('- Hashed password length:', this.password.length);

            // If this is a password change, update passwordChangedAt
            if (!this.isNew) {
                this.passwordChangedAt = Date.now() - 1000
            }
        }

        // Hash favoriteWord if modified
        if (this.isModified('favoriteWord')) {
            const salt = await bcrypt.genSalt(10)
            this.favoriteWord = await bcrypt.hash(this.favoriteWord, salt)
        }

        next()
    } catch (error) {
        next(error)
    }
})

// Methods to compare password and favoriteWord
employeeSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password)
    } catch (error) {
        throw error
    }
}

employeeSchema.methods.compareFavoriteWord = async function(candidateWord) {
    try {
        return await bcrypt.compare(candidateWord, this.favoriteWord)
    } catch (error) {
        throw error
    }
}

// Method to check if password was changed after token was issued
employeeSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTimestamp < changedTimestamp
    }
    return false
}

// Query middleware to filter out inactive employees
employeeSchema.pre(/^find/, function(next) {
    this.find({ active: { $ne: false } })
    next()
})

employeeSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        delete ret.password
        delete ret.passwordResetToken
        delete ret.passwordResetExpires
        return ret
    }
})

employeeSchema.set('toObject', { virtuals: true })

// Create compound index for email uniqueness within a company
employeeSchema.index({ employeeEmail: 1, company: 1 }, { unique: true });

const Employee = mongoose.model("Employee", employeeSchema)

export default Employee
