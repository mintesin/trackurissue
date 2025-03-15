/*

This is model for the company which includes
1.company name
2.admin name
3. short description
4. admin email
5. street number 
6. city
7. state province
8. zipcode
9. country




*/
import mongoose from 'mongoose'

const Schema = mongoose.Schema 

const companySchema = new Schema({
	companyName:{
		type: String, 
		required:true, 
		trim:true
	},
	adminName: {
		type: String, 
		required:true, 
		trim:true
	},
	shortDescription:{
		type: String, 
		required:true, 
		trim:true},
	adminEmail:{
		type: String, 
		required:true, 
		trim:true
	},
	streetNumber:{type: Number, 
		required:true, 
		trim:true
	},
	city: {
		type: String, 
		required:true, 
		trim:true
	},
	state: {
		type: String, 
		required:true, 
		trim:true
	},
	zipcode:{
		type: String, 
		required:true, 
		trim:true
	},
	country:{
		type: String, 
		required:true, 
		trim:true
	},  

})



const companyModel = mongoose.model("company",companySchema)

export default companyModel