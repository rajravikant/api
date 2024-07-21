import { RequestHandler } from "express";

export const corsHeader:RequestHandler = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
}