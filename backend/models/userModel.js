import mongoose from "mongoose";
import bcrypt   from "bcrypt"
const userScheme=new mongoose.Schema({
    name:{
        type:String,
        required :[true,"this is required"],
    },
    email:{
        type:String,
        required:[true,"Email is Required"],
        unique:true,
        lowercase:true,
    },
    password:{
        type:String,
        required:[true,"Password is Required"],
        minLenght:6,
    },
    avatar:{
        type:String,
        default:"",

    },
    resetPasswordToken:String,
    resetPasswordTokenExpiers:Date,


    favourites:[{
        id:{type:String,required:true},
        name:String,
        artist_name:String,
        image:String,
        duration:String,
        audio:String,
    }]
})

//pre save fuction for password
userScheme.pre("save", async function () 
{
    if (!this.isModified("password")) 
        return ;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

//compare password
userScheme.methods.comparePassword=function(enterPassword){
    return bcrypt.compare(enterPassword,this.password)
}

const User=mongoose.model("User",userScheme);

export default User;