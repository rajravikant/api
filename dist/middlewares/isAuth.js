"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = (req, res, next) => {
    var _a, _b;
    try {
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) || ((_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.split(" ")[1]);
        if (!token) {
            throw (0, http_errors_1.default)(401, "Unauthorized Access");
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
        if (!decodedToken) {
            throw (0, http_errors_1.default)(403, "Invalid token or expired");
        }
        // @ts-ignore
        req.userId = decodedToken.id;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.isAuth = isAuth;
