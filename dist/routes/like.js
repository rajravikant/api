"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const isAuth_1 = require("../middlewares/isAuth");
const likes_1 = require("../controllers/likes");
router.route("/:postId")
    .post(isAuth_1.isAuth, likes_1.likePost)
    .delete(isAuth_1.isAuth, likes_1.unlikePost);
exports.default = router;
