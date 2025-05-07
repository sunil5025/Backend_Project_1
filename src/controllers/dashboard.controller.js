import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utility(utils)/ApiError.js";
import {ApiResponse} from "../utility(utils)/ApiResponse.js";
import {asyncHandler} from "../utility(utils)/async_handler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.params.channelId
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400, "Invalid channel id")
    }
    const channel  = await Subscription.findOne({channel : channelId})
    if(!channel){
        throw new ApiError(404, "channel not found")
    }
    const channelVideo = await Video.find({channel: channelId})
    if(channelVideo.length === 0){
        throw new ApiError(404, "No videos found for this channel")
    }
    const channelLikes = await Like.find({channel: channelId})
    if(channelLikes.length === 0){
        throw new ApiError(404, "No likes found for this channel")
    }
    const totalVideos = channelVideo.length;
    const totalLikes = channelLikes.length;
    const totalViews = channelVideo.reduce((acc, video) => acc + video.views, 0)
    const totalSubscribers = channel.subscribers.length;
    const channelStats = {
        totalVideos,
        totalLikes,
        totalViews,
        totalSubscribers
    }
   
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Channel stats fetched successfully", channelStats)
    )

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.params.channelId
    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400, "Invalid channel id")
    }
    const channelVideos = await Video.find({channel: channelId})
    if(channelVideos.length === 0){
        throw new ApiError(404, "There are no videos found for this channel")
       
    }
    const channelVideosList = channelVideos.map((video) => {
        return {
            id: video._id,
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail,
            duration: video.duration,
            category: video.category,
            views: video.views,
            isPublished: video.isPublished,
            createdAt: video.createdAt
        }
    })
   
    return res.status(200)
    .json(
        new ApiResponse(true, 200,  "Channel videos list fetched successfully", channelVideosList)
    )

})

export {
    getChannelStats, 
    getChannelVideos
    }