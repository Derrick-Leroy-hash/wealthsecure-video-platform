// Mock S3 Storage for local testing
// In production, this will be replaced with real S3 via Forge API

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function uploadToS3(fileBuffer, fileName, contentType) {
  try {
    const filePath = path.join(uploadsDir, fileName);
    const dir = path.dirname(filePath);
    
    // Create subdirectories if needed
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write file to disk
    fs.writeFileSync(filePath, fileBuffer);
    
    // Return mock S3 response
    return {
      key: fileName,
      url: `/uploads/${fileName}`,
    };
  } catch (error) {
    console.error('Mock S3 upload error:', error);
    throw error;
  }
}

export async function deleteFromS3(key) {
  try {
    const filePath = path.join(uploadsDir, key);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return true;
  } catch (error) {
    console.error('Mock S3 delete error:', error);
    throw error;
  }
}

export async function getSignedUrl(key, expiresIn = 3600) {
  try {
    // In local testing, just return the public URL
    return `/uploads/${key}`;
  } catch (error) {
    console.error('Mock get signed URL error:', error);
    throw error;
  }
}

