import { NextFunction, Request, Response } from 'express';

export type CheckRoleType = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
