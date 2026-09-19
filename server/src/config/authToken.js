import jwt from "jsonwebtoken";

export const generateToken = (id, res) => {
  const token = jwt.sign({ _id: id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  if (res) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  return token;
};
