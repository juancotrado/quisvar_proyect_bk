import app from "./app";
import * as dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT;
const HOST = process.env.HOST;
app.listen(PORT, () => {
  if (PORT && HOST) {
    console.log(`Server has running in 🚀 ==> http://${HOST}:${PORT}/`);
  } else {
    console.log("Could not connect to server 😥");
  }
});