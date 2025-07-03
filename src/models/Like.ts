import { Schema, InferSchemaType, model } from "mongoose";

const likeSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

likeSchema.index({ creator: 1, post: 1 }, { unique: true });

type Like = InferSchemaType<typeof likeSchema>;

const LikeModel = model("Like", likeSchema);

export { LikeModel, Like };