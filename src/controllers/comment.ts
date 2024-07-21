import Comment from "../models/Comment";
import Post from "../models/Post";
import createHttpError from "http-errors";
import { RequestHandler } from "express";

export const createComment: RequestHandler = async (req, res, next) => {
  // @ts-ignore
  const creator = req.userId as string;
  const { postId } = req.params;
  const { text } = req.body;

  if (!creator) {
    throw createHttpError(401, "Unauthorized Access");
  }

  if (!text || !postId) {
    throw createHttpError(400, "Comment text and post id is required");
  }

  try {
    const comment = await Comment.create({ creator, post: postId, text })
    await Post.findOneAndUpdate({_id: postId}, {
      $push: { comments: comment._id,
      },
    },{
      new: true
    })
    const ct = await Comment.findById(comment._id).populate("creator");
    res.status(201).json({comment : ct});
  } catch (error) {
    next(error);
  }
};
export const updateComment: RequestHandler = async (req, res, next) => {
  // @ts-ignore
  const creator = req.userId as string;
  const { commentId } = req.params;
  const { text } = req.body;

  if (!creator) {
    throw createHttpError(401, "Unauthorized Access");
  }

  if (!commentId) {
    throw createHttpError(400, "Comment id is required");
  }

  try {
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId, creator },
      { text },
      { new: true }
    );
    if (!comment) {
      throw createHttpError(404, "Comment not found");
    }
    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};
export const deleteComment: RequestHandler = async (req, res, next) => {
  // @ts-ignore
  const creator = req.userId as string;
  const { commentId } = req.params;

  if (!creator) {
    throw createHttpError(401, "Unauthorized Access");
  }

  if (!commentId) {
    throw createHttpError(400, "Comment id is required");
  }

  try {
    const comment = await Comment.findOneAndDelete({ _id: commentId, creator });
    if (!comment) {
      throw createHttpError(404, "Comment not found");
    }
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};
export const getComments: RequestHandler = async (req, res, next) => {
  const { postId } = req.params;
  if (!postId) {
    throw createHttpError(400, "Post id is required");
  }

  try {
    const comments = await Comment.find({ post: postId }).populate("creator");
    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};
