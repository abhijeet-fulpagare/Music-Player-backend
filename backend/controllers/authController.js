import imagekit from "../config/imageKit.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import crypto from "crypto"
import sendMail from "../utils/sendEmail.js";
dotenv.config();

const createToken=(userId )=>{
    return jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});
}


const signup=async(req,res)=>{
    
    try{
        const{name,email,password,avatar}=req.body;
        
        //check the data is correct or not
        if(!name || !email || !password)
        {
            return res.status(400).json({message:"Name EmailId Password are Required"})
        }
        
        const existingUser= await User.findOne({email:email})

        if(existingUser)
        {
            return res.status(400).json({message:"EmailId already Exists"})
        }
        
        let avatarUrl="";
        if(avatar) {
            const uploadRespone=await imagekit.upload({
                file:avatar,
                fileName:`avatar_${Date.now()}.jpg`,
                folder:"/music-player"
            })

            avatarUrl=uploadRespone.url;
        }

        const user=await User.create({name,email,password,avatarUrl})
         
        const token=createToken(user._id);
        res.status(201).json({message:"user created successfully",
        user:{
            id:user._id,
            name:user.name,
            email:user.email,
            avatar:user.avatar
        },
        token,
    })
    }
    catch(e){
       console.log("sign up not successfull")
       res.status(500).json({message:"signup error"})
    }
}

const login=async(req,res)=>{

    try{
        const {email,password}=req.body;

        if(!email || !password)
        {
            res.status(400).json({message:"Email and Password are Required"})
        }

        const user=await User.findOne({
            email:email
        })

        if(!user){
            return res.status(400).json({message:"Email ID does'nt exists"})
        }

        const isMatch=await user.comparePassword(password);

        if(!isMatch)
        {
            return res.status(400).json({message:"Invalid Credentials"})
        }
        
        const token=createToken(user._id);
        res.status(200).json({message:"User login successfully",
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                avatar:user.avatar
                },
                token
        })
        
    }catch(e){
       console.log("Login not successfull",e.message)
       res.status(500).json({message:"Login error"})
    }
}

// protected controller
const getMe=async (req,res)=>{
     
    if(!req.user)
    {
        return res.status(401).json({message:"Not Authenticated"})

    }
    res.status(200).json(req.user)
}

const forgotPassword=async(req,res)=>{
   try{
     const {email}=req.body;
     if(!email){
        return res.status(400).json({message:"Email is required"});
     }
     const user = await User.findOne({email});
        if(!user){
           return res.status(404).json({message:"NO user found"});
        }
        
        //Generated a Token
        const resetToken=crypto.randomBytes(32).toString("hex");

        // hash token before saving
        const hashedToken=crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken=hashedToken
        user.resetPasswordTokenExpiers=Date.now()+10*60*1000; // 10 min

        await user.save();
        const resetUrl=`${process.env.FRONTEND_URL}/reset-password/${resetToken}`

        //send an email
        
        await sendMail(
        {   to:user.email,
            subject:"reset your password",
            html:`<h3>password reset</h3>
            <p>Click on the link below to reset password</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link expires in 10 minutes</p>
            `
        });

        res.status(200).json({message:"Password reset email send"})

   }catch(e){
       console.error("forgot password error:",e.message);
       res.status(500).json({message:"Something went Wrong"})
   }
}

const resetPassword=async(req,res)=>{

    try{
        const {token}=req.params;
        const {password}=req.body;

        if(!password || password.length < 6){
            return res.status(400).json({message:"Password must be atleat 6 characters"})
        }
        
        const hashedToken=crypto.createHash("sha256").update(token).digest("hex");

        const user =await User.findOne({
            resetPasswordToken:hashedToken,
            resetPasswordTokenExpiers:{$gt:Date.now()}
        })

        if(!user)
        {
            return res.status(400).json({message:"Token is invalid or Expired"});
        }

        user.password=password;
        user.resetPasswordToken=undefined;
        user.resetPasswordTokenExpiers=undefined;

        await user.save();

        res.status(200).json({message:"Password updated Successfully"});
    }
    catch(e){
       console.error("Reset password error:",e.message);
       res.status(500).json({message:"Something went Wrong"})
    }

}

const editProfile=async(req,res)=>{
   try{
       const userId=req.user?.id
       if(!userId){
        return res.status(401).json({message:"Not authenticated"})
       }

       const {name,email,avatar,currentPassword,newPassword}=req.body;
       
       const user=await User.findById(userId)
       if(name) user.name=name;
       if(email) user.email=email;

       if(currentPassword || newPassword)
        {
            if(!currentPassword || !newPassword){
                    return res.status(400).json({message:"Both current and new password are required"});
            }
            
            
            const isMatch =await user.comparePassword(currentPassword);

            if(!isMatch){
                return res.status(400).json({message:"Current password is incorrect"})
            }

            if(newPassword.length < 6)
            {
                return res.status(400).json({message:"Password must be atleast 6 characters"})
            }

            user.password=newPassword;
        }

        if(avatar){
            const uploadRespone=await imagekit.upload({
                file:avatar,
                fileName:`${userId}_${Date.now()}.jpg`,
                folder:"/music-player"
            });

            user.avatar=uploadRespone.url

         }
        await user.save();

        return res.status(200).json(
        {
                user:{id:user._id,
                name:user.name,
                email:user.email,
                avatar:user.avatar,},
                message:"profile udated Successfully"
        })

        

   }
   catch(e){
      console.error("Edit profile Error",e.message);
      res.status(400).json({message:"Error in updating profile"});
   }
}

export {signup,login,getMe,forgotPassword,resetPassword,editProfile}