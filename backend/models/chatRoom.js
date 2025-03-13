/*
this is the model for the  chat room
1. room name
2. team
3. messages
*/

import mongoose from 'mongoose' 

const Schema = mongoose.Schema
const roomSchema = new Schema({
	roomName:String,
	// messages :[collection of messages here]
	// ownerTeam: object id
}) 

const roomModel = mongoose.Model("Room",roomSchema)

export default roomModel