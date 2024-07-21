"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAuth_1 = require("../middlewares/isAuth");
const router = express_1.default.Router();
const comment_1 = require("../controllers/comment");
router.post("/:postId", isAuth_1.isAuth, comment_1.createComment);
router.get("/:postId", comment_1.getComments);
router.delete("/:commentId", isAuth_1.isAuth, comment_1.deleteComment);
router.patch("/:commentId", isAuth_1.isAuth, comment_1.updateComment);
exports.default = router;
