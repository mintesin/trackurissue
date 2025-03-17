import express-async-handler from "express-async-handler" 

const asynchandler = express-async-handler 
exports.assignedIssueList = asynchandler (async (req,res,next)=>{
	res.send("Not IMplemented: Assigned Issue list")
})

exports.assignedIssueSolve = asynchandler(async (req,res,next)=>{
	res.send("Not Implemented: Assigned Issue solve")
})

