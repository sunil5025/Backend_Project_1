import mongoose from "mongoose";
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utility(utils)/ApiError.js";
import {ApiResponse} from "../utility(utils)/ApiResponse.js";  
import {asyncHandler} from "../utility(utils)/async_handler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const skip = (page-1) * limit


    const noComment = await Comment.find({videoId}).skip(skip).limit(limit).populate("userId", "name email")
    if(!noComment.length === 0){
        throw new ApiError(404, "No comments found for this video")
      
        
    }
    return res.status(200)
    .json(
        new ApiResponse(
            true,
            200,
            "Comments fetched successfully",
            noComment
        )
    );

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {userId} = req.user
    const {text} = req.body
    const comment = await Comment.create({
        videoId,
        userId,
        text

    })
    if(!comment){
        return res.status(500)
        .json(
            new ApiResponse(
                false,
                500,
                "Unable to add comment",
                null
            )
        
        )

    }
    return res.status(201)
    .json(
        new ApiResponse(
            true,
            201,
            "Comment added successfully",
            comment
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {text} = req.body
    const comment = await Comment.findByIdAndUpdate(commentId, {text}, {new: true})
    // if(!comment){
    //     return res.status(404)
    //     .json(
    //         new ApiResponse(
    //             false,
    //             404,
    //             "Comment not found",
    //             null
    //         )
    //     )
    // }

    if(!comment){
        throw new ApiError(500, getVideoComments,  "Unable to update comment");
     }


    return res.status(200)
    .json(
        new ApiResponse(
            true,
            200,
            "Comment updated successfully",
            comment
        )
    )
   
    

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const comment = await Comment.findByIdAndDelete(commentId,{
        new : true
    })
    if(!comment){
       throw new ApiError(404, "Comment not found");

    }
    return res.status(200)
    .json(
        new ApiResponse(
            true,
            200,
            "Comment deleted successfully",
            comment
        )
    );
  
   

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
     
    }