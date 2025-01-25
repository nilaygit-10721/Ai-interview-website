const jwt = require("jsonwebtoken")
const schema = require("../models/User");
const saltRounds = 10;
const bcrypt = require("bcrypt")
require("dotenv").config()

const PRIVATE_KEY = process.env.JWT_SECRET;

exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingUser = await schema.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Account pehle se hai bhadwe"
            })
        }

        try {
            let hash;
            hash = await bcrypt.hash(password, saltRounds);
        }

        catch (e) {
            return res.status(400).json({
                success: false,
                message: "Error in hashing password"
            })
        }

        const data = await schema.create({ firstName, lastName, email, password: hash })
        
        res.status(200).json({
            success: true,
            message: "User created successfully"
        })


    }

    catch (e)
    {
        console.error(e);
        res.status(500).json({
            success: false,
            message: e.message
        })

    }

}


exports.login = async (req, res) => {
    let existingUser;
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(402).json({
            success: false,
            message:"Provide required details"
        })
    }
    existingUser = await schema.findOne({ email });

    if (!existingUser)
    {
        return res.status(400).json({
            success: false,
            message:"Account does not exists"
        })
    }

    try {
        const isSame = await bcrypt.compare(password, existingUser?.password);

        const payload = {
            email: existingUser.email,
            id: existingUser._id
        }

        if (isSame)
        {
            const token = await jwt.sign(payload, PRIVATE_KEY, { expiresIn: '1h' });
            existingUser = existingUser.toObject();
            existingUser.password = undefined;
            existingUser.token = token;


            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60),
                httpOnly:true,
            }

            res.status(200).json({
                success: true,
                token: token,
                data: existingUser,
                message:"Logged In Successfully"
            })
        }
        else {
            return res.status(402).json({
                success: false,
                message:"Incorrect password"
            })
        }
    }

    catch (e)
    {
        return res.status(500).json({
            success: false,
            message: "Error in log in"
        })
    }

}
