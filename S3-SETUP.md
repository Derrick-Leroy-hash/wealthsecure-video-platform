# AWS S3 Setup for Video Storage

## Why S3?
- Unlimited storage for videos
- Fast CDN delivery
- Automatic backups
- Pay only for what you use (~$0.023/GB/month)

## Step 1: Create S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Click **"Create bucket"**
3. Settings:
   - **Bucket name**: `wealthsecure-videos` (must be globally unique)
   - **Region**: Choose closest to your users (e.g., us-east-1)
   - **Block Public Access**: Uncheck "Block all public access"
   - Check the warning acknowledgment
4. Click **"Create bucket"**

## Step 2: Configure Bucket CORS

1. Click on your bucket
2. Go to **"Permissions"** tab
3. Scroll to **"Cross-origin resource sharing (CORS)"**
4. Click **"Edit"** and paste:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

5. Click **"Save changes"**

## Step 3: Create IAM User for S3 Access

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click **"Users"** → **"Add users"**
3. User name: `wealthsecure-s3-user`
4. Select **"Access key - Programmatic access"**
5. Click **"Next: Permissions"**
6. Click **"Attach existing policies directly"**
7. Search and select: **"AmazonS3FullAccess"**
8. Click **"Next"** until **"Create user"**
9. **IMPORTANT**: Download the CSV with Access Key ID and Secret Access Key

## Step 4: Update Environment Variables

Add these to your `.env` file on Lightsail:

```env
# Existing variables...
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=production

# Add S3 credentials
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_ACCESS_KEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=wealthsecure-videos
```

## Step 5: Update Storage Module

The application is already configured to use S3. Just make sure `server/index.js` imports from `./storage.js` (not `./storage-mock.js`).

Current configuration in `server/storage.js` uses a Forge API. For direct AWS S3, replace with:

```javascript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadToS3(fileBuffer, fileName, contentType) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return {
    key: fileName,
    url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`,
  };
}

export async function deleteFromS3(key) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  });

  await s3Client.send(command);
  return true;
}
```

## Step 6: Install AWS SDK

```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Step 7: Restart Application

```bash
pm2 restart wealthsecure-video
```

## Testing S3 Upload

1. Go to your platform
2. Try uploading a video
3. Check your S3 bucket - the video should appear there
4. The video should play from S3 URL

## Cost Estimate

- **Storage**: $0.023/GB/month
- **Requests**: $0.005 per 1,000 PUT requests
- **Data transfer**: First 100GB/month free

**Example**: 100 videos (50GB) = ~$1.15/month

## Troubleshooting

### Videos not uploading
- Check IAM user has S3 permissions
- Verify bucket name in .env
- Check CORS configuration

### Videos not playing
- Make sure bucket is not blocking public access
- Check video URLs in database

### Access Denied errors
- Verify AWS credentials in .env
- Check IAM user permissions

