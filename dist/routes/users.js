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
const userController = __importStar(require("../controllers/users"));
const isAuth_1 = require("../middlewares/isAuth");
const multer_1 = require("../middlewares/multer");
const router = express_1.default.Router();
router.put('/signup', userController.signUp);
router.post('/login', userController.login);
router.post('/forgot', userController.forgotPassword);
router.post('/refresh', userController.refreshToken);
router.post('/glogin', userController.googleLogin);
router.post('/logout', userController.logout);
router.get('/:username', userController.getProfile);
router.patch('/update', isAuth_1.isAuth, multer_1.upload.single("avatar"), userController.updateUser);
router.post('/update-viewed', isAuth_1.isAuth, userController.updateViewedPosts);
router.post('/remove', isAuth_1.isAuth, userController.removeUser);
router.post('/follow', isAuth_1.isAuth, userController.followUser);
router.post('/unfollow', isAuth_1.isAuth, userController.unfollowUser);
exports.default = router;
