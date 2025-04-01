const saveModel = (model)=>{
	try 
	{
	return async(data)=>{
		let modelInstance = new model(data)
		await modelInstance.save()
	} 
	}
	catch (err){
		throw new Error(`Saving ${model} model has failed`)
	}
	
}

export default saveModel