import express from 'express'
import * as companyControllers from './controllers/companyControllers.js'; 
import * as assignedIssueControllers from './controllers/assignedIssueController.js';
import * as chatRoomControllers from './controllers/chatRoomController.js';
import * as createdIssueControllers from './controllers/createdIssueContoller.js';
import * as employeeControllers from './controllers/employeeController.js';
import * as teamControllers from './controllers/teamController.js';     
const app = express()

// NOTE PARAMETERS TO THE POST ROUTES SHOULD BE ADDED


// Company routes
app.get('/admin', companyControllers.companydashboard);
app.get('/admin/register', companyControllers.registerCompanyGet) ///registstration is get method or post method
app.post('/admin/register',companyControllers.registerCompanyPost)
app.get('/admin/login' , companyControllers.loginCompanyGet)
app.post('/admin/login',companyControllers.loginCompanypost)
app.get('/admin/reset', companyControllers.resetAccountGet) 
app.post('/admin/reset',companyControllers.resetAccountPost)


//assigned Issue routes 
app.get('/team',teamControllers.teamdashboard)
app.get('/team/assignedissues', assignedIssueControllers.assignedIssueList) // this might be optional 
app.get('/team/issuesolve', assignedIssueControllers.assignedIssueSolveGet) 
app.post('/team/issuesolve',assignedIssueControllers.assignedIssueSolvePost)
app.get('admin/teamcreate',teamControllers.teamcreationGet)
app.get('/admin/teamdelete',teamControllers.teamdeletionGet)
app.get('/admin/addmemeber',teamControllers.addMemeberGet)
app.get('/admin/removemmeber',teamControllers.removeMemeberGet)
app.get('/admin/')



// //created Issue routes

app.get('/admin/createdissues', createdIssueControllers.issuelist)
app.post('/admin/create',createdIssueControllers.issueCreatePost)
app.get('/admin/deleteissues', createdIssueControllers.issueDeleteGet)
app.post('/admin/deleteissues', createdIssueControllers.issueDeletePost)
app.get('/admin/createissue', createdIssueControllers.issueCreateGet)
app.get('/admin/assignissue', createdIssueControllers.assignIssueGet)
app.post('/admin/assignissue', createdIssueControllers.assignIssuePost)
app.get('/admin/editissue', createdIssueControllers.editIssueGet )
app.get('/admin/editissue', createdIssueControllers.editIssuePost) 

//room creation but it is optional it can be created by default and deleted whenever the team got deleted
app.get('/admin/createroom', chatRoomControllers.createRoomGet)
app.post('/admin/createroom',chatRoomControllers.createRoomPost)
app.get('/admin/deleteroom', chatRoomControllers.deleteRoomGet)//parameters to be transferred 
app.post('/admin/deleteroom',chatRoomControllers.deleteRoomPost) //parameters to be transferred 

//employee 

app.get('/user/login', employeeControllers.employeeLoginGet)
app.post('/user/login',employeeControllers.employeeLoginPost)
app.get('/user/reset', employeeControllers.resetAccountGet)
app.post('/user/reset',employeeControllers.resetAccountpost)
app.get('user/chat',chatRoomControllers.chatInTheroomGet)
app.post('user/chat',chatRoomControllers.chatInTheroomPost)
app.get('/admin/useregistration',employeeControllers.employeeregisterGet)
app.post('/admin/useregistration',employeeControllers.employeeregisterPost)

app.listen(3000,()=>{
    console.log(`The page is running http://localhost:3000`)
})



