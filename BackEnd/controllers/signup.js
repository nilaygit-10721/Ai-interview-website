const jwt = require("jsonwebtoken")
const schema = require("../models/User");
const e = require("cors");
const saltRounds = 10;


exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingUser = schema.findOne({ email });
        if (existingUser)
        {
            return res.status(400).json({
                success: false,
                message:"User already exists"
            })
        }
        let hash;
        hash = bcrypt.hash(password, saltRounds);

    }
    catch (e)
    {
        return res.status(400).json({
            success: false,
            message: e.message
        })
    }
}
