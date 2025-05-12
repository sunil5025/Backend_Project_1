import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utility(utils)/ApiError.js";
import {ApiResponse} from "../utility(utils)/ApiResponse.js";
import {Comment} from "../models/comment.model.js"
import {asyncHandler} from "../utility(utils)/async_handler.js";
import {uploadOnCloudinary} from "../utility(utils)/cloudniary.js";




const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pageNum = parseInt(page, 10) // 1 
    const limitNum = parseInt(limit, 10) // 10
    const skip = (pageNum - 1) * limitNum   // 0
    const sort = sortBy ? { [sortBy]: sortType === "desc" ? -1 : 1 } : {createdAt : -1}     // sort by createdAt by default
    const queryObj = query ? {title: { $regex: query, $options: "i" }} : {}              // search by title
    const userIdObj = userId ? {owner: userId} : {}       // search by userId
    const  videos = await Video.find({...queryObj, ...userIdObj})                      // find videos based on query and userId
    .skip(skip)  // 0
    .limit(limitNum)      // 10
    .sort(sort)          // sort by createdAt by default
    .populate("owner", "name email")     // populate userId with name and email
    .populate("comments", "content")        // populate comments with text
    .populate("likes", "userId")        // populate likes with userId
    if(videos.length === 0){
        throw new ApiError(404, "No videos found")
    }
    return res.status (200)
    .json(
        new ApiResponse(true, 200, "Videos fetched successfully", videos)
    )
})






const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const {path} = req.file                                          // get video path from request
    const {url} = await uploadOnCloudinary(path, "video")            // upload video to cloudinary
    const owner = req.user.id                                      // get userId from request
    const video = await Video.create({
        title,                                                  // title from request body
        description,                                           // title and description from request body
        videoUrl: url,                                        // videoUrl is the url of the video uploaded to cloudinary
        owner,                                               // create video with userId   
        thumbnail: url,                                      // assuming thumbnail is same as videoUrl
        likes : [],                                        // likes is an array of userId who liked the video
        comments : [],                                      // comments is an array of userId who commented on the video
        likeCount: 0,                                     // likeCount is the number of likes
        commentCount: 0,                                  // commentCount is the number of comments
        viewCount: 0,                                    // viewCount is the number of views
        isPublished: false,                             // isPublished is a boolean value to check if video is published or not
        isDeleted: false,                             // isDeleted is a boolean value to check if video is deleted or not
        category : "General",                        // category is the category of the video
        duration: "0:00",                           // duration is the duration of the video
        createdAt: new Date(),                    // createdAt is the date when video is created
        updatedAt: new Date()                     // updatedAt is the date when video is updated
         

    })                           // create video 
    if(!video){
        throw new ApiError(500, "Unable to create video")
    }
    return res.status(201)
    .json(
        new ApiResponse(true, 201, "Video created successfully", video)
    )

})







const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!isValidObjectId(videoId)){                                      // check if videoId is valid
        throw new ApiError(400, "Invalid video id")                       // if not, throw an error
    }

const video = await Video.findById(videoId)                // find video by videoId
    .populate("owner", "name email")                    // populate userId with name and email
    .populate("comments", "content")                      // populate comments with text
    .populate("likes", "userId")                     // populate likes with userId
    if(!video){
        throw new ApiError(404, "Video not found")
    }
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Video fetched successfully", video)              // return video
    )

})






const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body                                 // get title and description from request body
    const {path} = req.file                                               // get video path from request  
    const {url} = await uploadOnCloudinary(path, "video")                  // upload video to cloudinary
    const owner = req.user.id                                              // get userId from request
    const video = await Video.findByIdAndUpdate(videoId, {title, description, thumbnail: url}, {new : true})            // find video by videoId and update it with the new title and description
    if(!video){
        throw new ApiError(404, "Video not found")
    }
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Video updated successfully", video)             // return video

    )

})







const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params            // get videoId from request params
    //TODO: delete video
    const owner = req.user.id                   // get userId from request
    const video = await Video.findByIdAndDelete(videoId)            // find video by videoId and delete it
    if(!video){
        throw new ApiError(404, "Video not found")
    }
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Video deleted successfully", video)             // return video

    )
})







const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params              // get videoId from request params
    const {isPublished} = req.body            // get isPublished from request body
    const owner = req.user.id                 // get userId from request
    const video =await Video.findByIdAndUpdate(videoId, {isPublished}, {new: true})           // find video by videoId and update it with the new isPublished value
    if(!video){
        throw new ApiError(404, "Video not found")
    }
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Video publish status updated successfully", video)           // return video

    )
})



export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}