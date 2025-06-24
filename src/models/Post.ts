import {Schema,InferSchemaType,model} from "mongoose";

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
     slug: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
      default:"https://placehold.co/800x500/png"
    },
    category: {
      type: String,
      required: true,
      default:"uncategorized"
    },
    tags: {
      type: [String],
      default: [],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    
  },
  { timestamps: true }
);

export type Post = InferSchemaType<typeof postSchema>

export default model<Post>("Post", postSchema);