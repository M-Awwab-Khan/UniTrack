import { storage } from "../index";
import { env } from "@uni-track/config/env";

console.log("Testing Cloudinary Storage...");

async function runTest() {
    try {
        // 1. Upload a sample image (using a public sample URL or base64)
        // Using a small transparent gif base64
        const sampleImage = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

        console.log("Uploading sample image...");
        const uploadResult = await storage.upload(sampleImage, {
            folder: "test-storage-package",
            publicId: `test-${Date.now()}`,
        });

        console.log("Upload successful!");
        console.log("Public ID:", uploadResult.public_id);
        console.log("Secure URL:", uploadResult.secure_url);

        // 2. Generate URL
        const generatedUrl = storage.getUrl(uploadResult.public_id, {
            width: 100,
            height: 100
        });
        console.log("Generated URL (100x100):", generatedUrl);

        // 3. Delete the image
        console.log("Deleting image...");
        const deleteResult = await storage.delete(uploadResult.public_id);

        if (deleteResult.result === 'ok' || deleteResult.result === 'not found') {
            console.log("Deletion successful:", deleteResult);
        } else {
            console.warn("Deletion result unexpected:", deleteResult);
        }

        console.log("Test passed!");
    } catch (error) {
        console.error("Test failed:", error);
        process.exit(1);
    }
}

runTest();
