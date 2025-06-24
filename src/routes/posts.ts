import express from "express";
import * as postController from "../controllers/posts";
import { isAuth } from "../middlewares/isAuth";
import { upload } from "../middlewares/multer";
const router = express.Router();

router.get("/", postController.getPosts);
router
  .route("/create")
  .post(isAuth, upload.single("image"), postController.createPost);

router
  .route("/:postId")
  .patch(isAuth, upload.single("image"), postController.updatePost)
  .delete(isAuth, postController.deletePost);

export default router;
