import { Request, Response, NextFunction } from 'express';
import { authServices } from '../services';
import { Prisma } from '@prisma/client';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body } = req;
    const result = await authServices.auth(body);
    console.log(result);
    if (result == false) {
      return res.status(400).json({ error: 'el Email no existe' });
    }
    if (!result) {
      return res.status(400).json({ error: 'contraseña incorrecta' });
    }
    const token = authServices.getToken(result);
    const { password, ...data } = result;
    res.json({ ...data, token });
    //   next({
    //     errorDescription: "Password don't match with user",
    //     status: 400,
    //     message: "La contraseña no coincide con el usuario",
    //     errorContent: "Password don't match with user",
    //   });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      res.status(400).json(error);
    }
  }
};
