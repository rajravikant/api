import express from "express";
const router = express.Router();
import { isAuth } from "../middlewares/isAuth";
import { likePost, unlikePost } from "../controllers/likes";

router.route("/:postId")
  .post(isAuth, likePost)
  .delete(isAuth, unlikePost);

export default router;
