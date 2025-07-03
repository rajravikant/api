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
exports.unlikePost = exports.likePost = void 0;
const Like_1 = require("../models/Like");
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = require("mongoose");
const Post_1 = __importDefault(require("../models/Post"));
const User_1 = __importDefault(require("../models/User"));
const likePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    // @ts-ignore
    const userId = req.userId;
    if (!userId) {
        throw (0, http_errors_1.default)(401, "Unauthorized Access");
    }
    if (!(0, mongoose_1.isValidObjectId)(postId)) {
        return next((0, http_errors_1.default)(400, "Invalid post ID"));
    }
    try {
        const newLike = new Like_1.LikeModel({
            post: postId,
            creator: userId,
        });
        yield Post_1.default.findByIdAndUpdate(postId, {
            $push: { likes: newLike._id }
        }, { new: true });
        yield User_1.default.findByIdAndUpdate(userId, {
            $push: { likedPosts: postId }
        }, { new: true });
        yield newLike.save();
        res.status(201).json({
            message: "Post liked successfully",
            like: newLike,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.likePost = likePost;
const unlikePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    // @ts-ignore
    const userId = req.userId;
    if (!(0, mongoose_1.isValidObjectId)(postId)) {
        return next((0, http_errors_1.default)(400, "Invalid post ID"));
    }
    try {
        yield Like_1.LikeModel.findOneAndDelete({
            post: postId,
            creator: userId,
        });
        yield Post_1.default.findByIdAndUpdate(postId, {
            $pull: { likes: postId },
        });
        yield User_1.default.findByIdAndUpdate(userId, {
            $pull: { likedPosts: postId },
        });
        res.status(200).json({ message: "Post unliked successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.unlikePost = unlikePost;
