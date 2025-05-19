import mongoose from 'mongoose';
import * as genericError from '../services/genericError.js';

const teamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    minlength: [2, 'Team name must be at least 2 characters long'],
    maxlength: [50, 'Team name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required'],
    index: true
  },
  teamLeaders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'At least one team leader is required']
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for unique team names within a company
teamSchema.index({ teamName: 1, company: 1 }, { unique: true });

// Update timestamps on save
teamSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Ensure teamLeaders are also in members array
  const allMembers = new Set([...this.members.map(id => id.toString())]);
  this.teamLeaders.forEach(leaderId => {
    allMembers.add(leaderId.toString());
  });
  this.members = Array.from(allMembers);
  
  next();
});

// Validate at least one team leader
teamSchema.path('teamLeaders').validate(function(teamLeaders) {
  if (!teamLeaders || teamLeaders.length === 0) {
    throw new genericError.BadRequestError('At least one team leader is required');
  }
  return true;
});

// Add virtual for member count
teamSchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Configure toJSON
teamSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Team = mongoose.model('Team', teamSchema);

export default Team;
