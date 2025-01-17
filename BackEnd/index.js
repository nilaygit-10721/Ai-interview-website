const express = require("express")
const dotenv = require("dotenv")
app = express()
dotenv.config();
const PORT = process.env.PORT || 4000;
const database = require("./config/database.js")

database.connect()

app.use(express.json())

// app.use(
// 	fileUpload({
// 		useTempFiles: true,
// 		tempFileDir: "/tmp/",
// 	})
// );


app.get("/", (req, res) => {
    return res.json({
        success: true,
        message:"Server Started Successfully",
    })
})

app.listen(PORT, () => {
    console.log(`App is listening at port ${PORT}`)
})