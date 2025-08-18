import { NextResponse } from 'next/server';
import { z } from 'zod';
import sharp from 'sharp';

import { auth } from '@/lib/supabase/auth';

// Image processing configuration (matching iOS implementation)
const MAX_WIDTH = 1280;
const MAX_HEIGHT = 1280;
const JPEG_QUALITY = 85;

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: 'File size should be less than 10MB',
    })
    .refine((file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type), {
      message: 'File type should be JPEG, PNG, or WebP',
    }),
});

async function processImage(buffer: Buffer): Promise<string> {
  try {
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    const { width = 0, height = 0 } = metadata;

    console.log(`Processing image: ${width}x${height}`);

    // Calculate resize dimensions while maintaining aspect ratio
    let targetWidth = width;
    let targetHeight = height;

    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
      const widthRatio = MAX_WIDTH / width;
      const heightRatio = MAX_HEIGHT / height;
      const ratio = Math.min(widthRatio, heightRatio);

      targetWidth = Math.round(width * ratio);
      targetHeight = Math.round(height * ratio);
      
      console.log(`Resizing to: ${targetWidth}x${targetHeight}`);
    } else {
      console.log('No resizing needed');
    }

    // Process image with Sharp
    const processedBuffer = await sharp(buffer)
      .resize(targetWidth, targetHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    // Convert to base64 data URL
    const base64 = processedBuffer.toString('base64');
    const dataURL = `data:image/jpeg;base64,${base64}`;

    console.log(`Image processed: ${processedBuffer.length} bytes, base64 length: ${base64.length}`);
    
    return dataURL;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData
    const filename = (formData.get('file') as File).name || 'image.jpg';
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    console.log(`Received file: ${filename}, size: ${fileBuffer.length} bytes`);

    try {
      // Process the image and get base64 data URL
      const dataURL = await processImage(fileBuffer);
      
      // Return the processed image data
      return NextResponse.json({
        url: dataURL,
        pathname: filename,
        contentType: 'image/jpeg',
        size: dataURL.length,
      });
    } catch (error) {
      console.error('Upload processing error:', error);
      return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
