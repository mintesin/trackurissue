import mongoose from "mongoose" 

async functionn dbConnect(db){
	try{
		await mongoose.connect(db)
		console.log("The database is connected successfully")
	}
	catch(err){
		throw new Error(`Connection to ${db} has failed`)
	}
}