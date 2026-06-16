import mongoose , {Schema} from "mongoose";


const  userSchema = new Schema(
    {
        username: {
            type:string ,
            required:true,
            unique:true,

        },
        email: {
            required:true,
            unique:true,
        } ,
        password: {
            required:true,
            
        }
    } ,{timestamps:true}
)