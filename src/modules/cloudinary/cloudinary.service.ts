import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

export class CloudinaryService {
  constructor() {
    cloudinary.config({
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  }

  private bufferToStream = (buffer: Buffer) => {
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    return readable;
  };

  upload = (file: Express.Multer.File): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
      const readableStream = this.bufferToStream(file.buffer);

      const isPdf = file.mimetype === "application/pdf";
      const originalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: isPdf ? "raw" : "image",
          ...(isPdf && {
            folder: "pdfs",
            public_id: originalName,
            access_mode: "public",
          }),
        },
        (err, result) => {
          if (err) return reject(err);
          if (!result) return reject(new Error("Upload failed"));
          resolve(result);
        },
      );

      readableStream.pipe(uploadStream);
    });
  };

  private extractPublicIdFromUrl = (url: string) => {
    const urlParts = url.split("/");
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split(".")[0];
    return publicId;
  };

  remove = async (secureUrl: string) => {
    const publicId = this.extractPublicIdFromUrl(secureUrl);
    return await cloudinary.uploader.destroy(publicId);
  };
}
