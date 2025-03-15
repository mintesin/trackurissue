/* 

This is also a model for employee of the company
1.first name
2. last name
3. street Number
4. city
5.stateOrprovince 
6. zipcode
7. country
8.favorite word
9.password
8.company-relationship to by object Id and which company is he/she working 
*/
import mongoose from "mongoose"

const Schema = mongoose.Schema

const employeeSchema = new Schema({
	firstName: {type: String,required: true,trim:true},
	lastName: {type: String,required: true,trim:true},
	streetNumber: {type: String,required: true,trim:true},
	birthDate:{type:Date,required:true},
	city:{type: String,required: true,trim: true},
	state: {type: String,required: true,trim:true},
	zipcode:{type: String,required: true,trim:true},
	country: {type: String,required: true,trim:true},
	favoriteWord: {type: String,required: true,trim:true},
	password: {type: String,required: true,trim:true},
	authorization: {type: String,enum:["admin","teamleader","teammemebr"],required:true,default:"teammember",trim:true},
	company:{type:Schema.Types.ObjectId,required:true},
	team: {type:Schema.Types.ObjectId,required:false}

})

employeeSchema.virtual('fullname').get(()=>{
	return this.firstName+this.lastName
})

employeeSchema.set('toJSON',{virtuals: true});
employeeSchema.set('toObject',{virtuals: true});

const employeeModel = mongoose.model("employee",employeeSchema)

export default employeeModel