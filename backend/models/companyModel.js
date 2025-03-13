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
	companyName:String,
	adminName: String,
	shortDescription:String,
	adminEmail:String,
	streetNumber:Number,
	city:String,
	state: String,
	zipcode:Number,
	country:String
})

const companyModel = mongoose.model("company",companySchema)

export default companyModel