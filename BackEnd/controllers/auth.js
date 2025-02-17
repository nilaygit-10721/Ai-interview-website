const jwt = require("jsonwebtoken");
const schema = require("../models/User");
const bcrypt = require("bcrypt");
require("dotenv").config();
const saltRounds = 10;


exports.signup = async (req, res) => {
    try {
        const {email,password,firstName,lastName } = req.body;
        
        //Checking is user already exists in the database
        const existingUser = await schema.findOne({ email });
        console.log(existingUser);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message:"User already exists NOOB"
            })
        }

        //Hashing our password
        //For the example 
        //https://blog.logrocket.com/password-hashing-node-js-bcrypt/#:~:text=Examples%20of%20password%20hashing%20with%20bcrypt%20in%20Node.js,bcrypt.compare%20function%20to%20hash%20passwords%20in%20Node.js%20
        let hash;
        try {
            hash = await bcrypt.hash(password, saltRounds)
        }

        catch (err) {
            return res.status(400).json({
                success: false,
                message:"HASH cannot be created"
            })
        }

        //Creating our object/document and pushing to database
        const data = await schema.create({email,password:hash, firstName,lastName })

                    res.status(200).json({
                        sucess:true,
                         Info:data
                })
    }

    catch (err)
    {
        console.error(err);
        res.status(500).json({
            success: false,
            error:err.message
        })
    }
}

exports.login = async (req, res) => {
	try {
		// Get email and password from request body
		const { email, password } = req.body;

		// Check if email or password is missing
		if (!email || !password) {
			// Return 400 Bad Request status code with error message
			return res.status(400).json({
				success: false,
				message: `Please Fill up All the Required Fields`,
			});
		}

		// Find user with provided email
		const user = await schema.findOne({ email })

		// If user not found with provided email
		if (!user) {
			// Return 401 Unauthorized status code with error message
			return res.status(401).json({
				success: false,
				message: `User is not Registered with Us Please SignUp to Continue`,
			});
        }
        
		// Generate JWT token and Compare Password
		if (await bcrypt.compare(password, user.password)) {
			let token = jwt.sign(
				{ email: user.email, id: user._id },
				process.env.JWT_SECRET,
				{
					expiresIn: "24h",
				}
			);

			// Save token to user document in database
			user.token = token;
			user.password = undefined;
			// Set cookie for token and return success response
			const options = {
				expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
				httpOnly: true,
			};
			res.cookie("token", token, options).status(200).json({
				success: true,
				token,
				user,
				message: `User Login Success`,
			});
		} else {
			return res.status(401).json({
				success: false,
				message: `Password is incorrect`,
			});
		}
	} catch (error) {
		console.error(error);
		// Return 500 Internal Server Error status code with error message
		return res.status(500).json({
			success: false,
			message: `Login Failure Please Try Again`,
		});
	}
};
