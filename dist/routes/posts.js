"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postController = __importStar(require("../controllers/posts"));
const isAuth_1 = require("../middlewares/isAuth");
const multer_1 = require("../middlewares/multer");
const router = express_1.default.Router();
router.get("/", postController.getPosts);
router.get("/recommendations", isAuth_1.isAuth, postController.getRecommendations);
router.get("/:slug", postController.getPostBySlug);
router
    .route("/create")
    .post(isAuth_1.isAuth, multer_1.upload.single("image"), postController.createPost);
router
    .route("/:postId")
    .patch(isAuth_1.isAuth, multer_1.upload.single("image"), postController.updatePost)
    .delete(isAuth_1.isAuth, postController.deletePost);
exports.default = router;
