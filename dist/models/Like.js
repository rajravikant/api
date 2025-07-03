"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LikeModel = void 0;
const mongoose_1 = require("mongoose");
const likeSchema = new mongoose_1.Schema({
    post: { type: mongoose_1.Schema.Types.ObjectId, ref: "Post", required: true },
    creator: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
likeSchema.index({ creator: 1, post: 1 }, { unique: true });
const LikeModel = (0, mongoose_1.model)("Like", likeSchema);
exports.LikeModel = LikeModel;
