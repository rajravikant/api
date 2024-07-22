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
exports.getComments = exports.deleteComment = exports.updateComment = exports.createComment = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
const Post_1 = __importDefault(require("../models/Post"));
const http_errors_1 = __importDefault(require("http-errors"));
const createComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const creator = req.userId;
    const { postId } = req.params;
    const { text } = req.body;
    if (!creator) {
        throw (0, http_errors_1.default)(401, "Unauthorized Access");
    }
    if (!text || !postId) {
        throw (0, http_errors_1.default)(400, "Comment text and post id is required");
    }
    try {
        const comment = yield Comment_1.default.create({ creator, post: postId, text });
        yield Post_1.default.findOneAndUpdate({ _id: postId }, {
            $push: { comments: comment._id,
            },
        }, {
            new: true
        });
        const ct = yield Comment_1.default.findById(comment._id).populate("creator");
        res.status(201).json({ comment: ct });
    }
    catch (error) {
        next(error);
    }
});
exports.createComment = createComment;
const updateComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const creator = req.userId;
    const { commentId } = req.params;
    const { text } = req.body;
    if (!creator) {
        throw (0, http_errors_1.default)(401, "Unauthorized Access");
    }
    if (!commentId) {
        throw (0, http_errors_1.default)(400, "Comment id is required");
    }
    try {
        const comment = yield Comment_1.default.findOneAndUpdate({ _id: commentId, creator }, { text }, { new: true });
        if (!comment) {
            throw (0, http_errors_1.default)(404, "Comment not found");
        }
        res.status(200).json(comment);
    }
    catch (error) {
        next(error);
    }
});
exports.updateComment = updateComment;
const deleteComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const creator = req.userId;
    const { commentId } = req.params;
    if (!creator) {
        throw (0, http_errors_1.default)(401, "Unauthorized Access");
    }
    if (!commentId) {
        throw (0, http_errors_1.default)(400, "Comment id is required");
    }
    try {
        const comment = yield Comment_1.default.findByIdAndDelete(commentId);
        if (!comment) {
            throw (0, http_errors_1.default)(404, "Comment not found");
        }
        const postId = comment.post;
        yield Post_1.default.findByIdAndUpdate(postId, {
            $pull: { comments: commentId },
        });
        res.status(200).json({ message: "Comment deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteComment = deleteComment;
const getComments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    if (!postId) {
        throw (0, http_errors_1.default)(400, "Post id is required");
    }
    try {
        const comments = yield Comment_1.default.find({ post: postId }).populate("creator");
        res.status(200).json(comments);
    }
    catch (error) {
        next(error);
    }
});
exports.getComments = getComments;
