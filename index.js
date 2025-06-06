// require("dotenv").config({path: "./.env" });

import dotenv from "dotenv";
import connectDB from "./src/db/index2.js";
import { app } from "./src/app.js";

dotenv.config({
    path: "./env"
})


 connectDB()
 .then(() => {
    app.listen(process.env.PORT || 8001, () => {
        console.log(`Server is running on PORT : 8001 [Congratulation]  ${process.env.PORT}`);
    })
 })
 .catch((error) => {
    console.log("MONGO DB Connection Error", error);
 })







/*
import express from "express";
const app = express()

;(async() => {
    try{
        mongoose.connect(`{process.env.MONGODB_URI}`)
        app.on("error", () => {
            console.log("Error connecting to database", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on PORT $ {process.env.PORT}`);

        })

    } catch(error){
        console.log("Error", error)
        throw error

    }
})()


*/