import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  /**
   * Uploads a file buffer directly to Cloudinary using a stream.
   * This avoids saving the file to the local disk.
   *
   * @param {Buffer} fileBuffer - The file buffer from multer.memoryStorage
   * @param {string} originalFilename - Original filename
   * @param {string} folder - Cloudinary folder (default: 'ai-interviews')
   * @returns {Promise<Object>} Cloudinary upload result
   */
  uploadStream(fileBuffer, originalFilename, folder = "ai-interviews") {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "video", // Required for webm/audio/video files
          public_id: `${Date.now()}-${originalFilename || "recording"}`,
        },
        (error, result) => {
          if (error) {
            console.error("[CloudinaryService] Upload failed:", error);
            return reject(error);
          }
          resolve(result);
        }
      );

      // Write the buffer to the stream and end it
      uploadStream.end(fileBuffer);
    });
  }
}

export default new CloudinaryService();
