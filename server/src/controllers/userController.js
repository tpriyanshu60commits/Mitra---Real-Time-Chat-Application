import User from "../models/userModel.js";
import { uploadBufferToCloudinary } from "../config/cloudinary.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json({ data: users });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { fullName, mobileNumber } = req.body;
    let profilePicUrl = req.body.profilePic;

    if (req.file) {
      const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: "mitra_profile_pictures",
        resource_type: "image",
      });
      profilePicUrl = cloudinaryResult.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      {
        ...(fullName && { fullName }),
        ...(mobileNumber !== undefined && { mobileNumber }),
        ...(profilePicUrl && { profilePic: profilePicUrl }),
      },
      { new: true },
    ).select("-password");
    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfilePic = async (req, res, next) => {
  try {
    const currentUser = req.user;
    if (!req.file) {
      const error = new Error("Please select an image file to upload");
      error.statusCode = 400;
      return next(error);
    }

    const cloudinaryResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "mitra_profile_pictures",
      resource_type: "image",
    });

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { profilePic: cloudinaryResult.secure_url },
      { new: true },
    ).select("-password");

    res.status(200).json({
      message: "Profile photo updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
