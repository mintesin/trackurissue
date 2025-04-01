import expressAsyncHandler from 'express-async-handler';
// import express from 'express'
// const db = .locals.db 



const asynchandler =expressAsyncHandler

export const assignedIssueList = asynchandler (async (req,res,next)=>{
	
	res.send("Not IMplemented: Assigned Issue list")
})

export const assignedIssueSolveGet = asynchandler(async (req,res,next)=>{
	res.send("Not Implemented: Assigned Issue solve")
})

export const assignedIssueSolvePost = asynchandler(async (req,res,next)=>{
	res.send("Not Implemented: Assigned Issue solve post")
})


