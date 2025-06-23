import express from 'express';
import * as userController from '../controllers/users';
import { isAuth } from '../middlewares/isAuth';
import { upload } from '../middlewares/multer';
const router = express.Router();



router.put('/signup',userController.signUp);
router.post('/login',userController.login);
router.post('/refresh',userController.refreshToken);
router.get('/:username',userController.getProfile);
router.patch('/update',isAuth,upload.single("avatar"),userController.updateUser);
router.post('/remove',isAuth,userController.removeUser);
router.post('/glogin',userController.googleLogin);
router.post('/logout',userController.logout);

export default router;