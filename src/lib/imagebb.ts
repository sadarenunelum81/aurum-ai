
/**
 * Uploads an image to ImageBB and returns the URL.
 * @param imageDataUri The base64 encoded image data URI.
 * @returns The URL of the uploaded image.
 */
export async function uploadImage(imageDataUri: string): Promise<string> {
    const apiKey = process.env.IMAGEBB_API_KEY;
    if (!apiKey) {
        throw new Error('ImageBB API key is not configured in environment variables.');
    }

    // ImageBB expects the raw base64 data, without the data URI prefix.
    const base64Data = imageDataUri.substring(imageDataUri.indexOf(',') + 1);

    const formData = new FormData();
    formData.append('image', base64Data);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('ImageBB Upload Error:', errorText);
        throw new Error(`ImageBB upload failed with status ${response.status}: ${errorText}`);
    }

    const jsonResponse = await response.json();

    if (jsonResponse.success && jsonResponse.data && jsonResponse.data.url) {
        return jsonResponse.data.url;
    } else {
        throw new Error(`ImageBB response did not include a success status or URL. Response: ${JSON.stringify(jsonResponse)}`);
    }
}
