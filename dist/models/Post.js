"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    content: {
        type: String,
        required: true,
    },
    summary: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
        default: "https://placehold.co/800x500/png"
    },
    category: {
        type: String,
        required: true,
        default: "uncategorized"
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    creator: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    comments: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Comment",
        },
    ],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Post", postSchema);
