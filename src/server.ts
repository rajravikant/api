import express, { RequestHandler } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgran from "morgan";
import cors from "cors";
import { notFoundHandler } from "./middlewares/notFound";
import { errorHandler } from "./middlewares/errorHandler";
import postRoutes from "./routes/posts";
import userRoutes from "./routes/users";
import commentRoutes from "./routes/comment";
import mongoose from "mongoose";
dotenv.config();

const port = process.env.PORT || 5000 ;

const app = express();

app.use(morgran("dev"));
app.use(cors({
  credentials:true,
  origin:true
}));
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(cookieParser());



app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comment", commentRoutes);

app.use(notFoundHandler);

app.use(errorHandler);  



mongoose.connect(process.env.MONGODB_URI!).then(() => {
  console.log("Database connected successfully");
}).then(()=>{
  app.listen(port,() => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}).catch((err) => {
  console.log(err);
  
})



export default app;
