import { RequestHandler } from "express";
import Post from "../models/Post";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import User from "../models/User";
import { uploadFile } from "../middlewares/multer";

export const getPosts: RequestHandler = async (req, res, next) => {
  const startIndex = req.query.startIndex
    ? parseInt(req.query.startIndex as string)
    : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
  const direction = req.query.direction === "asc" ? 1 : -1;

  const category = req.query.category && (req.query.category as string);
  const slug = req.query.slug && (req.query.slug as string);
  const searchTerm = req.query.searchTerm && (req.query.searchTerm as string);
  const creator = req.query.creator && (req.query.creator as string);
  try {
    const posts = await Post.find({
      ...(category && { category }),
      ...(creator && { creator }),
      ...(slug && { slug }),
      ...(searchTerm && {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { content: { $regex: searchTerm, $options: "i" } },
          { category: { $regex: searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: direction }).populate("creator","username avatar").populate({"path":"comments","populate":"creator"})
      .skip((startIndex - 1)*limit)
      .limit(limit)
      .exec();

    const totalDocuments = await Post.countDocuments().exec();

    res.status(200).json({
      posts,
      totalPosts: Math.ceil(totalDocuments / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const getPost: RequestHandler = async (req, res, next) => {
  const { postId } = req.params;
  try {
    if (!mongoose.isValidObjectId(postId)) {
      throw createHttpError(400, "Invalid post id");
    }
    const post = await Post.findById(postId).exec();
    if (!post) {
      throw createHttpError(404, "Post not found");
    }
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

interface CreatePostRequestBody {
  title?: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  creator?: string;
}

export const createPost: RequestHandler<
  unknown,
  unknown,
  CreatePostRequestBody,
  unknown
> = async (req, res, next) => {
  const { title, content, category, summary } = req.body;
  const file = req.file;
  // @ts-ignore
  const userId: string | undefined = req.userId;

  try {
    if (!title || !content || !category || !summary) {
      throw createHttpError(400, "Missing required fields");
    }
    
    if (!file) {
      throw createHttpError(400, "Image is required");
    }
    const image = await uploadFile(file);
    

    const slug = title
      .toLowerCase()
      .split(" ")
      .join("-")
      .replace(/[^a-zA-Z0-9-]/g, "-");

    const savedPost = await Post.create({
      title,
      content,
      slug,
      imageUrl : image,
      category,
      summary,
      creator: userId,
    });

    if (savedPost) {
      const user = await User.findById(userId).exec();
      if (!user) {
        throw createHttpError(404, "User not found");
      }
      user.posts.push(savedPost._id);
      await user.save();
      res
        .status(201)
        .json({ message: "Post created successfully", post: savedPost });
    }
  } catch (error) {
    next(error);
  }
};

interface updatePostParams {
  postId: string;
}

export const updatePost: RequestHandler<
  updatePostParams,
  unknown,
  CreatePostRequestBody,
  unknown
> = async (req, res, next) => {
  // @ts-ignore
  const userId: string | undefined = req.userId;
  const file = req.file;
  const { postId } = req.params;
  const { title, content, imageUrl, category, summary } = req.body;
  let slug: string | undefined;
  if (title) {
    slug = title
      .toLowerCase()
      .split(" ")
      .join("-")
      .replace(/[^a-zA-Z0-9-]/g, "-");
  }
 
  try {
    if (!mongoose.isValidObjectId(postId)) {
      throw createHttpError(400, "Invalid post id");
    }
    const post = await Post.findById(postId).exec();
    if (!post) {
      throw createHttpError(404, "Post not found");
    }

    if (post.creator?.toString() !== userId) {
      throw createHttpError(403, "You are not authorized to update this post");
    }


    if (file) {
      const image = await uploadFile(file);
      post.imageUrl = image || post.imageUrl;
    }
    // Update the post
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.summary = summary || post.summary;
    post.slug = slug || post.slug;

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

export const deletePost: RequestHandler<updatePostParams> = async (
  req,
  res,
  next
) => {
  const { postId } = req.params;

  // @ts-ignore
  const userId: string | undefined = req.userId;

  try {
    if (!mongoose.isValidObjectId(postId)) {
      throw createHttpError(400, "Invalid post id");
    }
    await Post.findByIdAndDelete(postId).exec();

    await User.updateOne({ _id: userId }, { $pull: { posts: postId } }).exec();

    res.status(204).json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};
