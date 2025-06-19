/*
This is a model for the created issue to be displayed on the admin dashboard
1. topic or name for the issue or it can be code 
2. description
3. cereated at
4. created by 
6. urgency
7. status
8. company - to which company does it belong. this is one to many relationship

*/

import mongoose from "mongoose" 

const Schema = mongoose.Schema 

const crIssueSchema = new Schema({
	topic:{type: String,required:true},
	description:{
		type: String, 
		required:true
	},
	createdAt:{ 
		type: Date, 
		default: Date.now 
	},
	createdBy: {
		type:Schema.Types.ObjectId, 
		required:true
	},
	urgency: {
		type:String, 
		enum: ['urgent','notUrgent'], 
		default:'notUrgent'
	},
	status: {
		type:String, 
		enum:["created","assigned","edited","solved"], 
		default:"created"
	},
	company: {
		type:Schema.Types.ObjectId, 
		required:true
	},
	solution: {
		type: String,
		default: ''
	},
	additionalNotes: {
		type: String,
		default: ''
	},
	solvedAt: {
		type: Date,
		default: null
	},
	// Project Management fields
	sprint: {
		type: Schema.Types.ObjectId,
		ref: 'Sprint',
		default: null
	},
	milestone: {
		type: Schema.Types.ObjectId,
		ref: 'Milestone',
		default: null
	},
	storyPoints: {
		type: Number,
		min: 0,
		max: 100,
		default: 0
	},
	kanbanStatus: {
		type: String,
		enum: ['backlog', 'todo', 'inProgress', 'review', 'done'],
		default: 'backlog'
	},
	priority: {
		type: String,
		enum: ['low', 'medium', 'high', 'critical'],
		default: 'medium'
	},
	estimatedHours: {
		type: Number,
		min: 0,
		default: 0
	},
	actualHours: {
		type: Number,
		min: 0,
		default: 0
	},
	labels: [{
		type: String,
		trim: true
	}]
})

const crIssueModel = mongoose.model('createdIssue',crIssueSchema)

export default crIssueModel

