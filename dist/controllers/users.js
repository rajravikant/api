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
exports.unfollowUser = exports.followUser = exports.updateViewedPosts = exports.refreshToken = exports.getProfile = exports.updateUser = exports.removeUser = exports.forgotPassword = exports.logout = exports.googleLogin = exports.login = exports.signUp = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const User_1 = __importDefault(require("../models/User"));
const Post_1 = __importDefault(require("../models/Post"));
const Comment_1 = __importDefault(require("../models/Comment"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const multer_1 = require("../middlewares/multer");
const Like_1 = require("../models/Like");
function generateTokens(userId) {
    const accessToken = jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    });
    const refreshToken = jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    });
    return { accessToken, refreshToken };
}
const signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    try {
        if (!email || !password || !username) {
            throw (0, http_errors_1.default)(400, "Please provide all fields");
        }
        const existingUserEmail = yield User_1.default.findOne({ email });
        if (existingUserEmail) {
            throw (0, http_errors_1.default)(409, "Email already exists . Please login instead");
        }
        const existingUsername = yield User_1.default.findOne({ username });
        if (existingUsername) {
            throw (0, http_errors_1.default)(400, "Username already taken . Please try another one");
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const Newuser = yield User_1.default.create({
            email,
            password: hashedPassword,
            username,
        });
        res
            .status(201)
            .json({ message: "Account created succesfully", user: Newuser.username });
    }
    catch (error) {
        next(error);
    }
});
exports.signUp = signUp;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    try {
        if (!email && !username) {
            throw (0, http_errors_1.default)(400, "Username or email is required");
        }
        const existingUser = yield User_1.default.findOne({
            $or: [{ email }, { username }],
        }).select("+password");
        if (!existingUser) {
            throw (0, http_errors_1.default)(404, "User does not exist");
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, existingUser.password);
        if (!isPasswordValid) {
            throw (0, http_errors_1.default)(401, "Invalid credentials");
        }
        const { accessToken, refreshToken } = generateTokens(existingUser._id.toString());
        res
            .status(200)
            .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
        })
            .json({
            message: "Login successful",
            accessToken,
            refreshToken,
            user: { userId: existingUser._id.toString(),
                username: existingUser.username,
                avatar: existingUser.avatar,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const googleLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, avatar, username } = req.body;
    try {
        if (!email || !username) {
            throw (0, http_errors_1.default)(400, "Email or phone is required");
        }
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            const { accessToken, refreshToken } = generateTokens(existingUser._id.toString());
            res
                .status(200)
                .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            })
                .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
            })
                .json({
                message: "Login successful",
                accessToken,
                refreshToken,
                user: { userId: existingUser._id.toString(), username: existingUser.username, avatar: existingUser.avatar },
            });
            return;
        }
        const rawPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = yield bcrypt_1.default.hash(rawPassword, 10);
        const NewUser = yield User_1.default.create({
            email,
            password: hashedPassword,
            username,
            avatar,
        });
        const { accessToken, refreshToken } = generateTokens(NewUser._id.toString());
        res
            .status(200)
            .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
        })
            .json({
            message: "Login success",
            accessToken,
            refreshToken,
            user: { userId: NewUser._id.toString(), username: NewUser.username, avatar: NewUser.avatar },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.googleLogin = googleLogin;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    // const userId: string | undefined = req.userId;
    const { accessToken, refreshToken } = req.cookies;
    if (!accessToken || !refreshToken) {
        return res.sendStatus(204); // No Content
    }
    try {
        res
            .status(200)
            .clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
        })
            .clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        })
            .status(204).json({ message: "Logout successful" });
    }
    catch (error) {
        next(error);
    }
});
exports.logout = logout;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username } = req.body;
    try {
        if (!email && !username) {
            throw (0, http_errors_1.default)(400, "Email or username is required");
        }
        const existingUser = yield User_1.default.findOne({ $or: [{ email }, { username }] });
        if (!existingUser) {
            throw (0, http_errors_1.default)(404, "User does not exist");
        }
        const randomPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = yield bcrypt_1.default.hash(randomPassword, 10);
        yield User_1.default.findByIdAndUpdate(existingUser._id, {
            password: hashedPassword,
        });
        res.status(200).json({
            message: "Password reset successful",
            newPassword: randomPassword
        });
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
const removeUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    try {
        if (!userId) {
            throw (0, http_errors_1.default)(401, "Unauthorized Access Cannot delete user");
        }
        yield User_1.default.findByIdAndDelete(userId);
        // delete all posts, comments, and likes associated with the user
        yield Post_1.default.deleteMany({ creator: userId });
        yield Comment_1.default.deleteMany({ creator: userId });
        yield Like_1.LikeModel.deleteMany({ creator: userId });
        yield User_1.default.updateMany({ following: userId }, { $pull: { following: userId } });
        yield User_1.default.updateMany({ followers: userId }, { $pull: { followers: userId } });
        res.status(200)
            .clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
        })
            .clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        })
            .json({ message: "User deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.removeUser = removeUser;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const file = req.file;
    let avatar;
    const { username, password, email, bio } = req.body;
    try {
        if (!userId) {
            throw (0, http_errors_1.default)(401, "Unauthorized Access Cannot update user");
        }
        const existingUser = yield User_1.default.findById(userId);
        if (!existingUser) {
            throw (0, http_errors_1.default)(404, "User does not exist");
        }
        if (file) {
            avatar = yield (0, multer_1.uploadFile)(file);
        }
        const updatedUser = yield User_1.default.findByIdAndUpdate(userId, {
            username: username || existingUser.username,
            email: email || existingUser.email,
            avatar: avatar || existingUser.avatar,
            bio: bio || existingUser.bio,
            password: password
                ? yield bcrypt_1.default.hash(password, 10)
                : existingUser.password,
        }, {
            new: true,
        });
        res.status(200).json({ message: "User updated successfully", updatedUser });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUser = updateUser;
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.params;
    try {
        if (!username) {
            throw (0, http_errors_1.default)(400, "Username is required");
        }
        const user = yield User_1.default.findOne({ username })
            .populate({ path: "posts",
            populate: {
                path: "creator"
            }
        })
            .populate("likedPosts", "title slug imageUrl tags category")
            .populate("following", "username avatar")
            .populate("followers", "username avatar");
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getProfile = getProfile;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = req.cookies;
    const body = req.body;
    const refreshToken = cookies.refreshToken || body.refreshToken;
    if (!refreshToken)
        return res.sendStatus(401); // Unauthorized
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
        // @ts-ignore
        const user = yield User_1.default.findById(decoded.id);
        if (!user)
            return res.sendStatus(403); // Forbidden
        const newAccessToken = jsonwebtoken_1.default.sign({ id: user._id.toString() }, process.env.JWT_ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
        });
        res.status(200).json({ accessToken: newAccessToken });
    }
    catch (error) {
        next(error);
    }
});
exports.refreshToken = refreshToken;
const updateViewedPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const { postId } = req.body;
    try {
        if (!userId) {
            throw (0, http_errors_1.default)(401, "Unauthorized Access Cannot update viewed posts");
        }
        if (!postId) {
            throw (0, http_errors_1.default)(400, "Post ID is required");
        }
        const user = yield User_1.default.findById(userId);
        if (!user) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        if (!user.viewedPosts.includes(postId)) {
            user.viewedPosts.push(postId);
            yield user.save();
        }
        res.sendStatus(204);
    }
    catch (error) {
        next(error);
    }
});
exports.updateViewedPosts = updateViewedPosts;
// add userid to the following array of the user and add the userId to the followers array of the user being followed
// if the user is already following the user, do nothing
const followUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const { followUserId } = req.body;
    try {
        if (!userId) {
            throw (0, http_errors_1.default)(401, "Unauthorized Access Cannot follow user");
        }
        if (!followUserId) {
            throw (0, http_errors_1.default)(400, "Follow User ID is required");
        }
        const currentUser = yield User_1.default.findById(userId);
        const followUser = yield User_1.default.findById(followUserId);
        if (!currentUser) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        if (!followUser) {
            throw (0, http_errors_1.default)(404, "User to follow not found");
        }
        if (!currentUser.following.includes(followUserId)) {
            currentUser.following.push(followUserId);
            followUser.followers.push(currentUser._id);
            yield currentUser.save();
            yield followUser.save();
        }
        res.sendStatus(201);
    }
    catch (error) {
        next(error);
    }
});
exports.followUser = followUser;
const unfollowUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const { unfollowUserId } = req.body;
    try {
        if (!userId) {
            throw (0, http_errors_1.default)(401, "Unauthorized Access Cannot unfollow user");
        }
        if (!unfollowUserId) {
            throw (0, http_errors_1.default)(400, "Unfollow User ID is required");
        }
        const currentUser = yield User_1.default.findById(userId);
        const unfollowUser = yield User_1.default.findById(unfollowUserId);
        if (!currentUser) {
            throw (0, http_errors_1.default)(404, "User not found");
        }
        if (!unfollowUser) {
            throw (0, http_errors_1.default)(404, "User to unfollow not found");
        }
        currentUser.following = currentUser.following.filter(id => id.toString() !== unfollowUserId);
        unfollowUser.followers = unfollowUser.followers.filter(id => id.toString() !== userId);
        yield currentUser.save();
        yield unfollowUser.save();
        res.sendStatus(204);
    }
    catch (error) {
        next(error);
    }
});
exports.unfollowUser = unfollowUser;
