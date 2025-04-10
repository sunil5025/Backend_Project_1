// require("dotenv").config({path: "./.env" });

import dotenv from "dotenv";
import connectDB from "./src/db/index2.js";


dotenv.config({
    path: './.env'
})


 connectDB()







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