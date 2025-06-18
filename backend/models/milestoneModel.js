import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const milestoneSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Milestone title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
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
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
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
milestoneSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for completion percentage based on issues
milestoneSchema.virtual('completionPercentage').get(function() {
    if (!this.issues || this.issues.length === 0) return 0;
    
    // This would need to be populated with actual issue data
    // For now, return the manually set progress
    return this.progress;
});

milestoneSchema.set('toJSON', { virtuals: true });

const Milestone = mongoose.model('Milestone', milestoneSchema);
export default Milestone;
