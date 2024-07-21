import express from "express";
import { isAuth } from "../middlewares/isAuth";
const router = express.Router();
import { createComment, updateComment, deleteComment,getComments } from "../controllers/comment";

router.post("/:postId", isAuth, createComment);

router.get("/:postId", getComments);

router.delete("/:commentId", isAuth, deleteComment);

router.patch("/:commentId", isAuth, updateComment);



export default router;