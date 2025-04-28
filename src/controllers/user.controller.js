 import {asyncHandler} from "../utility(utils)/async_handler.js";
 import { ApiError} from "../utility(utils)/ApiError.js";
 import {User} from "../models/user.model.js";
 import { uploadOnCloudinary } from "../utility(utils)/cloudniary.js";
 import { ApiResponse } from "../utility(utils)/ApiResponse.js";



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



 // login user and logout user 
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



 const logoutUser = asyncHandler(async(req, res) => {
    // logout user
    // remove refresh token from the database
    // remove cookies from the browser
        
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                refreshToken: undefined
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









 export {
     loginUser,
     logoutUser,    
     registerUser,
     
     //generateAccessAndRefreshToken
    
     
    
     }
      // Export the function as default   
// export default registerUser; // Export the function as default