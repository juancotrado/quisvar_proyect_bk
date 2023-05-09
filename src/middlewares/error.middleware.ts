import { Response, Request, NextFunction } from 'express';

interface ErrorProps {
  status: number;
  message: string;
  error_content: any;
}

export const handleError = async (
  error: ErrorProps,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { status, message, error_content } = error;
  res.status(status).json({ message, error_content });
};
