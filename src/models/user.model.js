import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const userSchema =  new Schema(
    {
        username :{
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true

        },
        fullName:{
            type: String,
            required: true,
            trim: true,
            index: true

        },
        avatar: {
            type: String,   // cloudinary url
            required: true
        },
        coverImage: {
            type: String,  // cloudinary url
            
        },
        watchHistory:[
            {
            type: Schema.Types.ObjectId,
            ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at Uppercase, Lowercase, Number and Symbol"],
            maxlength: [20, "Password must be at Uppercase, Lowercase, Number and Symbol"],
            
        },
        refreshToken: {
            type: String

        }

    },{
        
            timestamps: true
        
    }
    )


    // pre save hook to hash password before saving to the database
userSchema.pre("save", async function(next){
    if(!this.isModified("password"))
         return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// method to check if the password is correct or not
userSchema.methods.isPasswordMatched = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}

// method to generate JWT token
userSchema.methods.generateAccessToken = function(){
return jwt.sign(
    {
        id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
        password: this.password
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
) 
}

// method to generate refresh token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
} 




export const User = mongoose.model("User", userSchema)
