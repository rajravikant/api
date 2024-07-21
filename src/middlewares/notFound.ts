import {RequestHandler } from "express";
import createHttpError from "http-errors"


export const notFoundHandler:RequestHandler  =  (req, res, next) => {
    next(createHttpError(404, "ENDPOINT NOT FOUND"));
}