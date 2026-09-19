import User from "../models/userModel.js";

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
    const { fullName, email, mobileNumber } = req.body;
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: currentUser._id },
      });
      if (existingUser) {
        const error = new Error("Email already in use");
        error.statusCode = 400;
        return next(error);
      }
    }
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      {
        ...(fullName && { fullName }),
        ...(email && { email }),
        ...(mobileNumber !== undefined && { mobileNumber }),
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
