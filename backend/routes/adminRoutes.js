import express from 'express'
import * as companyControllers from '../controllers/companyControllers.js'
import * as teamControllers from '../controllers/teamController.js';   
import * as createdIssueControllers from '../controllers/createdIssueContoller.js';
import * as chatRoomControllers from '../controllers/chatRoomController.js';
import * as employeeControllers from '../controllers/employeeController.js'; 

 
const router = express.Router()

// admin company account management 
router.get('/', companyControllers.companydashboard);
router.get('/register', companyControllers.registerCompanyGet) ///registstration is get method or post method
router.post('/register',companyControllers.registerCompanyPost)
router.get('/login' , companyControllers.loginCompanyGet)
router.post('/login',companyControllers.loginCompanypost)
router.get('/reset', companyControllers.resetAccountGet) 
router.post('/reset',companyControllers.resetAccountPost)

//admin team management routes
router.get('/teamcreate',teamControllers.teamcreationGet)
router.get('/teamdelete',teamControllers.teamdeletionGet)
router.get('/addmemeber',teamControllers.addMemeberGet)
router.get('/removemmeber',teamControllers.removeMemeberGet)

//admin issue management routes
router.get('/createdissues', createdIssueControllers.issuelist)
router.post('/createissue',createdIssueControllers.issueCreatePost)
router.get('/deleteissues', createdIssueControllers.issueDeleteGet)
router.post('/deleteissues', createdIssueControllers.issueDeletePost)
router.get('/createissue', createdIssueControllers.issueCreateGet)
router.get('/assignissue', createdIssueControllers.assignIssueGet)
router.post('/assignissue', createdIssueControllers.assignIssuePost)
router.get('/editissue', createdIssueControllers.editIssueGet )
router.get('/editissue', createdIssueControllers.editIssuePost) 

//admin room management routes 
router.get('/createroom', chatRoomControllers.createRoomGet)
router.post('/createroom',chatRoomControllers.createRoomPost)
router.get('/deleteroom', chatRoomControllers.deleteRoomGet)
router.post('/deleteroom',chatRoomControllers.deleteRoomPost)

//admin employee management routes
router.get('/useregistration',employeeControllers.employeeregisterGet)
router.post('/useregistration',employeeControllers.employeeregisterPost)



export default router