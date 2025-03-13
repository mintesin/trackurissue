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
	firstName: String,
	lastName: String,
	streetNumber: String,
	city: String,
	state: String,
	zipcode: Number,
	country: String,
	favoriteWord: String,
	password: String
	//comapny object Id must be included

})

const employeeModel = mongoose.model("employee",employeeSchema)