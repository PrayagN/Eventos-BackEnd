const Organizer = require('../models/organizerModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


module.exports ={
    checkExist:async(req,res)=>{
        try {
            console.log(req.body);
            let email = req.body.email
            let exist = await Organizer.findOne({email})
            if(exist){
                res.json({message:'email already exists'})
            }else{
                res.json({status:true})
            }
        
    }catch (error) {
        res.json({message:error})
    }
},
    postSignup:async(req,res)=>{
        try {
            let {organizerName,email,password,mobile} =req.body
        console.log(req.body.password);
        let organizer = await Organizer.findOne({email:email})
            if(organizer){
                res.json({status:false,message:'email already exists'})
            }else if(req.body.otp){
                const password1 = await bcrypt.hash(password,10)
                console.log('created');
                Organizer.create({
                    organizerName:organizerName,
                    email:email,
                    password:password1,
                    mobile:mobile
                }).then((data)=>{
                    userSignup.Status = true,
                    res.status(200).json({status:true})
                })
            }else{
                res.status(200).json({status:true})
            } 
        }catch (error) {
            res.json({message:'something gone wrong',status:false})
        }
   
    },
postSignin:async(req,res)=>{
    try {
        console.log(req.body);
    let organizerData = await Organizer.findOne({email:req.body.email})
    if(organizerData){
        console.log('sdf');
        const passwordMatch =await bcrypt.compare(req.body.password,organizerData.password)
        if(passwordMatch){
            console.log('h');
            const organizerName = organizerData.organizerName
            let token = jwt.sign({id:organizerData._id},'secretCodeforUSer',{expiresIn:'30d'})
            res.json({message:"Login Successful",status:true,token,organizerName})
        }else{
            res.json({message:'password is incorrect',status:false})
        }
    }else{
        res.json({message:'email does not exist',status:false})
    }
} catch (error) {
    res.json({message:'something gone wrong',status:false})
}
}
}