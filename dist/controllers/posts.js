"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.createPost = exports.getPosts = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
const multer_1 = require("../middlewares/multer");
const getPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const startIndex = req.query.startIndex
        ? parseInt(req.query.startIndex)
        : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 6;
    const direction = req.query.direction === "asc" ? 1 : -1;
    const category = req.query.category && req.query.category;
    const tag = req.query.tag && req.query.tag;
    const slug = req.query.slug && req.query.slug;
    const searchTerm = req.query.searchTerm && req.query.searchTerm;
    const creator = req.query.creator && req.query.creator;
    try {
        const posts = yield Post_1.default.find(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (category && { category })), (creator && { creator })), (slug && { slug })), (tag && { tag })), (searchTerm && {
            $or: [
                { title: { $regex: searchTerm, $options: "i" } },
                { content: { $regex: searchTerm, $options: "i" } },
                { category: { $regex: searchTerm, $options: "i" } },
            ],
        })))
            .sort({ updatedAt: direction }).populate("creator", "username avatar").populate({ "path": "comments", "populate": "creator" })
            .skip((startIndex - 1) * limit)
            .limit(limit)
            .exec();
        const totalDocuments = yield Post_1.default.countDocuments().exec();
        res.status(200).json({
            posts,
            totalPosts: Math.ceil(totalDocuments / limit),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPosts = getPosts;
const createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content, category, summary, tags } = req.body;
    const file = req.file;
    // @ts-ignore
    const userId = req.userId;
    try {
        if (!title || !content || !category || !summary || !tags) {
            throw (0, http_errors_1.default)(400, "Missing required fields");
        }
        if (!file) {
            throw (0, http_errors_1.default)(400, "Image is required");
        }
        const image = yield (0, multer_1.uploadFile)(file);
        const slug = title
            .toLowerCase()
            .split(" ")
            .join("-")
            .replace(/[^a-zA-Z0-9-]/g, "-");
        const tagArray = tags.split(",").map((tag) => tag.trim());
        const savedPost = yield Post_1.default.create({
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
            const user = yield User_1.default.findById(userId).exec();
            if (!user) {
                throw (0, http_errors_1.default)(404, "User not found");
            }
            user.posts.push(savedPost._id);
            yield user.save();
            res
                .status(201)
                .json({ message: "Post created successfully", post: savedPost });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.createPost = createPost;
const updatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // @ts-ignore
    const userId = req.userId;
    const file = req.file;
    const { postId } = req.params;
    const { title, content, category, summary, tags } = req.body;
    let slug;
    if (title) {
        slug = title
            .toLowerCase()
            .split(" ")
            .join("-")
            .replace(/[^a-zA-Z0-9-]/g, "-");
    }
    try {
        if (!mongoose_1.default.isValidObjectId(postId)) {
            throw (0, http_errors_1.default)(400, "Invalid post id");
        }
        const post = yield Post_1.default.findById(postId).exec();
        if (!post) {
            throw (0, http_errors_1.default)(404, "Post not found");
        }
        if (((_a = post.creator) === null || _a === void 0 ? void 0 : _a.toString()) !== userId) {
            throw (0, http_errors_1.default)(403, "You are not authorized to update this post");
        }
        if (file) {
            const image = yield (0, multer_1.uploadFile)(file);
            post.imageUrl = image || post.imageUrl;
        }
        // Update the post
        post.title = title || post.title;
        post.content = content || post.content;
        post.category = category || post.category;
        post.summary = summary || post.summary;
        post.slug = slug || post.slug;
        post.tags = tags ? tags.split(",").map((tag) => tag.trim()) : post.tags;
        const updatedPost = yield post.save();
        res.status(200).json(updatedPost);
    }
    catch (error) {
        next(error);
    }
});
exports.updatePost = updatePost;
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    // @ts-ignore
    const userId = req.userId;
    try {
        if (!mongoose_1.default.isValidObjectId(postId)) {
            throw (0, http_errors_1.default)(400, "Invalid post id");
        }
        yield Post_1.default.findByIdAndDelete(postId).exec();
        yield User_1.default.updateOne({ _id: userId }, { $pull: { posts: postId } }).exec();
        res.status(204).json({ message: "Post deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deletePost = deletePost;
