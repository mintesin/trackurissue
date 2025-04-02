import mongoose from 'mongoose'
import companyModel from '../models/companyModel.js'




export const registerGet = ()=>{
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
        }
        return {...companyDetail}
}

export const registerPost = async (companyData) =>{
       
        try{

        let companyInstance = new companyModel(companyData)
        await companyInstance.save() 
        return companyInstance
        }
        catch(err){
                throw new Error("Registration failed because of: "+ err.message)
        }
}

export const loginGet = ()=>{
        const companyCredentials = {
                adminEmail:'',
                password: ' ',
        }
        return {...companyCredentials}
}

export const loginPost = async (companyCredentials) =>{
        try{
           const companyFound = await companyModel.findOne({companyCredentials.adminEmail})
           if(!companyFound){
                throw new Error("You are not registered here")
           }
           //encryption to be added later
           //hashing to be addded later
           //session token generation to be done later 
           if(companyFound.password !== companyCredentials.password){
                throw new Error("Incorrect password")
           }
           return companyFound
        }
        catch(err) {
                throw new Error("Login failed: "+ err.message)
}

}


