import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";


const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))
app.use(express.static("public"))
app.use(cookieParser());


//Routes
import userRouter from "./router/user.router.js"
import vaultRouter from "./router/vault.router.js"
import shareLinkRouter from "./router/shareLink.router.js"


app.use("/api/users", userRouter)
app.use("/api/vaults", vaultRouter)
app.use("/api/share-links", shareLinkRouter)



export { app }