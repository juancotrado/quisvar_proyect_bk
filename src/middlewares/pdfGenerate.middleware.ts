import { ControllerFunction } from 'types/patterns';
import AppError from '../utils/appError';
import { config } from 'dotenv';
config();
class PdfGenerateMiddleware {
  public verifyToken: ControllerFunction = async (req, res, next) => {
    try {
      if (!process.env.IV || !process.env.SECRET_CODE)
        throw new AppError('invalid IV or SECRET CODE', 500);
      res.locals.IV = process.env.IV;
      res.locals.SECRET_CODE = process.env.SECRET_CODE;
      next();
    } catch (error) {
      next(error);
    }
  };
}
export default PdfGenerateMiddleware;
