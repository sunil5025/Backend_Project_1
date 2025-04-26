 import {asyncHandler} from "../utility(utils)/async_handler.js";
 import { ApiError} from "../utility(utils)/ApiError.js";
 import {User} from "../models/user.model.js";
 import { uploadOnCloudinary } from "../utility(utils)/cloudniary.js";
 import { ApiResponse } from "../utility(utils)/ApiResponse.js";




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
    const avatarLocalPath =  req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; //

   
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




 export {registerUser} 
