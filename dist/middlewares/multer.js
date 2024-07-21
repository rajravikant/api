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
exports.uploadFile = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage_1 = require("firebase/storage");
const firebase_1 = require("../config/firebase");
const http_errors_1 = __importDefault(require("http-errors"));
const multerStorage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({ storage: multerStorage });
const uploadFile = (file) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filename = new Date().getTime() + "_" + file.originalname;
        const storageRef = (0, storage_1.ref)(firebase_1.storage, filename);
        const snapshot = yield (0, storage_1.uploadBytesResumable)(storageRef, file.buffer, {
            contentType: file.mimetype,
        });
        const imageURL = yield (0, storage_1.getDownloadURL)(snapshot.ref);
        return imageURL;
    }
    catch (error) {
        const err = (0, http_errors_1.default)(500, "Error while uploading file");
        console.error(error);
        throw err;
    }
});
exports.uploadFile = uploadFile;
