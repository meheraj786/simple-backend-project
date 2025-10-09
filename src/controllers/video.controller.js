import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import mongoose from "mongoose";

export const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description, duration } = req.body;

  if ([title, description, duration].some((f) => !f || f.trim() === "")) {
    throw new ApiError(400, "All fields (title, description, duration) are required");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) throw new ApiError(400, "Video file is required");
  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail image is required");

  const uploadedVideo = await uploadOnCloudinary(videoFileLocalPath);
  const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!uploadedVideo?.url || !uploadedThumbnail?.url) {
    throw new ApiError(400, "Failed to upload video or thumbnail");
  }

  const newVideo = await Video.create({
    title,
    description,
    duration,
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video uploaded successfully"));
});

export const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find({ isPublished: true })
    .populate("owner", "username fullName avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "All published videos fetched successfully"));
});

export const getVideoById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(id).populate("owner", "username fullName avatar");
  if (!video) throw new ApiError(404, "Video not found");

  video.views += 1;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

export const updateVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, isPublished } = req.body;

  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(id);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  let thumbnailUrl = video.thumbnail;
  const thumbnailLocalPath = req.file?.path;
  if (thumbnailLocalPath) {
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    thumbnailUrl = uploadedThumbnail?.url || thumbnailUrl;
  }

  video.title = title || video.title;
  video.description = description || video.description;
  video.isPublished = typeof isPublished !== "undefined" ? isPublished : video.isPublished;
  video.thumbnail = thumbnailUrl;

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid video ID");

  const video = await Video.findById(id);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  await video.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});
