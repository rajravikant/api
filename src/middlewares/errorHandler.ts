import { Request,Response,NextFunction } from "express";
import {isHttpError} from "http-errors";
export const errorHandler = async (err: unknown, req:Request, res:Response, next:NextFunction) => {
    console.error(err);
    let status = 404
    let message = "internal server error"
  
    if (isHttpError(err)) {
      status = err.status
      message = err.message
    }
    res.status(status).json({ error: message });
  }