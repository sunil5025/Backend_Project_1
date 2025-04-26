import { v2 as cloudinary}  from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();

// Load environment variables from .env file (cloudinary)
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, // Click 'View API Keys' above to copy your API key
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});





// // Function to upload a file to Cloudinary by using local file path and try, catch method as well as async await keywords
const uploadOnCloudinary = async (localFilePath) =>{ 
    try{
        if(!localFilePath) return null;
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
                    resource_type: "auto"
       } );

        // file has been uploaded successfully
        // console.log('File is uploaded successfully:', response.url);
        fs.unlinkSync(localFilePath); // Delete the locally saved temporary file after upload
        return response;

        
    }catch (error) {
        console.error("Cloudinary Upload Failed:", error);
        if (fs.existsSync(localFilePath)) {         //when the file doesn't exist or is already removed, it'll throw another error. Use fs.existsSync() before deleting:
            fs.unlinkSync(localFilePath);
        } // Delete the locally saved temporary file if upload  failed
       return null; // Return null if upload failed

    } 
}





export { uploadOnCloudinary };





// // Example usage for uploading a file in Cloudinary [note:- copy from cloudinary websites]

// // Upload a file to Cloudinary
// const uploadResult = await cloudinary.uploader
// .upload(
//     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
//         public_id: 'shoes',
//     }
// )
// .catch((error) => {
//     console.log(error);
// });

// console.log(uploadResult);