import mongoose from 'mongoose'
import crIssueModel from '../models/createdIssueModel'
import teamModel from '../models/teamModel'
import assignedIssueModel from '../models/assignedIssueModel'
import notFoundError from './genericError'


export const createIssueGet = ()=>
{
    let issueDate = {
        "topic": "",
        "description": "",
        "createdAt": "",
        "createdBy": "",
        "urgency": "",
        "status": "",
        "company": ""
      } 

      return { ... issueDate}
}
export const createIssuePost = async ( issueDetail)=>{
    try{
        let issueInstance = new crIssueModel(issueDetail)
        await issueInstance.save()
        return issueInstance
    }
    catch(err){
        throw new Error("Creating the Issue has failed: " + err.message)
    }
}

export const deleteIssuePost = async(id) =>{
    try{
        let deletedIssue = await crIssueModel.findByIdAndDelete({id})
         if(!deletedIssue){
            throw new Error("The issue not found")
         }
         return deletedIssue
    }
    catch(err){
        throw new Error("The Error: " + err.message)
    }
} 

export const editIssueGet = async (issueId)=>{
    try{
        let editedIssue = await crIssueModel.findById({issueId})
        if(!editedIssue){
           throw new Error("The issue not found")
        }
        return deletedIssue 
    }
    catch(err) {
            throw new Error("The Error is: " + err.message)
    }
}

export const editedIssuePost = async(issueId, updatedData)=>{
    //The status must be changed to the "edited and do it in the controller"
   
    try{
        let theIssue = await crIssueModel.findByIdAndUpdate(issueId,updatedData, {new:true})
        if(!theIssue){
            throw new Error("There is no such issue created")
        }

    }
    catch(err) {
        throw new Error("The Error: " + err.message)
    }
} 

export const solveIssuePost = async (id)=>{
    //the status must be changed to the "solved" here and consider this in the controller side
     //this must be invoked from the edit issue page
    // let solvedIssue = await () 
}

export const assignIssue = async(issueId, teamId,assignedIssueData)=>{
    try{
           let [theIssue, theTeam] = Promise.all([
              crIssueModel.findOne({issueId}),
              teamModel.findOne({teamId})
           ])
           if(!theIssue){
            throw new Error("The issue is not found")
           }
           if(!theTeam){
            throw new Error("The team is not found")
           }
           let assignedIssueInstance = new assignedIssueModel(assignedIssueData) 
           await assignedIssueData.save()
}
    catch(err) {
        throw new Error("The error: " + err.message)
    }

}