import express from "express"
import dotenv from "dotenv"
import cors from "cors"
dotenv.config(".env")
import connectDB from "./config/connectDB.js";
import router from "./routes/authRoutes.js";
import songRouter from "./routes/songRoutes.js";


const PORT=process.env.PORT || 5001;


const app=express();
app.use(express.json());

//connect your database

connectDB();

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}))

app.use("/api/auth",router)
app.use("/api/songs",songRouter)

app.listen(PORT , ()=>console.log(`Server is running on port ${PORT}`));