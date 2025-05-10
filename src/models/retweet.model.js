import mongoose , {Schema} from "mongoose";
import {Tweet} from "./tweet.model.js";



const retweetSchema = new Schema(

    {
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"

        },
        content: {
            type: String,
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "user"
        }
    },{timestamps : true}         // Automatically add createdAt and updatedAt fields
)





export const Retweet = mongoose.model("Retweet", retweetSchema);