import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { ContentModel, LinkModel, UserModel } from "./db";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";
import { generateRandomString } from "./utils";

dotenv.config();

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_CONNECT as string);

app.get("/", (req, res) => {
  res.json({
    message: "don't worry server is running",
  });
});

app.post("/api/v1/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    await UserModel.create({
      username,
      password,
    });

    res.status(200).json({
      message: "user signed up successfull",
    });
  } catch (e) {
    res.status(411).json({
      message: "user already exists",
    });
  }
});

app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const foundUser = await UserModel.findOne({
    username,
    password,
  });

  if (foundUser) {
    const token = jwt.sign(
      { id: foundUser._id },
      process.env.JWT_SECRET as string
    );
    res.status(200).json({
      message: token,
    });
  } else {
    res.status(403).json({
      message: "invalid credentials",
    });
  }
});

app.post("/api/v1/content", authMiddleware, async (req, res) => {
  const link = req.body.link;
  const type = req.body.type;
  const title = req.body.title;

  await ContentModel.create({
    link,
    type,
    title,
    userId: req.userId,
    tags: [],
  });

  res.json({
    message: "content created",
  });
});

app.get("/api/v1/content", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const content = await ContentModel.find({
    userId,
  }).populate("userId", "username");

  res.json({
    content,
  });
});

app.delete("/api/v1/content", authMiddleware, async (req, res) => {
  const contentId = req.body.contentId;

  await ContentModel.deleteMany({ _id: contentId, userId: req.userId });
  res.json({
    message: "deleted sucessfully",
  });
});

app.post("/api/v1/brain/share", authMiddleware, async (req, res) => {
  const { share } = req.body;

  if (share) {
    const existingUser = await LinkModel.findOne({
      userId: req.userId,
    });

    if (existingUser) {
      res.json({
        hash: existingUser.hash,
      });
      return;
    }

    const hash = generateRandomString(10);
    await LinkModel.create({
      userId: req.userId,
      hash: hash,
    });

    res.json({
      hash,
    });
  } else {
    await LinkModel.deleteOne({
      userId: req.userId,
    });
  }

  res.json({
    message: "new sharable link",
  });
});

//@ts-ignore
app.get("/api/v1/brain/:shareLink", async (req, res) => {
  try {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({ hash });
    if (!link) {
      return res.status(404).json({ message: "Invalid share link" });
    }

    const content = await ContentModel.find({ userId: link.userId });

    const user = await UserModel.findOne({ _id: link.userId });
    if (!user) {
      return res
        .status(500)
        .json({ message: "User does not exist (unexpected error)" });
    }

    return res.status(200).json({
      username: user.username,
      content: content,
    });
  } catch (error) {
    console.error("Error in /brain/:shareLink:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(3000);
