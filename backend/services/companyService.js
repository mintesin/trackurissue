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
                favoriteWord: ' ',
                password: ' '
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
           const companyFound = await companyModel.findOne({adminEmail:companyCredentials.adminEmail})
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

export const resetAccountGet = ()=>{
        let resetDetail = {
                adminEmail:'',
                favoriteWord: ' ',
                new_password: ' ',


        }
        return {... resetDetail}
}
export const resetAccountPost = async(resetCredentials)=>
        {
        try {
                const company = await companyModel.findOne({adminEmail: resetCredentials.adminEmail})
                if(!company)
                        {
                        throw new Error("Sorry! This email is not registered at all")
                }
                if (company.favoriteWord === resetCredentials.favoriteWord){
                        company.password = resetCredentials.password
                        await company.save()
                }

        } catch(err){
                throw new Error("updating password is impossible" + err.message)
        }

}
