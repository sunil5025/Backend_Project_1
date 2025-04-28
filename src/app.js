import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";



const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))


app.use(express.json({ limit : "500kb"}))
app.use(express.urlencoded({extended : true, limit : "500kb"}))
app.use(express.static("Public"))
app.use(cookieParser())

 
// routes import
import userRouter from "./routes/user.routes.js";


// routes declaration
app.use("/api/v1/users", userRouter) // user routes because of middleware we used [app.use]

// http://localhost:8001/api/v1/users/register



export  { app }