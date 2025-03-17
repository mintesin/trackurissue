import expressAsyncHandler from 'express-async-handler';

const asynchandler =expressAsyncHandler

export const issuelist = asynchandler(async(req,res,next)=>{
    res.send("Not implemented:list of Created Issue... ")
})


export const issueCreateGet = asynchandler(async(req,res,next)=>{
    res.send("Not implemented: Create Issue... ")
}) 
export const issueCreatePost = asynchandler(async(req,res,next)=>{
    res.send("Not implemented: Create Issue... post")
})

export const issueDeleteGet = asynchandler(async(req,res,next)=>{
    res.send("Not implmented: deleting issue")
})
export const issueDeletePost = asynchandler(async(req,res,next)=>{
    res.send("Not implmented: deleting issue post")
})

export const editIssueGet = asynchandler(async (req,res,next) =>{
    res.send("Not implement: edit Issue....")
})
export const editIssuePost = asynchandler(async (req,res,next) =>{
    res.send("Not implement: edit Issue....post")
})


export const assignIssueGet = asynchandler (async(req,res,next)=>{
    res.send("Not implemented: assigning issue")
})
export const assignIssuePost = asynchandler (async(req,res,next)=>{
    res.send("Not implemented: assigning issue ...post")
})