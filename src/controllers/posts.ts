import { RequestHandler } from "express";
import Post, { Post as PostType } from "../models/Post";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import User from "../models/User";
import { uploadFile } from "../middlewares/multer";
import Comment from "../models/Comment";
import {LikeModel}  from "../models/Like";


export const getPosts: RequestHandler = async (req, res, next) => {
  const startIndex = req.query.startIndex
    ? parseInt(req.query.startIndex as string)
    : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
  const direction = req.query.direction === "asc" ? 1 : -1;
  const category = req.query.category && (req.query.category as string);
  const tag = req.query.tag && (req.query.tag as string);
  const slug = req.query.slug && (req.query.slug as string);
  const searchTerm = req.query.searchTerm && (req.query.searchTerm as string);
  const creator = req.query.creator && (req.query.creator as string);
  try {
    const posts = await Post.find({
      ...(category && { category }),
      ...(creator && { creator }),
      ...(slug && { slug }),
      ...(tag && { tag }),
      ...(searchTerm && {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { content: { $regex: searchTerm, $options: "i" } },
          { category: { $regex: searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: direction })
      .populate("creator", "username avatar")
      .populate({ path: "comments", populate: "creator" })
      .skip((startIndex - 1) * limit)
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

export const getPostBySlug: RequestHandler<{ slug: string }> = async (
  req,
  res,
  next
) => {
  const { slug } = req.params;
  try {
    const post = await Post.findOne({ slug })
      .populate("creator", "username avatar")
      .populate({ path: "comments", populate: "creator" })
      .populate("likes")
      .exec();
    if (!post) {
      throw createHttpError(404, "Post not found");
    }
    // Increment the view count and also add the post to the user's viewed posts
    post.views = (post.views || 0) + 1;
    await post.save();

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
  tags?: string;
}

export const createPost: RequestHandler<
  unknown,
  unknown,
  CreatePostRequestBody,
  unknown
> = async (req, res, next) => {
  const { title, content, category, summary, tags } = req.body;
  const file = req.file;
  // @ts-ignore
  const userId: string | undefined = req.userId;

  try {
    if (!title || !content || !category || !summary || !tags) {
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

    const tagArray = tags.split(",").map((tag) => tag.trim());

    const savedPost = await Post.create({
      title,
      content,
      slug,
      imageUrl: image,
      category,
      summary,
      tags: tagArray,
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
  const { title, content, category, summary, tags } = req.body;
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
    post.tags = tags ? tags.split(",").map((tag) => tag.trim()) : post.tags;

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
    await User.updateOne({ _id: userId }, 
      { $pull: { posts: postId , likedPosts: postId, viewedPosts: postId } })
      .exec();
    await Comment.deleteMany({ post: postId }).exec();
    await LikeModel.deleteMany({ post: postId }).exec();

    res.status(204).json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};




// We can also improve the recommendations endpoint by considering the users following ,liked and viewed posts
export const getRecommendations: RequestHandler = async (req, res, next) => {
  // @ts-ignore
  const userId: string | undefined = req.userId;
  try {
    if (!userId) throw createHttpError(401, "Unauthorized");


    const user = await User.findById(userId)
      .populate<{ likedPosts: PostType[] }>("likedPosts", "title category tags")
      .populate<{ viewedPosts: PostType[] }>(
        "viewedPosts",
        "title category tags"
      )
      .exec();

    if (!user) throw createHttpError(404, "User not found");
    let tags: string[] = [];
    let categories: string[] = [];

    if (user.likedPosts && user.likedPosts.length > 0) {
      user.likedPosts.forEach((post) => {
        if (post.tags && post.tags.length > 0) {
          tags = [...tags, ...post.tags];
        }
        if (post.category) {
          categories.push(post.category);
        }
      });
    }

    const recommendedPosts = await Post.find({
      $or: [{ tags: { $in: tags } }, { category: { $in: categories } }],
    })
      .limit(6)
      .populate("creator", "username avatar")
      .exec();

    res.status(200).json(recommendedPosts);
  } catch (error) {
    next(error);
  }
};
