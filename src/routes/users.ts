import express from 'express';
import * as userController from '../controllers/users';
import { isAuth } from '../middlewares/isAuth';
import { upload } from '../middlewares/multer';
const router = express.Router();
router.put('/signup',userController.signUp);
router.post('/login',userController.login);
router.post('/forgot',userController.forgotPassword);
router.post('/refresh',userController.refreshToken);
router.post('/glogin',userController.googleLogin);
router.post('/logout',userController.logout);
router.get('/:username',userController.getProfile);
router.patch('/update',isAuth,upload.single("avatar"),userController.updateUser);
router.post('/update-viewed',isAuth,userController.updateViewedPosts);
router.post('/remove',isAuth,userController.removeUser);
router.post('/follow', isAuth, userController.followUser);
router.post('/unfollow', isAuth, userController.unfollowUser);

export default router;