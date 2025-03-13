/* 
this an issue model to be displayed on the team dashboard to be seen by the that specific team members
1.topic 
2. description
3. assigned at
4. urgency
5. team- to which team in the compnay it is assigned 
6. company- to which company does the issue belongs to(OPTIONAL)
*/

import mongoose from 'mongoose'

const Schema = mongoose.Schema 

const assignedIssueSchema = new Schema({
	topic: String,
	description: String,
	assignedAt: Date,
	urgency: enum['urgent'],
	// team assigned to object ID
})

const assignedIssueModel = mongoose.model("assignedIssue",assignedIssueSchema)