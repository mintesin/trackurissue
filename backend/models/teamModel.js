/*
The team has the following names
1.teamName
2.teamAdmin
 

*/

import mongoose from "mongoose"

const Schema = mongoose.Schema 
const teamSchema = new Schema({
	teamName: String,
	// company:object Id to which company does it belong

}) 


const teamModel = mongoose.Model("teams",teamSchema)
export default teamModel 