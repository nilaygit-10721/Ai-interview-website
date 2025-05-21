const User = require("../models/User");

// @desc   Get current user details
// @route  GET /api/user/profile
// @access Private
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId)
      .select("-password") // exclude password
      .populate("resumes")
      .populate("coverLetters");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
