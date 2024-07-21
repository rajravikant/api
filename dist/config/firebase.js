"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.app = void 0;
const app_1 = require("firebase/app");
const storage_1 = require("firebase/storage");
const firebaseConfig = {
    apiKey: "AIzaSyCXaCdKVk4Sxjn4zGXLIi3aTOi9u9oYF1M",
    authDomain: "react-http-1c328.firebaseapp.com",
    databaseURL: "https://react-http-1c328-default-rtdb.firebaseio.com",
    projectId: "react-http-1c328",
    storageBucket: "react-http-1c328.appspot.com",
    messagingSenderId: "271833015585",
    appId: "1:271833015585:web:912e47806a4ba36c7f4a60"
};
// Initialize Firebase
exports.app = (0, app_1.initializeApp)(firebaseConfig);
exports.storage = (0, storage_1.getStorage)(exports.app);
