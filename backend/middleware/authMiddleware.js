import User from "../models/userModel.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();

export const protect=async(req,res,next)=>{

    const authHeaders=req.headers.authorization;

    if(!authHeaders || !authHeaders.startsWith("Bearer "))
        return res.status(401).json({meassage:"Not Authorize, missing token"})

    const token=authHeaders.split(" ")[1];

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        const user=await User.findById(decoded.id).select("-password")

        if(!user)
        {
            return res.status(401).json({message:"Not authorized"})
        }

        req.user=user;
        next();
    }
    catch(e){
         console.error("Token verification failed",e.meassage);

         return res.status(401).json({message:"Invaild or expired token"});
    }

}