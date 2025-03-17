import express-async-handler from "express-async-handler" 

const asynchandler = express-async-handler  

exports.employeeLogin = asynchandler (async(req,res,next)=>{
    res.send("Not Implemented: employee login....")
})

exports.resetAccount = asynchandler (async (req,res,next)=>{
    res.send("Not implemented:reset your account ")
})

