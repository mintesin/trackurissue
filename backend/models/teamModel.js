/*
The team has the following names
1.teamName
2.teamAdmin
 
*/

import mongoose from "mongoose"

const Schema = mongoose.Schema 
const teamSchema = new Schema({
	teamName: {
		type: String,
		required:true,
	},
	company:{
		type:Schema.Types.ObjectId,
		ref: "company",
		required: true 
	},
	// In teamModel.js
	members: [{
		type: Schema.Types.ObjectId,
		ref: "employee"
	}]

	
}) 


const teamModel = mongoose.model("teams",teamSchema)
export default teamModel  