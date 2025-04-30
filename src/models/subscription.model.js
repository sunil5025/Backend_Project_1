
import mongoose, {Schema} from "mongoose";


// This is the subscription schema. It is used to store the subscription information of a user.
// It contains the subscriber and the channel that the subscriber is subscribed to.
const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId,   // one who is subscribing
        ref: "User",
        required: true
    },
    channel: {
        type: Schema.Types.ObjectId,   // one who is 'subscriber' is subscribing to this channel
        ref: "User"
    }
},{timestamps: true})






export const Subscription = mongoose.model("Subscription", subscriptionSchema)