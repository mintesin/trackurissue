import mongoose from 'mongoose'
import companyModel from '../models/companyModel.js'
import teamModel from '../models/teamModel.js'
import employeeModel from '../models/employeeModel.js'
import crIssueModel from '../models/createdIssueModel.js'

import * as  genericError from './genericError.js'


/**
 * Gets default company registration form data
 * @returns {Object} Default company registration form values
 */
export const registerGet = () => {
        const companyDetail = {
    
                companyName:'',
                adminName: '',
                shortDescription:'',
                adminEmail:'',
                streetNumber:'',
                city:'',
                state:'',
                zipcode:'',
                country:'',
                favoriteWord: ' ',
                password: ' '
        }
        return {...companyDetail}
}

/**
 * Registers a new company
 * @param {Object} companyData - Company registration data
 * @returns {Promise<Object>} The created company instance
 * @throws {Error} If registration fails
 */
export const registerPost = async (companyData) => {
       
        try{

        let companyInstance = new companyModel(companyData)
        await companyInstance.save() 
        return companyInstance
        }
        catch(err){
                throw new genericError.NotSuccessFul("Registration is not successful")
        }
}

/**
 * Gets default company login form data
 * @returns {Object} Default company login form values
 */
export const loginGet = () => {
        const companyCredentials = {
                adminEmail:'',
                password: ' ',
        }
        return {...companyCredentials}
}

/**
 * Authenticates a company admin
 * @param {Object} companyCredentials - Login credentials (adminEmail, password)
 * @returns {Promise<Object>} The authenticated company
 * @throws {Error} If login fails (invalid email or password)
 */
export const loginPost = async (companyCredentials) => {
        try{
           const companyFound = await companyModel.findOne({adminEmail:companyCredentials.adminEmail})
           if(!companyFound){
                throw new genericError.notFoundError("You are not registered here")
           }
           //encryption to be added later
           //hashing to be added later
           //session token generation to be done later 
           if(companyFound.password !== companyCredentials.password){
                throw new genericError.ConflictError("Incorrect password")
           }
           return companyFound
        }  
        catch(err) {
                throw new genericError.loginFailed("Login not successful")
}

}

/**
 * Gets default password reset form data
 * @returns {Object} Default password reset form values
 */
export const resetAccountGet = () => {
        let resetDetail = {
                adminEmail:'',
                favoriteWord: ' ',
                newPassword: ' ',


        }
        return {... resetDetail}
}
/**
 * Resets a company admin's password
 * @param {Object} resetCredentials - Reset credentials (adminEmail, favoriteWord, newPassword)
 * @returns {Promise<Object>} Reset details
 * @throws {Error} If password reset fails (invalid email or security word)
 */
export const resetAccountPost = async (resetCredentials) =>
        {
        try {
                const company = await companyModel.findOne({adminEmail: resetCredentials.adminEmail})
                if(!company)
                        {
                        throw new genericError.notFoundError("The user is not registered")
                }
                if (company.favoriteWord === resetCredentials.favoriteWord){
                        company.password = resetCredentials.password
                        await company.save()
                }

        } catch(err){
                throw new genericError.NotSuccessFul("updating password is impossible")
        }

}

/**
 * Gets comprehensive company dashboard data including:
 * - Company details
 * - Employees list
 * - Teams list
 * - Created issues
 * @param {string} companyId - The company ID
 * @returns {Promise<Object>} Dashboard data object containing:
 *   - company: Basic company info
 *   - employees: List of employees
 *   - teams: List of teams
 *   - createdIssues: List of created issues
 * @throws {genericError.notFoundError} If company not found
 * @throws {genericError.NotSuccessFul} If data fetching fails
 */
export const companyHome = (companyId) => {
        try{
              let [companyData, employeesData,teamsData,createdIssuesData] = Promise.all([
                        companyModel.findById(companyId)
                                .select("companyName adminName shortDescription adminEmail")
                                .lean(),
                        employeeModel.find({company:companyId})
                                .select("employeeEmail firstName lastName authorization")
                                .lean(),
                        teamModel.find({company:companyId})
                                .select("teamName teamAdmin")
                                .lean(),                              
                        crIssueModel.find({company:companyId})
                                .select("topic description createdAt createdBy urgency status")
                                .lean()

              ])
        if(!companyData){
                throw new genericError.notFoundError("The team not found")
        }   
              return {
                company: companyData,
                employees: employeesData,
                teams: teamsData,
                createdIssues: createdIssuesData

        }
        }
        catch(err){
                  throw new genericError.NotSuccessFul("Fetching company data not successful")
        }
}
