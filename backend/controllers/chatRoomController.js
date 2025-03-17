import expressAsyncHandler from 'express-async-handler';

const asynchandler =expressAsyncHandler

export const createRoomGet = asynchandler(async (req,res,next)=>{
	res.send("Not Implemented: create room")
})

export const createRoomPost = asynchandler(async (req,res,next)=>{
	res.send("Not Implemented: create room post")
})


export const deleteRoomGet = asynchandler(async (req,res,next)=>{
	res.send("Not Implemented: delete the room")
})
export const deleteRoomPost = asynchandler(async (req,res,next)=>{
	res.send("Not Implemented: delete the room post ")
})


export const chatInTheroomGet = asynchandler (async (req,res,next)=>{
	res.send("Not Implemted : chat in the room")
})
export const chatInTheroomPost = asynchandler (async (req,res,next)=>{
	res.send("Not Implemted : chat in the room")
})


