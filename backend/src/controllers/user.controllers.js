import User from '../models/user.models.js';
import jwt from 'jsonwebtoken';
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import { generateToken, generateAccessTokenFromRefreshToken } from '../utils/token.utils.js';


export const userRegistration = asyncHandler(async (req, res) => {
    const { email, firstName, lastName, password, password2 } = req.body;

    if ([email, firstName, lastName, password, password2].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const userExists = await User.findOne({
        $or: [{ email: email }]
    });

    if (userExists) {
        throw new ApiError(400, "A user with this email or already exists");
    }

    if (password.trim().toLowerCase() !== password2.trim().toLowerCase()) {
        throw new ApiError(400, "Passwords do not match");
    }

    const user = await User.create({
        email: email,
        firstName: firstName,
        lastName: lastName,
        password: password,
        
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "An error occurred while creating the user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    );
});


export const login = asyncHandler(async(req, res)=>{
    console.log(req)
    const { email, password } = req.body;

    if ([email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const userCheck = await User.findOne({
        $or: [{ email: email }]
    });

    if (!userCheck) {
        throw new ApiError(400, "A user with this email not exists");
    }

    const passCheck = await userCheck.comparePassword(password)

    if (!passCheck) {
        throw new ApiError(401, "Invalid User Cradentials")
    }

    const {accessToken, refreshToken} = await generateToken(userCheck._id,userCheck.email)
    console.log(accessToken, refreshToken);

    userCheck.refreshToken = refreshToken;
    await userCheck.save();

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: userCheck},
                "User Logged In Successfully"
            )
        );

})

export const getMe = asyncHandler(async(req,res)=>{
    try {
    
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

   console.log("Authenticated user:", req.user);
    res.status(200).json(
      new ApiResponse(
                200,
                { user: req.user},
                "User Authenticated Successfully"
            )
    );
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
})

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  // If no refresh token, still clear cookies
  if (refreshToken) {
    await User.updateOne(
      { refreshToken },
      { $set: { refreshToken: null } }
    );
  }

  const cookieOptions = {
    httpOnly: true,
    secure: false, // true in production (HTTPS)
    sameSite: "lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});
