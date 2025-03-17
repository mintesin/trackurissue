import expressAsyncHandler from 'express-async-handler';

const asynchandler =expressAsyncHandler

export const teamdashboard = asynchandler (async(req,res,next)=>{
    res.send("Not Implemented: team dashboard....")
})

export const teamcreationGet = asynchandler (async(req,res,next)=>{
    res.send("Not Implemented: team creation....")
})

export const teamdeletionGet = asynchandler (async (req,res,next)=>{
    res.send("Not Implemented: team deletion...")
})

export const addMemeberGet = asynchandler (async (req,res,next) =>{
    res.send("Not implemented: Memeber addition ")
})

export const removeMemeberGet = asynchandler (async (req,res,next)=>{
    res.send("Not implemented: Memeber Removal.....")
})