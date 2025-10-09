import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const existingSub = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSub) {
    await Subscription.findByIdAndDelete(existingSub._id);
    return res
      .status(200)
      .json(new ApiResponse("Unsubscribed successfully"));
  }

  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res
    .status(201)
    .json(new ApiResponse("Subscribed successfully"));
});

// Get subscribers of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username email avatar")
    .select("-channel");

  return res
    .status(200)
    .json(new ApiResponse("Subscribers fetched successfully", subscribers));
});

// Get all channels subscribed by a user
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const channels = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "username email avatar")
    .select("-subscriber");

  return res
    .status(200)
    .json(new ApiResponse("Subscribed channels fetched successfully", channels));
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
};
