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
		required:true}
})

const crIssueModel = mongoose.model('createdIssue',crIssueSchema)

export default crIssueModel

