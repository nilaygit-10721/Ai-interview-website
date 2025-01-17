const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
dotenv.connect()

app.use(express.json())
app.use(
	cors({
		origin: "*",
		credentials: true,
	})
);
app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: "/tmp/",
	})
);


app.get("/", (req, res) => {
    return res.json({
        success: true,
        message:"Server Started Successfully",
    })
})

app.listen(PORT, () => {
    return res.json({
        success: true,
        message:"Port 4000 Running",
    })


    
})