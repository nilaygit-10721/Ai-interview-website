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
<<<<<<< HEAD
    console.log(`App is listening at port ${PORT}`)
=======
    return res.json({
        success: true,
        message:"Port 4000 Running",
    })


    
>>>>>>> 5073ab1a7a4bff07e40d779b44907707014edba4
})