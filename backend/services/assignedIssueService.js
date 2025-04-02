import assignedIssueModel from '../models/assignedIssueModel.js'
import connectDb from '../config/dbConnect.js'
import saveModel from '../config/saveModel.js'
import mongoose from 'mongoose'

const db = "mongodb://127.0.0.1/newDb"; 
connectDb(db)

let sampleIssue={
    "topic": "Server Downtime",
    "description": "The server has been down for over 2 hours, causing disruptions to the service. Needs immediate attention.",
    "assignedAt": "2025-03-18T09:00:00Z",
    "urgency": "urgent",
    "team": "60d7bdc1b4f8f084a7b0c6a7"  // This would be the ObjectId of a team document in the "teams" collection
  }
  


