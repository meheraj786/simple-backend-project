import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name?.trim() || !description?.trim()) throw new ApiError(400, "Name and description are required");

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  return res.status(201).json(new ApiResponse("Playlist created successfully", playlist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");

  const playlists = await Playlist.find({ owner: userId }).populate("videos", "title thumbnail duration");

  return res.status(200).json(new ApiResponse("User playlists fetched successfully", playlists));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID");

  const playlist = await Playlist.findById(playlistId)
    .populate("owner", "username avatar")
    .populate("videos", "title thumbnail duration");

  if (!playlist) throw new ApiError(404, "Playlist not found");

  return res.status(200).json(new ApiResponse("Playlist fetched successfully", playlist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    throw new ApiError(400, "Invalid playlist or video ID");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (playlist.owner.toString() !== req.user._id.toString())
    throw new ApiError(403, "Unauthorized to modify this playlist");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (playlist.videos.includes(videoId))
    throw new ApiError(400, "Video already in playlist");

  playlist.videos.push(videoId);
  await playlist.save();

  return res.status(200).json(new ApiResponse("Video added to playlist", playlist));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId))
    throw new ApiError(400, "Invalid playlist or video ID");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (playlist.owner.toString() !== req.user._id.toString())
    throw new ApiError(403, "Unauthorized to modify this playlist");

  playlist.videos = playlist.videos.filter((v) => v.toString() !== videoId);
  await playlist.save();

  return res.status(200).json(new ApiResponse("Video removed from playlist", playlist));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (playlist.owner.toString() !== req.user._id.toString())
    throw new ApiError(403, "Unauthorized to delete this playlist");

  await playlist.deleteOne();

  return res.status(200).json(new ApiResponse("Playlist deleted successfully", null));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid playlist ID");

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");
  if (playlist.owner.toString() !== req.user._id.toString())
    throw new ApiError(403, "Unauthorized to update this playlist");

  if (name?.trim()) playlist.name = name;
  if (description?.trim()) playlist.description = description;
  await playlist.save();

  return res.status(200).json(new ApiResponse("Playlist updated successfully", playlist));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
