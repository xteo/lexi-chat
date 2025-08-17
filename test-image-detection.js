// Simple test for image detection
const { processTextForImages } = require('./lib/utils/image-detection.ts');

// Test with a sample message containing an image URL
const testText = "Here's an image: https://example.com/image.png and some more text";
const result = processTextForImages(testText);

console.log('Input text:', testText);
console.log('Cleaned text:', result.cleanedText);
console.log('Extracted images:', result.images);

// Test with base64 image
const testBase64 = "Here's a base64 image: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
const result2 = processTextForImages(testBase64);

console.log('\nBase64 test:');
console.log('Input text:', testBase64);
console.log('Cleaned text:', result2.cleanedText);
console.log('Extracted images:', result2.images);