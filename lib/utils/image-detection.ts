/**
 * Utility functions for detecting and extracting images from message content
 */

/**
 * Check if a string contains base64 image data
 */
export function containsBase64Image(text: string): boolean {
  return /data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/.test(text);
}

/**
 * Extract base64 images from text
 */
export function extractBase64Images(text: string): string[] {
  const regex = /data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+/g;
  return text.match(regex) || [];
}

/**
 * Check if a string contains image URLs
 */
export function containsImageUrl(text: string): boolean {
  return /https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp|svg)(\?[^\s]*)?/i.test(text);
}

/**
 * Extract image URLs from text
 */
export function extractImageUrls(text: string): string[] {
  const regex = /https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp|svg)(\?[^\s]*)?/gi;
  return text.match(regex) || [];
}

/**
 * Process text to extract and display images separately
 */
export function processTextForImages(text: string): {
  cleanedText: string;
  images: Array<{ url: string; type: 'base64' | 'url' }>;
} {
  const images: Array<{ url: string; type: 'base64' | 'url' }> = [];
  let cleanedText = text;

  // Extract base64 images
  const base64Images = extractBase64Images(text);
  base64Images.forEach(img => {
    images.push({ url: img, type: 'base64' });
    cleanedText = cleanedText.replace(img, '');
  });

  // Extract image URLs (but not if they're in markdown image syntax)
  const imageUrls = extractImageUrls(text);
  imageUrls.forEach(url => {
    // Check if this URL is not already in markdown image syntax
    const markdownImagePattern = new RegExp(`!\\[.*?\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'i');
    if (!markdownImagePattern.test(cleanedText)) {
      images.push({ url, type: 'url' });
      // Remove standalone URLs from text since they'll be displayed as images
      cleanedText = cleanedText.replace(url, '').trim();
    }
  });

  // Clean up any resulting double spaces or empty lines
  cleanedText = cleanedText.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  return { cleanedText, images };
}