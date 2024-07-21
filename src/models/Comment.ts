import { Schema, InferSchemaType, model } from "mongoose";

const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);

export type Comment = InferSchemaType<typeof commentSchema>;
export default model<Comment>("Comment", commentSchema);