"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const notFound_1 = require("./middlewares/notFound");
const errorHandler_1 = require("./middlewares/errorHandler");
const posts_1 = __importDefault(require("./routes/posts"));
const users_1 = __importDefault(require("./routes/users"));
const comment_1 = __importDefault(require("./routes/comment"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const port = process.env.PORT || 5000;
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)({
    credentials: true,
    origin: true
}));
app.use(express_1.default.json({
    limit: "16kb",
}));
app.use((0, cookie_parser_1.default)());
app.use("/api/posts", posts_1.default);
app.use("/api/users", users_1.default);
app.use("/api/comment", comment_1.default);
app.use(notFound_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
mongoose_1.default.connect(process.env.MONGODB_URI).then(() => {
    console.log("Database connected successfully");
}).then(() => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}).catch((err) => {
    console.log(err);
});
exports.default = app;
