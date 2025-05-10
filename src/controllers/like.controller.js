import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utility(utils)/ApiError.js";
import {ApiResponse} from "../utility(utils)/ApiResponse.js";
import {asyncHandler} from "../utility(utils)/async_handler.js";
import {Video} from "../models/video.model.js";
import {Tweet} from "../models/tweet.model.js";
import {Comment} from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }
    const userId = req.user.id // Assuming userId is available in req.user
    const like = await Like.findOne({video: videoId, user: userId})
    if(!like){
        // If like doesn't exist, create a new like
        const newLike = await Like.create({video: videoId, user: userId})
        return res.status(201).json(
            new ApiResponse(true, 201, "Video liked successfully", newLike)
        )
    }
    // If like exists, remove it
    const removedLike = await Like.findByIdAndDelete(like._id)
    if(!removedLike){
        throw new ApiError(404, "Like not found")
    }
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Video unliked successfully", removedLike)
    )
})




const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }
    const comment =  await Like.findById(commentId)
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }
    const userId = req.user.id // Assuming userId is available in req.user
    const like = await Like.findOne({comment: commentId, user: userId})
    if(!like){
        // If like doesn't exist, create a new like
        const newLike = await Like.create({comment: commentId, user: userId})
        return res.status(201).json(
            new ApiResponse(true, 201, "Comment liked successfully", newLike)
        )
    }
    // If like exists, remove it
    const likeRemoved =  await Like.findByIdAndDelete(like._id)
   
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Comment unliked successfully", likeRemoved)
    )

})




const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }
    const tweet = await Like.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }
    const userId = req.user.id // Assuming userId is available in req.user
    const like= await Like.findOne({tweet: tweetId, user: userId})
    if(!like){
        // If like doesn't exist, create a new like
        const newLike = await Like.create({tweet: tweetId, user: userId})
        return res.status(201).json(
            new ApiResponse(true, 201, "Tweet liked successfully", newLike)
        )
    }
    // If like exists, remove it
    const deleteLike = await Like.findByIdAndDelete(like._id)
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Tweet unliked successfully", deleteLike)
    )
}
)



const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user.id // Assuming userId is available in req.user
    const likedVideos = await Like.find({user: userId}).populate("video")
    if(likedVideos.length === 0){
        throw new ApiError(404, "No Liked videos found")
    }
  const likedVideosList = likedVideos.map((video) => {
        return {
            id: video._id,
            title: video.title,
            category: video.category,
            isPublished: video.isPublished,
            createdAt: video.createdAt
        }
  })  
  return res.status(200)
  .json(
        new ApiResponse(true, 200, "Liked videos fetched successfully", likedVideosList)
  )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}