import multer from "multer";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../config/firebase";
import createHttpError from "http-errors";
const multerStorage = multer.memoryStorage();
export const upload = multer({ storage: multerStorage });

export const uploadFile = async (file: Express.Multer.File) => {
    try {
        const filename = new Date().getTime() + "_" + file.originalname;
        const storageRef = ref(storage, filename);
        const snapshot = await uploadBytesResumable(storageRef, file.buffer, {
          contentType: file.mimetype,
        });
        const imageURL = await getDownloadURL(snapshot.ref);
        return imageURL;
    } catch (error) {
        const err = createHttpError(500, "Error while uploading file");
        console.error(error);
        throw err;
    }
};
