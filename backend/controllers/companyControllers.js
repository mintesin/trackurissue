
// th eone chnaing is htis one

import expressAsyncHandler from 'express-async-handler';

const asynchandler =expressAsyncHandler

export const companydashboard = expressAsyncHandler(async (req, res, next) => {
    res.send("Not implemented: company dashboard");
});
export const registerCompanyGet = asynchandler (async(req,res,next)=>{
    res.send("Not implemented: Company registration")
}) 

export const registerCompanyPost = asynchandler (async(req,res,next)=>{
    res.send("Not implemented: Company registration post")
}) 

export const loginCompanyGet = asynchandler(async(req,res,next)=>{
    res.send("Not Implemented: Company Login")
})
export const loginCompanypost = asynchandler(async(req,res,next)=>{
    res.send("Not Implemented: Company Login post")
})

export const resetAccountGet = asynchandler(async (req,res,next)=>{
    res.send("Not Implemented: Account Reset")
}) 
export const resetAccountPost = asynchandler(async (req,res,next)=>{
    res.send("Not Implemented: Account Reset post")
})


