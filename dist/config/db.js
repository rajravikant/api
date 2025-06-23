"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
function connectDB() {
    const dbURI = process.env.MONGODB_URI;
    if (!dbURI) {
        throw new Error("MONGODB_URI is not defined in environment variables");
    }
    return mongoose_1.default.connect(dbURI);
}
