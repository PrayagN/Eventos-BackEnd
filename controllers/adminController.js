const Admin = require('../models/adminModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


module.exports ={
    postSignin: async(req,res)=>{
        try {
            
            const {email,password} = req.body
            let adminData = await Admin.findOne({email})
            if(adminData){
                const passwordMatch = await bcrypt.compare(password,adminData.password)
                if(passwordMatch){
                    let token = jwt.sign({id:adminData._id},'secretCodeforAdmin',{expiresIn:'5d'})
                    res.status(200).json({message:'Login Successfull',status:true,token})
                }else{
                    res.json({message:'password is incorrect',status:false})
                }
            }else{
                res.json({message:'email does not exist'})
            }
        } catch (error) {
            res.json({message:'something went wrong'})
        }
        }
}