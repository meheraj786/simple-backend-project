import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized request");
  }

  const totalVideos = await Video.countDocuments({ owner: userId });

  const totalViewsData = await Video.aggregate([
    { $match: { owner: userId } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);
  const totalViews = totalViewsData[0]?.totalViews || 0;

  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });

  const totalLikesData = await Like.aggregate([
    { $match: { video: { $exists: true } } },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    { $unwind: "$videoDetails" },
    { $match: { "videoDetails.owner": new mongoose.Types.ObjectId(userId) } },
    { $count: "totalLikes" },
  ]);
  const totalLikes = totalLikesData[0]?.totalLikes || 0;

  const stats = {
    totalVideos,
    totalViews,
    totalSubscribers,
    totalLikes,
  };

  return res
    .status(200)
    .json(new ApiResponse("Channel stats fetched successfully", stats));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const videos = await Video.find({ owner: channelId }).sort({ createdAt: -1 });

  if (!videos || videos.length === 0) {
    throw new ApiError(404, "No videos found for this channel");
  }

  return res
    .status(200)
    .json(new ApiResponse("Channel videos fetched successfully", videos));
});

export { getChannelStats, getChannelVideos };
