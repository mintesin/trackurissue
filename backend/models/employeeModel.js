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
		select: false // Don't include favoriteWord in queries by default
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 8,
		select: false // Don't include password in queries by default
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
		ref: 'company' // Add reference to company model
	},
	team: {
		type: Schema.Types.ObjectId,
		required: false,
		ref: 'team' // Add reference to team model
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
	timestamps: true // Add createdAt and updatedAt timestamps
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
			const salt = await bcrypt.genSalt(10)
			this.password = await bcrypt.hash(this.password, salt)

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

const employeeModel = mongoose.model("employee", employeeSchema)

export default employeeModel
