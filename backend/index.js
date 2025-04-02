import express from 'express'
import adminRoute from './routes/adminRoutes.js'
import userRoute from './routes/employeeRouters.js'
import connectDb from './config/dbConnect.js';
 
import * as assignedIssueControllers from './controllers/assignedIssueController.js';
import * as chatRoomControllers from './controllers/chatRoomController.js';

import * as employeeControllers from './controllers/employeeController.js';
import * as teamControllers from './controllers/teamController.js';     

const app = express()
app.locals.app = app

app.use('/admin',adminRoute)
app.use('/user/',userRoute)


try{
    const uri = "mongodb://127.0.0.1/newDb"; 
    const db = connectDb(uri)
    app.locals.db = db;
    
}
catch(err){throw new Error("the database connection is well")}
// NOTE PARAMETERS TO THE POST ROUTES SHOULD BE ADDED



app.listen(3000,()=>{
    console.log(`The page is running http://localhost:3000`)
})



