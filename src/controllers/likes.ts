import { LikeModel } from "../models/Like";
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { isValidObjectId } from "mongoose";
import Post from "../models/Post";
import User from "../models/User";



export const likePost: RequestHandler = async (req, res, next) => {
  const { postId } = req.params;
    // @ts-ignore
  const userId: string | undefined = req.userId;


  if (!userId) {
    throw createHttpError(401, "Unauthorized Access");
  }
  
  if (!isValidObjectId(postId)) {
    return next(createHttpError(400, "Invalid post ID"));
  }

  try {
    const newLike = new LikeModel({
      post: postId,
      creator: userId,
    });

    await Post.findByIdAndUpdate(postId,
      {
        $push : {likes : newLike._id}
      },
      { new: true }
    )

    await User.findByIdAndUpdate(userId,{
      $push: { likedPosts: postId }
    }, { new: true }
    )

    await newLike.save();

    res.status(201).json({
      message: "Post liked successfully",
      like: newLike,
    })
  } catch (error) {
    next(error);
  }
};

export const unlikePost: RequestHandler = async (req, res, next) => {
  const { postId } = req.params;
    // @ts-ignore
  const userId: string | undefined = req.userId;
  if (!isValidObjectId(postId)) {
    return next(createHttpError(400, "Invalid post ID"));
  }

  try {
    await LikeModel.findOneAndDelete({
      post: postId,
      creator: userId,
    });

    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: postId },
    });

    await User.findByIdAndUpdate(userId, {
      $pull: { likedPosts: postId },
    });

    res.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    next(error);
  }
};