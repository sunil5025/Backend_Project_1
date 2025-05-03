 import {asyncHandler} from "../utility(utils)/async_handler.js";
 import { ApiError} from "../utility(utils)/ApiError.js";
 import {User} from "../models/user.model.js";
 import { uploadOnCloudinary } from "../utility(utils)/cloudniary.js";
 import { ApiResponse } from "../utility(utils)/ApiResponse.js";
 import jwt from "jsonwebtoken";
 import mongoose from "mongoose";



 // generate access token and refresh token
 const generateAccessAndRefreshToken = async(userId) => {
    try {
       const user =  await User.findById(userId)
        const accessToken =  user.generateAccessToken()
         const refreshToken = user.generateRefreshToken()


         user.refreshToken = refreshToken
         await user.save({validateBeforeSave: false}) //// save the refresh token in the database without validating the user model

            return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
 }


 // register user
 // get the data from the request body (for practice purpose)
 const registerUser = asyncHandler(async (req, res) => {





///////////////////////////////////////////////////////////////////////////////
    //// 1. Get the data from the request body (for practice purpose)
        // res.status(200).json({
        //  success: true,
        //  message: "OK"
    // })
//////////////////////////////////////////////////////////////////////////////

    // get user details from fronted
    // validate the data (password) - not empty
    // check if the user already exists (email)
    // check for images, check for avatar
    // upload images to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response [refresh token will be empty but after that also we have to check ]
    // check for user creation
    // return response to the client

    const { fullName, email, username, password } = req.body

    //// this concept also we can use with .some method
    // if(
    //     [fullName, email, username, password].some((field)=>
    //     field?.trim() === "")
    // ){
    //     throw new ApiError(400, "All fields are required")
    // }


    //// get user details from fronted
    if(fullName === "") {
        throw new ApiError(400, "Full name is required")
    }

    if(email === ""){
        throw new ApiError(400, "Email is required")
    }

    if(username === ""){
        throw new ApiError(400, "Username is required")
    }

    if(password === ""){
        throw new ApiError(400, "Password is required")
    }

    // // check if the user already exists (email)
    const exitedUser = await User.findOne({
        $or: [{ email }, { username}]
    })
    if(exitedUser){
        throw new ApiError(400, "User already exists")
    }
    // console.log(req.body);



    // check for images, check for avatar
    // const avatarLocalPath =  req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; //


    // check for avatar image if it is not provided then we can set the default image in the database
    let avatarLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
    avatarLocalPath = req.files.avatar[0].path;
    }
   
   
    // check for cover image if it is not provided then we can set the default image in the database
  
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
       coverImageLocalPath = req.files.coverImage[0].path

    }





    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")

    }

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image is required")


    }
    // upload images to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage =  await uploadOnCloudinary(coverImageLocalPath)


    

    // remove the local files after uploading to cloudinary if it is getting error [because of avatar is required field if we cannot check avatar and avatar is not uploaded to cloudinary then database will be broeken and we cannot remove the local file]
    if(!avatar){
        throw new ApiError(400, "Avatar upload failed")
    }

    if(!coverImage){
        throw new ApiError(400, "Cover image upload failed")
    }

    // console.log(req.files);

    

///// create user object - create entry in db
    // remove password and refresh token field from response [refresh token will be empty but after that also we have to check ]
    // check for user creation
    // return response to the client

    // create user object - create entry in db
   const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage.url || "",
        email,
        password,
        username: username.toLowerCase()

    })


    // finding the user by id and removing the password and refresh token from the response
    const createdUser = await User.findByIdAndUpdate(user._id).select(
        "-password -refreshToken" // remove password and refresh token from response
        
    )

    if(!createdUser){
        throw new ApiError(400, "User creation failed [while registring the user]")
    }


    // Api response  [success, data, message]
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )


 })



 // login user  
 // access token and refresh token

 const loginUser = asyncHandler(async(req, res) => {
    // req body = data
    // username or email
    // find the user
    // password
    // check if the user exists or not
    // check if the password is correct or not
    // generate access token and refresh token
    // send cookie
    // send response to the client


    const {username, email, password} = req.body
    // console.log( email);
    if(!username && !email) {
        throw new ApiError(400, "Username or email is required")
    }
        
      
        
   const user = await User.findOne({
        $or: [{username}, {email}]     // check if the user exists or not
    })
    // console.log(user);
    if(!user){
        throw new ApiError(404, "User not found")
    }
    

    // check if the password is correct or not
   const isPasswordValid = await user.isPasswordMatched(password)
   if(!isPasswordValid){
    throw new ApiError(401, "Invalid password")
   }

   const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
     
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


   const options =  {
    httpOnly: true,
    secure: true
   }
   return res.status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new ApiResponse(200, {user:loggedInUser, accessToken, refreshToken },
        "User logged in successfully")
    )

})


// logout user
// remove refresh token from the database
 const logoutUser = asyncHandler(async(req, res) => {
    // logout user
    // remove refresh token from the database
    // remove cookies from the browser
        
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $unset: {
                refreshToken: 1 // remove refresh token from the database [this removes the field from document]
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged Out")

    )
})


// refresh access token
// check if the refresh token is present in the cookies or not
const refreshAccessToken = asyncHandler(async(req, res) => {
    
// cookies access token and refresh token
// check if the refresh token is present in the cookies or not  
// check if the refresh token is valid or not
// check if the refresh token is present in the database or not
// generate new access token and refresh token
// send response to the client

const incomingRefreshToken = req.cookies.refreshToken && req.body.refreshToken

if(!incomingRefreshToken){
    throw new ApiError(400, "Unauthorized request")
}
   try {
    const decodedToken =  jwt.verify(
         incomingRefreshToken,
         process.env.ACCESS_TOKEN_SECRET,
     )
 
     // user id from the decoded token
    const user = await User.findById(decodedToken?._id)
 
    if(!user){
     throw new ApiError(401, "Invalid refresh token")
    }
 
    //match the refresh token with the user refresh token in the database
    if(incomingRefreshToken !== user?.refreshToken){
     throw new ApiError(401, "Refresh token is Expired or Used")
    }
 
    const options = {
     httpOnly: true,
     secure: true
    }
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
 
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshTokene, options)
    .json(
     new ApiResponse(200, {accessToken, newRefreshToken}, "Access token refreshed " )
    )
   } catch (error) {
        console.log(error);
        throw new ApiError(401, error?.message || "Invalid refresh token")
   }


})


// change current password
// get the user id from the request
const changeCurrentPassword = asyncHandler(async(req, res) => {

    // get the user id from the request
    // get the current password from the request body
    // check if the user exists or not
    // check if the current password is correct or not
    // update the password in the database
    // send response to the client

    const {oldPassword, newPassword, confirmPassword} = req.body

    // check new password and confirm password are same or not
    if(!newPassword === !confirmPassword){
        throw new ApiError(401, "New password and confirm password is not matching")
    }


    // check if the user exists or not
   const user = await User.findById(req.user?._id)

   // check if the user password is correct or not
   const isPasswordCorrect = await user.isPasswordMatched(oldPassword)
   if(!isPasswordCorrect){
    throw new ApiError(401, "Invalid password")
   }


   // update the password in the database
   // user.password = newPassword
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    //return the response to the client
    // remove the password and refresh token from the response
   return res.status(200).json(
    new ApiResponse(200, {}, "Password changed successfully")
   )

  
})



// get current user
// get the user id from the request
const getCurrentUser = asyncHandler(async(req, res)=>{
    return res.status(200)
    .json(200, req.user, "Current user fetched successfully"
    )
})


// get all Upadte Account Details users
const updateAccountDeatils = asyncHandler(async(req, res) => {
    
    const {fullName, email} = req.body
    // check if the user exists or not
    if(!fullName && !email){
        throw new ApiError(400, "Full name or email is required")

    }

    // check if the user exists or not
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName: fullName,
                email: email
            }
        },
        {new: true}
     ).select("-password")
     return res.status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        )

})



// update user avatar
const updateUserAvatar = asyncHandler(async(req, res) => {

    const avatarLocalPath = req.file?.path
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is missing")
    }
    
    
    // upload images to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400, "Error while uploading on Avatar [Avatar uploaded failed]")

    }


    // update the user avatar in the database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {

            $set:{
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200, user, "Avatar updated successfully")
    )

})



// update user cover image
const updateUserCoverImage = asyncHandler(async(req, res) => {

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Cover image is missing")
    }

    // upload images to cloudinary, avatar
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400, "Error while uploading on Cover image [Cover image uploaded failed]")
    }

    // update the user cover image in the database
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")    

    
    return res.status(200)
    .json(
        new ApiResponse(200, user, "Cover image updated successfully")

    )

})


// get user channel profile using aggregation pipeline
// get the user id from the request
const getUserChannelProfile = asyncHandler(async(req, res) => {
   const {username} =  req.params

   if(!username?.trim()){
    throw new ApiError(400, "Username is missing")
   }
   console.log(username, "username from params");

   // channel profile using aggregation pipeline
   // get the user id from the request
   const channel = await User.aggregate([
    {
        $match: {                                                
            username: username?.toLowerCase()                   // match the username with the database
        },
    },    
        {
            $lookup:{                                          // join the subscription collection with the user collection using $lookup method
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            },
        },
        {
            $lookup:{                                       // join the subscriber collection with the user collection using $lookup method    //from: "subscription",    
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            },
        },
        {
           
            $addFields:{                                            // add new fields to the user object using $addFields method
                subscriberCount: {                                        // count the number of subscribers the user has
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {                          // count the number of channels the user is subscribed to  
                    $size: "$subscribedTo"
                },
                isSubscribed: {                                        // check if the user is subscribed to the channel or not
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    },
                },
            },
        },
        {
            $project: {                                           // project the fields to be returned in the response    
                createdAt: 1,
                fullName: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1
            },
        },
    
])    

// !channel?.length
// check if the channel is not found or not
  if(!channel?.length){
    throw new ApiError(404, "Channel not found")

  }
  console.log("Username lowercase:", username?.toLowerCase());
    return res.status(200)
    .json(
        new ApiResponse(200, channel[0], "Channel profile fetched successfully")                // channel[0] because we are using aggregation pipeline and it will return an array of objects
    )


})



// get watched history
const getWatchedHistory = asyncHandler(async(req, res) => {
    // get the user id from the request
    // get the watched history from the database
    // send response to the client

   const user = await User.aggregate([                      // get the watched history from the database
    {
        $match:{
           _id: new mongoose.Types.ObjectId(req.user._id)   // match the user id with the database
        },
        
    },    
        {
            $lookup:{                               // join the videos collection with the user collection using $lookup method 
                from: "videos",
                localField: "watchedHistory",
                foreignField: "_id",
                as: "watchedHistory",
                pipeline:[                          // pipeline to get the video details from the videos collection
                    {
                        $lookup:{               // join the user collection with the videos collection using $lookup method
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline:[                  // pipeline to get the user details from the user collection
                                {
                                    $project:{          // project the fields to be returned in the response
                                        
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    },
                                },
                            ],

                        },
                    },
                    {
                        $addFields:{                    // add new fields to the video object using $addFields method
                            owner:{
                                $first: "$owner"   // get the first element of the owner array
                            },
                        },
                    },
                ],
            },
        },
       
    
   ])
  
   return res.status(200)
   .json(
    new ApiResponse(200, user[0].watchedHistroy, "Watched history fetched successfully")   // user[0]?.watchedHistory because we are using aggregation pipeline and it will return an array of objects
   )
},)

// export the functions
 export {
     loginUser,
     logoutUser,    
     registerUser,
     refreshAccessToken,
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDeatils,
     updateUserAvatar,
     updateUserCoverImage,
     getUserChannelProfile,
     getWatchedHistory
     //generateAccessAndRefreshToken
    
     
    
     }
      // Export the function as default   
// export default registerUser; // Export the function as default


