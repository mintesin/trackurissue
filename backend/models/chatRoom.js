import mongoose from 'mongoose'; // Ensure mongoose is imported correctly

const { Schema } = mongoose; // Destructure Schema from mongoose

// Define a Message Schema (optional, but recommended for structure)
const messageSchema = new Schema({
    content: { type: String, required: true, trim: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming a User model exists
    createdAt: { type: Date, default: Date.now }
});

// Room Schema definition
const roomSchema = new Schema({
    roomName: {
        type: String,
        required: true,
        trim: true
    },
    messages: { 
        type: [messageSchema], 
        required: true,
        default: [] 
    },
    ownerTeam: { 
        type: Schema.Types.ObjectId,
        ref: 'teams', 
        required: true 
    }
}); // Timestamps for room creation/update

// Create the Room Model
const roomModel = mongoose.model("Room", roomSchema); // Use 'model' function

export default roomModel; // Export the room model