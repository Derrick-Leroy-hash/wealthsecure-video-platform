// S3 Storage Helper for Manus WebDev
// Uses the built-in FORGE API for S3 operations

const FORGE_API_URL = process.env.BUILT_IN_FORGE_API_URL;
const FORGE_API_KEY = process.env.BUILT_IN_FORGE_API_KEY;

export async function uploadToS3(fileBuffer, fileName, contentType) {
  try {
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: contentType });
    formData.append('file', blob, fileName);

    const response = await fetch(`${FORGE_API_URL}/storage/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FORGE_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      key: data.key,
      url: data.url,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
}

export async function deleteFromS3(key) {
  try {
    const response = await fetch(`${FORGE_API_URL}/storage/delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FORGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
    });

    if (!response.ok) {
      throw new Error(`S3 delete failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    throw error;
  }
}

export async function getSignedUrl(key, expiresIn = 3600) {
  try {
    const response = await fetch(`${FORGE_API_URL}/storage/signed-url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FORGE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, expiresIn }),
    });

    if (!response.ok) {
      throw new Error(`Get signed URL failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Get signed URL error:', error);
    throw error;
  }
}

