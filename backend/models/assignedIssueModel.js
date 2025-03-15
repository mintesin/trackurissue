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
	
	topic: {type:String,required:true,maxLenght:100},
	description: {type:String, required:true},
	assignedAt: {type:Date,required:true},
	urgency: {type:String,enum: ['urgent','notUrgent']},
	team:{type: Schema.Types.ObjectId, ref: "teams",required:true}

})

assignedIssueSchema.virtual('assigneddate').get(function() {
    const assignedDate = new Date(this.assignedAt);
    const day = String(assignedDate.getDate()).padStart(2, '0');
    const month = String(assignedDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = assignedDate.getFullYear();
    return `${month}/${day}/${year}`; // Format as MM/DD/YYYY
});

assignedIssueSchema.set('toJSON', { virtuals: true });
assignedIssueSchema.set('toObject', { virtuals: true });

const assignedIssueModel = mongoose.model("assignedIssue",assignedIssueSchema)

export default assignedIssueModel