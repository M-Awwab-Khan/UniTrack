import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { env } from "@uni-track/config/env";

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

/* ---------------------------------------------
   Types
---------------------------------------------- */

export type StorageResourceType = "image" | "video" | "raw" | "auto";

export type UploadInput =
    | string // base64 or remote URL
    | Buffer;

export type UploadOptions = {
    folder: string; // REQUIRED for consistency
    publicId?: string;
    resourceType?: StorageResourceType;
    tags?: string[];
};

export type StoredFile = {
    publicId: string;
    url: string;
    bytes: number;
    format?: string;
    resourceType: StorageResourceType;
};

/* ---------------------------------------------
   Helpers
---------------------------------------------- */

const extractStoredFile = (
    result: UploadApiResponse
): StoredFile => ({
    publicId: result.public_id,
    url: result.secure_url,
    bytes: result.bytes,
    format: result.format,
    resourceType: result.resource_type as StorageResourceType,
});

/* ---------------------------------------------
   Storage Service
---------------------------------------------- */

export const storage = {
    /**
     * Upload a file to Cloudinary
     */
    async upload(
        file: UploadInput,
        options: UploadOptions
    ): Promise<StoredFile> {
        if (!options.folder) {
            throw new Error("Upload folder is required");
        }

        const result = await cloudinary.uploader.upload(
            typeof file === "string" ? file : `data:application/octet-stream;base64,${file.toString("base64")}`,
            {
                folder: options.folder,
                public_id: options.publicId,
                resource_type: options.resourceType ?? "auto",
                tags: options.tags,
            }
        );

        return extractStoredFile(result);
    },

    /**
     * Delete a file from Cloudinary
     */
    async delete(
        publicId: string,
        resourceType: StorageResourceType = "image"
    ) {
        return cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
        });
    },

    /**
     * Generate a secure URL
     */
    getUrl(
        publicId: string,
        options?: {
            width?: number;
            height?: number;
            crop?: "scale" | "fill" | "fit";
        }
    ) {
        return cloudinary.url(publicId, {
            secure: true,
            width: options?.width,
            height: options?.height,
            crop: options?.crop ?? "scale",
        });
    },
};

