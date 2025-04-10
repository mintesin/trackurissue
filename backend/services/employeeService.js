import mongoose from 'mongoose'
import employeeModel from '../models/employeeModel.js'
import teamModel from '../models/teamModel.js'
import * as genericError from './genericError.js'

export const employeeDashboard = async (employeeId) => {
    try {
        const [employee, team] = await Promise.all([
            employeeModel.findById(employeeId)
                .select('firstName lastName employeeEmail authorization team')
                .lean(),
            teamModel.findOne({members: employeeId})
                .select('teamName teamAdmin')
                .lean()
        ]);
        
        if (!employee) {
            throw new genericError.notFoundError('Employee not found');
        }

        return {
            employee,
            team: team || null
        };
    }
    catch (err) {
        throw new genericError.NotSuccessFul('Failed to fetch employee dashboard: ' + err.message);
    }
}

export const employeeRegisterGet = () => {
    const employeeDetail = {
        firstName: '',
        lastName: '',
        employeeEmail: '',
        streetNumber: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        favoriteWord: '',
        password: '',
        company: ''
    };
    return {...employeeDetail};
}

export const employeeRegisterPost = async (employeeData) => {
    try {
        const employeeInstance = new employeeModel(employeeData);
        await employeeInstance.save();
        return employeeInstance;
    }
    catch (err) {
        throw new Error('Registration failed: ' + err.message);
    }
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

export const employeeDeregisterGet = async (id) => {
    try {
        const employee = await employeeModel.findById(id);
        if (!employee) {
            throw new genericError.notFoundError('Employee not found');
        }
        return employee;
    }
    catch (err) {
        throw new genericError.NotSuccessFul('Failed to fetch employee: ' + err.message);
    }
}

export const employeeDeregisterPost = async (id) => {
    try {
        const deletedEmployee = await employeeModel.findByIdAndDelete(id);
        if (!deletedEmployee) {
            throw new genericError.notFoundError('Employee not found');
        }
        return { message: 'Employee deregistered successfully' };
    }
    catch (err) {
        throw new genericError.NotSuccessFul('Deregistration failed: ' + err.message);
    }
}

export const employeeLogout = () => {
    return { message: 'Logout successful' };
}

