import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utility(utils)/ApiError.js";
import {ApiResponse} from "../utility(utils)/ApiResponse.js";
import {asyncHandler} from "../utility(utils)/async_handler.js";
import {Video} from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    const {userId} = req.user
    const {playlist} = await Playlist.create({
        name,
        description,
        owner: userId
    })
    if(!playlist){
        throw new ApiError(400, "Unable to create playlist")
    }
    return res.status(201)
    .json(
        new ApiResponse(true, 201, "Playlist created successfully", {playlist:playlist})
    )
})



const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const playlist= await Playlist.find({owner: userId}).populate("videos")

    if(!playlist || playlist.length === 0){
        throw new ApiError(404, "No playlists found")
    }

    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Playlists fetched successfully", {playlist:playlist})
    )
})



const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId).populate("videos")

    if(!playlist){
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Playlist fetched successfully", {playlist:playlist})
    )
})



const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const {userId} = req.user
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId) || !isValidObjectId(userId)){
        throw new ApiError(400, "Invalid playlist id", "Invalid video id", "Invalid user id")
    }
   

    const addedVideo = await Video.findById(playlistId)


    if(!addedVideo){
        throw new ApiError(400, "Unable to add video to playlist")
    }

    addedVideo.videos.push(videoId);
    await addedVideo.save();

    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Video added to playlist successfully", {addedVideo})
    )
})



const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!isValidObjectId(playlistId, videoId)){
        throw new ApiError(400, "Invalid playlist id", "Invalid video id")
    }
    const removedVideo = await Video.findById(playlistId)
    if(!removedVideo){
        throw new ApiError(400, "Unable to remove video from playlist")
    }
    removedVideo.video.pull(videoId);
    await removedVideo.save()

    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Video removed from playlist successfully", {removedVideo})
    )


})



const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)
    if(!deletedPlaylist){
        throw new ApiError(400, "Unable to delete playlist")
    }
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Playlist deleted successfully", {playlist:deletedPlaylist})
    )
})



const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist id")
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        name,
        description
    },{new : true}
    )
    if(!updatedPlaylist){
        throw new ApiError(400, "Unable to update playlist")
    }
    return res.status(200)
    .json(
        new ApiResponse(true, 200, "Playlist updated successfully", {playlist:updatedPlaylist})
    )
})



export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}