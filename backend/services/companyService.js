import companyModel from '../models/companyModel.js'
import mongoose from 'mongoose'
import saveModel from '../config/saveModel.js'


/*
The company can
1.register the company with admin role
2.login in to the account
3. reset the password
4. register the employee
5. deregister the employee
6. create team
7. add members to the team
8. remove members from the teams
9. delete the team
10. create issue
11. assign issue
12. edit issue
13. delete the issue
*/

export const companyRegisterGet = (dbConnection,app)=>{
     // get method
}

export const companyRegisterPost = (dbConnection,app)=>{
    //post method
}

export const companyLoginGet = (dbConnection,app) =>{
    //get method here
}
export const companyLoginPost = (dbConnection,app)=>{
    //post method here
}

export const companyResetAccountGet = (dbConnection,app)=>{
    //get mehtod here
} 

export const companyResetAccountPost = (dbConnection,app) =>{
    //post mehtod here
}

export const registerEmployeeGet = (dbConnection,app)=>{
    //get mehtod here
}

export const registerEmployeePost = (dbConnection,app)=>{
    //post mehtod here
}
export const deregisterEmployeePost = (dbConnection,app)=>{
    //post mehtod here
}

export const createTeamGet = (dbConnection,app)=>{
    //get mehtod create team
}
export const createTeamPost = (dbConnection,app)=>{
    //post method create team
}

export const deleteTeamGet = (dbConnection,app) =>{
    //delete method team get method
}

export const deleteTeamPost = (dbConnection,app) =>{
    //delete team post method
}

export const addTeamMemebersGet = (dbConnection,app)=>{
    //adding memebers to the team get method
}

export const addTeamMemebersPost = (dbConnection,app)=>{
    //adding memebers to the team post method
}

export const removeTeamMemebersGet = (dbConnection,app)=>{
    //delete the team member the get method
}

export const removeTeamMemebersPost = (dbConnection,app)=>{
    //delete the team member the get method
}

export const createIssueGet = (dbConnection,app) =>{
    //get method create issue
}

export const createIssuePost = (dbConnection,app) =>{
    //Post method create issue
} 

export const editIssueGet = (dbConnection,app) => {
    //get method edit issue
}

export const editIssuePost = (dbConnection,app) => {
    //Post method edit issue
}
export const assignIssueGet = (dbConnection,app) =>{
    //get method of assigning issue
}
export const assignIssuePost = (dbConnection,app) =>{
    //post method assigning issue
}

export const deleteIssueGet = (dbConnection,app) =>{
    //get method delete issue
} 

export const deleteIssuePost = (dbConnection,app) =>{
    //get method delete issue
}