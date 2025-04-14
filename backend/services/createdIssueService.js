import mongoose from 'mongoose'
import crIssueModel from '../models/createdIssueModel.js'
import teamModel from '../models/teamModel.js'
import assignedIssueModel from '../models/assignedIssueModel.js'
import * as genericError from './genericError.js'

/**
 * Gets default values for creating a new issue
 * @returns {Object} Default issue data structure with empty fields
 */
export const createIssueGet = () => {
    let issueDate = {
        "topic": "",
        "description": "",
        "createdAt": "",
        "createdBy": "",
        "urgency": "",
        "status": "",
        "company": ""
    } 
    return { ...issueDate }
}

/**
 * Creates a new issue in the database
 * @param {Object} issueDetail - The issue data to create
 * @returns {Promise<Object>} The created issue instance
 * @throws {genericError.NotSuccessFul} If creation fails
 */
export const createIssuePost = async (issueDetail) => {
    try {
        let issueInstance = new crIssueModel(issueDetail)
        await issueInstance.save()
        return issueInstance
    }
    catch(err) {
        throw new genericError.NotSuccessFul("Creating the Issue has failed")
    }
}

/**
 * Deletes an issue by ID
 * @param {string} id - The ID of the issue to delete
 * @returns {Promise<Object>} The deleted issue
 * @throws {genericError.notFoundError} If issue not found
 * @throws {genericError.NotSuccessFul} If deletion fails
 */
export const deleteIssuePost = async (id) => {
    try {
        let deletedIssue = await crIssueModel.findByIdAndDelete({id})
        if(!deletedIssue) {
            throw new genericError.notFoundError("The issue not found")
        }
        return deletedIssue
    }
    catch(err) {
        throw new genericError.NotSuccessFul("The Issue is not deleted")
    }
} 

/**
 * Gets an issue for editing
 * @param {string} issueId - The ID of the issue to edit
 * @returns {Promise<Object>} The issue data
 * @throws {genericError.notFoundError} If issue not found
 * @throws {genericError.NotSuccessFul} If retrieval fails
 */
export const editIssueGet = async (issueId) => {
    try {
        let editedIssue = await crIssueModel.findById({issueId})
        if(!editedIssue) {
            throw new genericError.notFoundError("The issue not found")
        }
        return editedIssue 
    }
    catch(err) {
        throw new genericError.NotSuccessFul("The Issue is not successfully edited")
    }
}

/**
 * Updates an existing issue with new data and marks it as "edited"
 * @param {string} issueId - The ID of the issue to update
 * @param {Object} updatedData - The new data to merge with the existing issue
 * @throws {Error} If the issue doesn't exist or update fails
 * @description 
 * - Automatically sets status to "edited"
 * - Merges existing issue data with updated data
 * - Saves the combined data back to database
 */
export const editedIssuePost = async (issueId, updatedData) => {
    updatedData.status = "edited"
   
    try {
        let theIssue = await crIssueModel.findByIdAndUpdate(issueId,updatedData,{new: true})
        if (!theIssue) {
            throw new Error("There is no such issue created")
        }

        let newData = {...theIssue._doc, ...updatedData}
        await newData.save()
    }
    catch (err) {
        throw new Error("Failed to update issue: " + err.message)
    }
}

/**
 * Marks an issue as solved (TODO: implementation pending)
 * @param {string} id - The ID of the issue to mark as solved
 */
export const solveIssuePost = async (id) => {
    // TODO: Implement status change to "solved"
    // This must be invoked from the edit issue page
}

/**
 * Assigns an issue to a team
 * @param {string} issueId - The ID of the issue to assign
 * @param {string} teamId - The ID of the team to assign to
 * @param {Object} assignedIssueData - Additional assignment data
 * @throws {Error} If issue or team not found, or assignment fails
 */
export const assignIssue = async (issueId, teamId, assignedIssueData) => {
    try {
        let [theIssue, theTeam] = await Promise.all([
            crIssueModel.findOne({issueId}),
            teamModel.findOne({teamId})
        ])
        if(!theIssue) {
            throw new Error("The issue is not found")
        }
        if(!theTeam) {
            throw new Error("The team is not found")
        }
        theIssue.status = "assigned"
        
        let assignedIssueInstance = new assignedIssueModel(assignedIssueData) 
        Promise.all([
            theIssue.save(),
            await assignedIssueInstance.save()

        ])
        
    }
    catch(err) {
        throw new Error("The error: " + err.message)
    }
}