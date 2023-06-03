const User = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports ={
    postSignup:async(req,res)=>{
        // let userSignup ={
        //     Status :false,
        //     message :null
        // }
        
        let {username,email,password,mobile} = req.body
        console.log(req.body.password);
        let user = await User.findOne({email:email})
            if(user){
                res.json({status:false,message:'email already exists'})
            }else if(req.body.otp){
                const password1 = await bcrypt.hash(password,10)
                console.log('created');
                User.create({
                    username:username,
                    email:email,
                    password:password1,
                    mobile:mobile
                }).then((data)=>{
                    // userSignup.Status = true,
                    res.status(200).json({status:true})
                })
            }else{
                res.status(200).json({status:true})
            } 
        
    },
    
    postSignin:async(req,res)=>{
        try {
            
        let userData = await User.findOne({email:req.body.email})
        console.log(userData,'ghj');
        if(userData){
            console.log('sdf');
            const passwordMatch =await bcrypt.compare(req.body.password,userData.password)
            if(passwordMatch){
                console.log('h');
                const username = userData.username
                let token = jwt.sign({id:userData._id},'secretCodeforUSer',{expiresIn:'5d'})
                res.json({message:"Login Successful",status:true,token,username})
            }else{
                res.json({message:'password is incorrect',status:false})
            }
        }else{
            res.json({message:'email does not exist',status:false})
        }
    } catch (error) {
        console.log(error);
        res.json({message:'something gone wrong',status:false})
    }
}
}