import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { ContentModel, UserModel } from "./db";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";

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

app.get("/api/v1/content", (req, res) => {});

app.delete("/api/v1/content", (req, res) => {});

app.post("/api/v1/brain/share", (req, res) => {});

app.get("/api/v1/brain/:shareLink", (req, res) => {});

app.listen(3000);
