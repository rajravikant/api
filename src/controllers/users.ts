import { RequestHandler } from "express";
import createHttpError from "http-errors";
import User from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { uploadFile } from "../middlewares/multer";

function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_TOKEN_SECRET!,
    {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN!,
    }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_TOKEN_SECRET!,
    {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN!,
    }
  );

  return { accessToken, refreshToken };
}

interface signUpBody {
  username?: string;
  email?: string;
  password?: string;
  avatar?: string;
}

export const signUp: RequestHandler<
  unknown,
  unknown,
  signUpBody,
  unknown
> = async (req, res, next) => {
  const { email, password, username } = req.body;
  try {
    if (!email || !password || !username) {
      throw createHttpError(400, "Please provide all fields");
    }
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      throw createHttpError(409, "Email already exists . Please login instead");
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw createHttpError(
        400,
        "Username already taken . Please try another one"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const Newuser = await User.create({
      email,
      password: hashedPassword,
      username,
    });

    res
      .status(201)
      .json({ message: "Account created succesfully", user: Newuser.username });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler<
  unknown,
  unknown,
  signUpBody,
  unknown
> = async (req, res, next) => {
  const { email, password, username } = req.body;
  try {
    if (!email && !username) {
      throw createHttpError(400, "Username or email is required");
    }
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    }).select("+password");
    if (!existingUser) {
      throw createHttpError(404, "User does not exist");
    }
    const isPasswordValid = await bcrypt.compare(
      password!,
      existingUser.password
    );

    if (!isPasswordValid) {
      throw createHttpError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = generateTokens(
      existingUser._id.toString()
    );

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
      })
      .json({
        message: "Login successful",
        accessToken,
        refreshToken,
        existingUser,
      });
  } catch (error) {
    next(error);
  }
};

export const googleLogin: RequestHandler<
  unknown,
  unknown,
  signUpBody,
  unknown
> = async (req, res, next) => {
  const { email, avatar, username } = req.body;
  try {
    if (!email || !username) {
      throw createHttpError(400, "Email or phone is required");
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const {accessToken,refreshToken} = generateTokens(existingUser._id.toString());
      res
        .status(200)
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
        })
        .json({
          message: "Login successful",
          accessToken,
          refreshToken,
          existingUser,
        });
      return;
    }
    const rawPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const NewUser = await User.create({
      email,
      password: hashedPassword,
      username,
      avatar,
    });
    const {accessToken,refreshToken} = generateTokens(NewUser._id.toString())
    
    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
      })
      .json({
        message: "Login success",
        accessToken,
        refreshToken,
        existingUser: NewUser,
      });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  // @ts-ignore
  // const userId: string | undefined = req.userId;

  const { accessToken, refreshToken } = req.cookies
  if (!accessToken || !refreshToken) {
    return res.sendStatus(204); // No Content
  }
  try {
    res
      .status(200)
      .clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
      })
      .status(204).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword: RequestHandler<
  unknown,
  unknown,
  signUpBody,
  unknown
> = async (req, res, next) => {
  const { email, username } = req.body;
  try {
    if (!email && !username) {
      throw createHttpError(400, "Email or username is required");
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (!existingUser) {
      throw createHttpError(404, "User does not exist");
    }
    const randomPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    await User.findByIdAndUpdate(existingUser._id, {
      password: hashedPassword,
    });
    res.status(200).json({ 
      message: "Password reset successful",
      newPassword: randomPassword
    });
  } catch (error) {
    next(error);
  }
};

export const removeUser: RequestHandler = async (req, res, next) => {
  // @ts-ignore
  const userId: string | undefined = req.userId;
  try {
    if (!userId) {
      throw createHttpError(401, "Unauthorized Access Cannot delete user");
    }
    await User.findByIdAndDelete(userId);

    // delete all posts and comments by user
    await Post.deleteMany({ creator: userId });
    await Comment.deleteMany({ creator: userId });

    res.status(200)
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    })
    .json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

interface updateUserBody {
  email?: string;
  username?: string;
  password?: string;
}

export const updateUser: RequestHandler<
  unknown,
  unknown,
  updateUserBody,
  unknown
> = async (req, res, next) => {
  // @ts-ignore
  const userId = req.userId as string | undefined;
  const file = req.file;
  let avatar: string | undefined;
  const { username, password, email } = req.body;
  
  try {
    if (!userId) {
      throw createHttpError(401, "Unauthorized Access Cannot update user");
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw createHttpError(404, "User does not exist");
    }
    if (file) {
      avatar = await uploadFile(file);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username: username || existingUser.username,
        email: email || existingUser.email,
        avatar: avatar || existingUser.avatar,
        password: password
          ? await bcrypt.hash(password, 10)
          : existingUser.password,
      },
      {
        new: true,
      }
    );
    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    next(error);
  }
};




export const getProfile: RequestHandler = async (req, res, next) => {
  const { username } = req.params;
  try {
    if (!username) {
      throw createHttpError(400, "Username is required");
    }
    const user = await User.findOne({ username }).populate({
      path: "posts",
      populate: {
        path: "creator",
      },
    });
    if (!user) {
      throw createHttpError(404, "User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const refreshToken: RequestHandler = async (req, res, next) => {
  const cookies = req.cookies;
  const body = req.body

  const refreshToken = cookies.refreshToken || body.refreshToken;
  if (!refreshToken) return res.sendStatus(401); // Unauthorized
  
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    );

    

    // @ts-ignore
    const user = await User.findById(decoded.id);
    if (!user) return res.sendStatus(403); // Forbidden

    
    const newAccessToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_ACCESS_TOKEN_SECRET!,
      {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN!,
      }
    );
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};


