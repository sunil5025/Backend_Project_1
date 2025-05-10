import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
// import {Comment} from "../models/comment.model.js";
// import {Like} from "../models/like.model.js";
// import {Retweet} from "../models/retweet.model.js";
import {ApiError} from "../utility(utils)/ApiError.js";
import {ApiResponse} from "../utility(utils)/ApiResponse.js";
import {asyncHandler} from "../utility(utils)/async_handler.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {userId} = req.user     // Assuming userId is available in req.user
    const {content} = req.body         // Assuming text is the content of the tweet
    if(!content){
        throw new ApiError(400, "Text is required")         // Check if text is provided
    }
    const user = await User.findById(userId)                // Check if user exists
    if(!user){
        throw new ApiError(404, "User not found")         // If user not found, throw an error
    }
    const tweet = await Tweet.create({          // Create a new tweet
        user: userId,                           // Assuming userId is the ID of the user creating the tweet 
        content: content,                           // Assuming content is the text of the tweet                  
        likes: [],                              // Assuming likes is an array of user IDs who liked the tweet 
        retweets: [],                           // Assuming retweets is an array of user IDs who retweeted the tweet        
        comments:[],                              // Assuming comments is an array of user IDs who commented on the tweet  
        retweetCount: 0,                            // Assuming retweetCount is the number of retweets
        likeCount: 0,                               // Assuming likeCount is the number of likes  
        commentCount: 0                         // Assuming commentCount is the number of comments
    })
    if(!tweet){                                         // Check if tweet was created successfully
        throw new ApiError(500, "Unable to create tweet")                               // If tweet creation failed, throw an error
    }
    return res.status(201)                                                        // Return a 201 status code for successful creation
    .json(
        new ApiResponse(true, 201, " Tweet created successfully", tweet)                 // Return a success response with the created tweet
    )
})




const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params                   // Assuming userId is passed as a URL parameter
    const {page = 1, limit = 10} =  req.query  // Get the page and limit from the request query, default to 1 and 10 if not provided
    const pageNum = parseInt(page, 10) || 1            // Get the page number from the request query, default to 1 if not provided
    const limitNum = parseInt(limit, 10) || 10                  // Get the limit from the request query, default to 10 if not provided  
    const skip = (pageNum -1) * limitNum                  // Calculate the number of tweets to skip based on the page and limit
    if(!mongoose.Types.ObjectId.isValid(userId)){       // Check if userId is a valid ObjectId
        throw new ApiError(400, "Invalid user id")              // If not, throw an error
    }

    const userTweet = await Tweet.find({user: userId})          // Find tweets by userId
    .skip(skip)                                                // Skip the number of tweets based on the page and limit
    .limit(limitNum)                                             // Limit the number of tweets returned based on the limit 
    .populate("user", "name email")                             // Populate the user field with name and email


if(userTweet.length === 0){                                              // Check if any tweets were found   
    throw new ApiError(404, "No tweets found for the user")                   // If not, throw an error
}
return res.status(200)                                  // Return a 200 status code for successful retrieval    
.json(
    new ApiResponse(true, 200, "User tweets fetched successfully", userTweet)  // Return a success response with the user tweets
)

})





const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params                   // Assuming tweetId is passed as a URL parameter
    const {content} = req.body                        // Assuming text is the new content of the tweet
    if(!mongoose.Types.ObjectId.isValid(tweetId))             // Check if tweetId is a valid ObjectId
{
    throw new ApiError(400, "Invalid tweet id")             // If not, throw an error
}
const tweet = await Tweet.findByIdAndUpdate(tweetId, {content}, {new: true})      // Find the tweet by tweetId and update it with the new text
if(!tweet){
    throw new ApiError(404, "Tweet not found")       // If tweet not found, throw an error
}
return res.status(200)
.json(
    new ApiResponse(true, 200, "Tweet updated Successfully", tweet)    // Return a success response with the updated tweet
)

})





const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params                   // Assuming tweetId is passed as a URL parameter
    if(!mongoose.Types.ObjectId.isValid(tweetId))          // Check if tweetId is a valid ObjectId
    {
        throw new ApiError(400, "Invalid tweet id")        // If not, throw an error
    }
    const tweet = await Tweet.findByIdAndDelete(tweetId)      // Find the tweet by tweetId and delete it
    if(!tweet){
        throw new ApiError(404, "Tweet not found")         // If tweet not found, throw an error
    }
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Tweet deleted successfully", tweet)     // Return a success response with the deleted tweet
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}