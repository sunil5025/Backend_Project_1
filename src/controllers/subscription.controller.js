import mongoose, {isValidObjectId} from "mongoose";
import {User} from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import {Video} from "../models/video.model.js";
import {Playlist} from "../models/playlist.model.js";
import {ApiError} from "../utility(utils)/ApiError.js";
import {ApiResponse} from "../utility(utils)/ApiResponse.js";
import {asyncHandler} from "../utility(utils)/async_handler.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel id")
    }
    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(404, "Channel not found")
    }
    const userId = req.user.id // Assuming userId is available in req.user
    const subscription = await Subscription.findOne({channel: channelId, user: userId})
    if(!subscription){
        // if subscription doesnt exist, create a new subscription
        const newSubscription = await Subscription.create({channel: channelId, user: userId})
        return res.status(201)
        .json(
            new ApiResponse(true, 201, "Subscribed to channel successfully", newSubscription)
        )
    }
    // if subscription exists, remove it
    const removedSubscription = await Subscription.findByIdAndDelete(subscription._id)
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Unsubscribed from channel successfully", removedSubscription)
    )
})





// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel id")
    }
    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(404, "Channel not found")
    }
    const subscribers = await Subscription.find({channel: channelId});
    if(subscribers.length === 0){
        throw new ApiError(404, "No subscribers found for this channel")
    }
    const subscriberList = subscribers.map((subscriber) => {
        return {
            id: subscriber._id,
            userId: subscriber.user,
            channelId: subscriber.channel,
            createdAt: subscriber.createdAt,
            updatedAt: subscriber.updatedAt
        }
    })
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Subscribers fetched successfully", subscriberList)
    )
})





// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid subscriber id")
    }
    const subscriber = await User.findById(subscriberId)
    if(!subscriber){
        throw new ApiError(404, "Subscriber not found")
    }
    const subscriptions = await Subscription.find({user: subscriberId}).populate("channel")
    if(!subscriptions || subscriptions.length === 0){
        throw new ApiError(404, "No subscriptions found for this user")
    }
    const subscribedChannel = subscriptions.map((subscription) => {
        return {
            id: subscription._id,
            channelId: subscription.channel._id,
            channelName: subscription.channel.name,
            channelDescription: subscription.channel.description,
            channelThumbnail: subscription.channel.thumbnail,
            channelCreatedAt: subscription.channel.createdAt,
            channelUpdatedAt: subscription.channel.updatedAt,
            subscriberId: subscription.user,
            createdAt: subscription.createdAt,
            updatedAt: subscription.updatedAt

        }
    })
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Subscribed channels fetched successfully", subscribedChannel)
    )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}