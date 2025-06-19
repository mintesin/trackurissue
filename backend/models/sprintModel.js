import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const sprintSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Sprint name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    status: {
        type: String,
        enum: ['planning', 'active', 'completed'],
        default: 'planning'
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    issues: [{
        type: Schema.Types.ObjectId,
        ref: 'createdIssue'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamps
sprintSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Sprint = mongoose.model('Sprint', sprintSchema);
export default Sprint;
