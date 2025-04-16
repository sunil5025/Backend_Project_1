 import {asyncHandler} from "../utility(utils)/async_handler.js";


 const registerUser = asyncHandler(async (req, res) => {

        res.status(200).json({
         success: true,
         message: "OK"
    })

 })




 export {registerUser} 
