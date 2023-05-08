import express, { Request, Response, NextFunction } from "express";
import * as dotenv from "dotenv";

dotenv.config();
export const app = express();

const mainRoute = process.env.ROUTE;
const host = process.env.HOST;

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    message: "Wellcome QuisVar backendProject",
    url: `http://${host}/${mainRoute}`,
  });
});

export default app;
