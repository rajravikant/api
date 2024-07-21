import mongoose, { ConnectOptions } from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!)

    console.log("Database connected successfully");
    
  } catch (error) {
    console.log("Error connecting to database: ", error);
  }
};

export default connectDb
