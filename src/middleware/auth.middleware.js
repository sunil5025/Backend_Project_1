import { ApiError } from "../utility(utils)/ApiError.js";
import { asyncHandler } from "../utility(utils)/async_handler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";





export const verifyJWT = asyncHandler(async(req, _, next) => {          //  because of res place we are mentioned underscore symbol [ _ ] in the name of the function because res is not used in this function

 try {
      const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
   
      if(!token){
        console.log("No Token Found");
       throw new ApiError(401, "Unauthorized request")
   
      }
   
      // verify the token
     const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET )
      console.log("Decoded Token", decodedToken);
   
     const user = await User.findById(decodedToken?.id).select("-password -refreshToken")
     if(!user){
        console.log("User not found with id", decodedToken?._id);
       throw new ApiError(401, "Invalid Access Token")
     }
   
     req.user = user;
     next()
   
 } catch (error) {
    console.log("Error in JWT verification", error);
    // if the token is expired or invalid, remove the cookies from the browser
    throw new ApiError(401, error?.message || "Invalid Access Token");
    
 }
})