import express-async-handler from "express-async-handler" 

const asynchandler = express-async-handler 

exports.teamcreation = asynchandler (async(req,res,next)=>{
    res.send("Not Implemented: team creation....")
})

exports.teamdeletion = asynchandler (async (req,res,next)=>{
    res.send("Not Implemented: team deletion...")
})

exports.addMemeber = asynchandler (async (req,res,next) =>{
    res.send("Not implemented: Memeber addition ")
})

exports.removeMemeber = asynchandler (async (req,res,next)=>{
    res.send("Not implemented: Memeber Removal.....")
})