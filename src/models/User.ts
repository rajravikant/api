import mongoose, { Schema, InferSchemaType, model } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String,unique: true },
    phone: { type: String,unique: true },
    password: { type: String, required: true, select: false },
    avatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);
