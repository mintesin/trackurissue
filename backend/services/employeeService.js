import mongoose from 'mongoose'
import employeeModel from '../models/employeeModel'
import * as genericError from './genericError'

//login
//logout
//reset password
//

export const employeeLoginGet = ()=>{
    let employeecredentials ={
        employeeEmail:'',
        password:''
    }
    return {... employeecredentials}
} 

export const employeeLoginPost = async(employeecredentials)=>{
    try{
            let employee= await employeeModel.findOne({employeeEmail: employeecredentials.employeeEmail})
            if(!employee){
                throw new genericError.notFoundError('Employee not registered')
            }
            if(employee.password === employeecredentials.password){
                return employee
            }
            else {
                throw new genericError.AuthorizationError("Login failed")
            }
    }
    catch(err) {
             throw new genericError.NotSuccessFul('Login not successful: ' + err.message)
    }
}

export const employeeResetAccountGet = ()=>{
    let recoveryCredentials = {
        favoriteWord: ' ',
        employeeEmail:'',
        password: ' '
    }
    return {...recoveryCredentials}
}

export const employeeResetAccountPost = async(recoveryCredentials)=> {
    try{
        let employee = await employeeModel.findOne({employeeEmail: recoveryCredentials.employeeEmail})
        if(!employee){
            throw new genericError.notFoundError("employee not registered")
        }
        if(employee.favoriteWord === recoveryCredentials.favoriteWord){
            employee.password = recoveryCredentials.password    
            await employee.save()
            return employee 
        }
        
    }
    catch(err){
        throw new genericError.NotSuccessFul("password recovery not successful")
    }
}

export const employeeDergisterGet = async (id)=>{
    try{}
    catch(err){}

}

export const employeeDergisterPost = async (id)=>{
    try{}
    catch(err){}
}

