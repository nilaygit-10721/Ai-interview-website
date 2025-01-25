const express = require("express")
const dotenv = require("dotenv")
app = express()
dotenv.config();
const PORT = process.env.PORT || 4000;
const database = require("./config/database.js")



app.use(express.json())

// app.use(
// 	fileUpload({
// 		useTempFiles: true,
// 		tempFileDir: "/tmp/",
// 	})
// );

const user = require("./routes/routes.js")
app.use("/api/v1", user);

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message:"Server Started Successfully",
    })
})

app.listen(PORT, (req,res) => {
    console.log(`App is listening at port ${PORT}`)    
})


app.get("/", (req, res) => {
    res.send('<h1>This is my homepage</h1>');
})

database.connect()