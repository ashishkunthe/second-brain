import mongoose, { model, Types, Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const tagSchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const contentTypes = ["image", "video", "article", "audio", "youtube", "tweet"];

const contentSchema = new Schema(
  {
    link: { type: String, required: true },
    type: { type: String, enum: contentTypes, required: true },
    title: { type: String, required: true },
    tags: [{ type: Types.ObjectId, ref: "Tag" }],
    userId: { type: Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const linkSchema = new Schema(
  {
    hash: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const UserModel = model("User", userSchema);
const TagModel = model("Tag", tagSchema);
const ContentModel = model("Content", contentSchema);
const LinkModel = model("Link", linkSchema);

export { UserModel, TagModel, ContentModel, LinkModel };
