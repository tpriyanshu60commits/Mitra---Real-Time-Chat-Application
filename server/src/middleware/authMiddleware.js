import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const Protect = async (req, res, next) => {
  try {
    let token = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }
    if (!token) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      return next(error);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const verifiedUser = await User.findById(decoded._id).select("-password");
    if (!verifiedUser) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      return next(error);
    }
    req.user = verifiedUser;
    next();
  } catch (error) {
    const err = new Error("Unauthorized");
    err.statusCode = 401;
    next(err);
  }
};
