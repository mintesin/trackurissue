import mongoose from "mongoose" 

async function connectDb(db){
	try{
		const connection = await mongoose.connect(db)
		
		console.log("The connection is set successfully")
		return connection
	}
	catch(err){
		throw new Error("connection to Mongodb has failed")
	}
}


export default connectDb