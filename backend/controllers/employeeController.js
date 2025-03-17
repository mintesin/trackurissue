import expressAsyncHandler from 'express-async-handler';

const asynchandler =expressAsyncHandler
export const employeeregisterGet = asynchandler (async(req,res,next)=>{
    res.send("Not Implemented: employee Registration....")
}) 

export const employeeregisterPost = asynchandler (async(req,res,next)=>{
    res.send("Not Implemented: employee Registration....Post")
})


export const employeeLoginGet = asynchandler (async(req,res,next)=>{
    res.send("Not Implemented: employee login....")
})

export const employeeLoginPost = asynchandler (async(req,res,next)=>{
    res.send("Not Implemented: employee login.... post")
})

export const resetAccountGet = asynchandler (async (req,res,next)=>{
    res.send("Not implemented:reset your account ")
})
export const resetAccountpost = asynchandler (async (req,res,next)=>{
    res.send("Not implemented:reset your account ...post ")
})


