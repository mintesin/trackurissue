import express from 'express' 
import * as companyControllers from '../controllers/companyControllers.js'; 
import * as assignedIssueControllers from '../controllers/assignedIssueController.js';
import * as chatRoomControllers from '../controllers/chatRoomController.js';
import * as createdIssueControllers from '../controllers/createdIssueContoller.js';
import * as employeeControllers from '../controllers/employeeController.js';
import * as teamControllers from '../controllers/teamController.js';  
const router = express.Router()


router.get('/',teamControllers.teamdashboard)
router.get('/login', employeeControllers.employeeLoginGet)
router.post('/login',employeeControllers.employeeLoginPost)
router.get('/reset', employeeControllers.resetAccountGet)
router.post('/reset',employeeControllers.resetAccountpost)
router.get('/chat',chatRoomControllers.chatInTheroomGet)
router.post('/chat',chatRoomControllers.chatInTheroomPost)
router.post('/solveissue',assignedIssueControllers.assignedIssueSolvePost)


router.get('/team',teamControllers.teamdashboard)
router.get('/team/assignedissues', assignedIssueControllers.assignedIssueList) // this might be optional 
router.get('/team/issuesolve', assignedIssueControllers.assignedIssueSolveGet) 
router.post('/team/issuesolve',assignedIssueControllers.assignedIssueSolvePost)

export default router
