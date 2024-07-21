import { RequestHandler } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken"




export const isAuth:RequestHandler  = (req, res, next) => {
    try {
     const token:string|undefined  = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];
     if (!token) {
       throw createHttpError(401, "Unauthorized Access");
     }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    if (!decodedToken) {
      throw createHttpError(401, "JWT Malfunctioned please login again");
    }
    // @ts-ignore
    req.userId = decodedToken.id;
    next();
   } catch (error) {
        next(error)
   }

};
