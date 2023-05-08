import { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { UsersServices } from "../services";

export const showUsers = async (req: Request, res: Response, next: NextFunction) =>{
    try {
        const query = await UsersServices.getUsers()
        res.status(200).json(query)
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            res.status(400).json(error)
        }
    }
}