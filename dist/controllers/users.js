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
exports.getProfile = exports.updateUser = exports.removeUser = exports.forgotPassword = exports.logout = exports.phoneLogin = exports.googleLogin = exports.login = exports.signUp = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const User_1 = __importDefault(require("../models/User"));
const Post_1 = __importDefault(require("../models/Post"));
const Comment_1 = __importDefault(require("../models/Comment"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const multer_1 = require("../middlewares/multer");
const signUp = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username, phone } = req.body;
    try {
        if (!email || !password || !username || !phone) {
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
            phone,
        });
        res.status(201).json(Newuser);
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
        const accessToken = jsonwebtoken_1.default.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        res
            .status(200)
            .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        })
            .json({
            message: "Login successful",
            accessToken,
            existingUser,
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
        if (!email || !avatar || !username) {
            throw (0, http_errors_1.default)(400, "Email or phone is required");
        }
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            const accessToken = jsonwebtoken_1.default.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN,
            });
            res
                .status(200)
                .cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: true,
            })
                .json({
                message: "Login successful",
                accessToken,
                existingUser,
            });
            return;
        }
        const randomPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = yield bcrypt_1.default.hash(randomPassword, 10);
        const NewUser = yield User_1.default.create({
            email,
            password: hashedPassword,
            username,
            avatar,
        });
        res.status(201).json(NewUser);
    }
    catch (error) {
        next(error);
    }
});
exports.googleLogin = googleLogin;
const phoneLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { });
exports.phoneLogin = phoneLogin;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    try {
        if (!userId) {
            throw (0, http_errors_1.default)(401, "Unauthorized Access Cannot logout");
        }
        res
            .status(200)
            .clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
        })
            .json({ message: "Logged out successfully" });
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
        res.status(200).json({ message: "Password reset successful" });
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
        // delete all posts and comments by user
        yield Post_1.default.deleteMany({ creator: userId });
        yield Comment_1.default.deleteMany({ creator: userId });
        res.status(200).json({ message: "User deleted successfully" });
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
    const { username, phone, password, posts, email } = req.body;
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
            phone: phone || existingUser.phone,
            avatar: avatar || existingUser.avatar,
            password: password
                ? yield bcrypt_1.default.hash(password, 10)
                : existingUser.password,
            posts: posts || existingUser.posts,
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
        const user = yield User_1.default.findOne({ username }).populate({
            path: "posts",
            populate: {
                path: "creator"
            }
        });
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
