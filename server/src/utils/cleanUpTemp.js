import fs from "fs/promises";

const cleanUpTemp = async (filePath) => {
    if (!filePath) return;

    try {
        await fs.access(filePath); // Check if the file exists
        await fs.unlink(filePath); // Delete the file
        console.log(`Temporary file deleted: ${filePath}`);
    } catch (err) {
        console.error("Error cleaning up temporary file:", err);
    }
};

export default cleanUpTemp;
