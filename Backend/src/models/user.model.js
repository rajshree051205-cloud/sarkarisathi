import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({

    username: 
    { type: String,
       required: true,
       unique: true,
       trim: true
         },
    email: 
    { 
      type: String,
       required: true, 
       unique: true,
        lowercase: true,
         trim: true
         },
    password:
     {
       type: String,
        required: [true, "Password is required"] 
      }
 
    },
    
    { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

// Check password
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        { _id: this._id, email: this.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

export const User = mongoose.model("User", userSchema);