
import FormData from 'form-data';

/**
 * Uploads an image to ImageBB and returns the URL.
 * @param base64Image The base64 encoded image string, without the data URI prefix.
 * @returns The URL of the uploaded image.
 */
export async function uploadImage(imageDataUri: string): Promise<string> {
    const apiKey = process.env.IMAGEBB_API_KEY;
    if (!apiKey) {
        throw new Error('ImageBB API key is not configured in environment variables.');
    }

    // ImageBB expects the raw base64 string, so we need to strip the data URI prefix
    // e.g., "data:image/png;base64,iVBORw0KGgo..." -> "iVBORw0KGgo..."
    const base64Data = imageDataUri.substring(imageDataUri.indexOf(',') + 1);

    const form = new FormData();
    form.append('image', base64Data);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: form as any, // Cast because fetch type definitions can be tricky with FormData
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ImageBB upload failed: ${response.statusText} - ${errorText}`);
    }

    const jsonResponse = await response.json();

    if (!jsonResponse.data || !jsonResponse.data.url) {
        throw new Error('ImageBB response did not include an image URL.');
    }

    return jsonResponse.data.url;
}
