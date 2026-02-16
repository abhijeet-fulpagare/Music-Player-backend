import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config({path:"../.env"})


const connectDB= async() =>{
    try{
        const connection=await mongoose.connect(process.env.MONGODB_URI);
        console.log("mongodb connect successfull")
    }
    catch(e)
    {
        console.log("monogdb connection error",e.message);
    }
}

export default connectDB;