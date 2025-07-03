import { RequestHandler } from "express";
import createHttpError from "http-errors";
import User from "../models/User";
import Post from "../models/Post";
import Comment from "../models/Comment";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { uploadFile } from "../middlewares/multer";
import { LikeModel } from "../models/Like";

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
    }).select("+password")
    
    
    
    
    
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
        user : {userId : existingUser._id.toString(), 
          username: existingUser.username,
          avatar: existingUser.avatar,
        },
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
          user : {userId : existingUser._id.toString(), username: existingUser.username,avatar: existingUser.avatar},
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
        user: { userId: NewUser._id.toString(), username: NewUser.username ,avatar: NewUser.avatar},
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

    // delete all posts, comments, and likes associated with the user
    await Post.deleteMany({ creator: userId });
    await Comment.deleteMany({ creator: userId });
    await LikeModel.deleteMany({ creator: userId });
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );



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
  bio?: string;
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
  const { username, password, email ,bio} = req.body;
  
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
        bio: bio || existingUser.bio,
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
    const user = await User.findOne({ username })
    .populate({ path : "posts",
      populate: {
        path : "creator"
      }
    })
    .populate("likedPosts","title slug imageUrl tags category")
    .populate("following","username avatar")
    .populate("followers","username avatar")
    
    
    
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


export const updateViewedPosts: RequestHandler = async (req, res, next) => {
  // @ts-ignore
  const userId: string | undefined = req.userId;
  const { postId } = req.body;

  try {
    if (!userId) {
      throw createHttpError(401, "Unauthorized Access Cannot update viewed posts");
    }
    if (!postId) {
      throw createHttpError(400, "Post ID is required");
    }

 

    const user = await User.findById(userId);
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    if (!user.viewedPosts.includes(postId)) {
      user.viewedPosts.push(postId);
      await user.save();
    }

    res.sendStatus(204)
  } catch (error) {
    next(error);
  }
}

// add userid to the following array of the user and add the userId to the followers array of the user being followed
// if the user is already following the user, do nothing
export const followUser: RequestHandler = async (req, res, next) => {
  // @ts-ignore
  const userId: string | undefined = req.userId;
  const { followUserId } = req.body;

  try {
    if (!userId) {
      throw createHttpError(401, "Unauthorized Access Cannot follow user");
    }
    if (!followUserId) {
      throw createHttpError(400, "Follow User ID is required");
    }

    const currentUser = await User.findById(userId);
    const followUser = await User.findById(followUserId);
    
    if (!currentUser) {
      throw createHttpError(404, "User not found");
    }
    if (!followUser) {
      throw createHttpError(404, "User to follow not found");
    }

    if (!currentUser.following.includes(followUserId)) {
      currentUser.following.push(followUserId);
      followUser.followers.push(currentUser._id);
      await currentUser.save();
      await followUser.save();
    }

    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
}

export const unfollowUser: RequestHandler = async (req, res, next) => {
  // @ts-ignore
  const userId: string | undefined = req.userId;
  const { unfollowUserId } = req.body;

  try {
    if (!userId) {
      throw createHttpError(401, "Unauthorized Access Cannot unfollow user");
    }
    if (!unfollowUserId) {
      throw createHttpError(400, "Unfollow User ID is required");
    }

    const currentUser = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowUserId);
    if (!currentUser) {
      throw createHttpError(404, "User not found");
    }
    if (!unfollowUser) {
      throw createHttpError(404, "User to unfollow not found");
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== unfollowUserId);
    unfollowUser.followers = unfollowUser.followers.filter(id => id.toString() !== userId);
    await currentUser.save();
    await unfollowUser.save();

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}
