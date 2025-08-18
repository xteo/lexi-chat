import type { Attachment } from '@/lib/types';
import { LoaderIcon } from './icons';

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
  size = 'small',
  onImageClick,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  size?: 'small' | 'large';
  onImageClick?: (url: string, alt: string) => void;
}) => {
  const { name, url, contentType } = attachment;

  const isImage = contentType && contentType.startsWith('image');
  
  // DEBUG: Log when rendering images (set DEBUG_IMAGES=true to enable)
  const DEBUG_IMAGES = false;
  if (DEBUG_IMAGES && isImage && size === 'large') {
    console.log(`🖼️ PreviewAttachment Debug:`, {
      name,
      contentType,
      urlStart: url?.substring(0, 50) + '...',
      urlLength: url?.length,
      isValidDataUrl: url?.startsWith('data:image/'),
    });
  }
  
  // Chat app style: square thumbnails for consistency
  const containerClasses = size === 'large' && isImage
    ? "w-36 h-36" // Fixed 144px square
    : "w-20";
  
  const imageContainerClasses = size === 'large' && isImage
    ? "w-full h-full bg-muted rounded-lg relative overflow-hidden"
    : "w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center";

  return (
    <div data-testid="input-attachment-preview" className="flex flex-col gap-2">
      <div className={containerClasses}>
        <div className={imageContainerClasses}>
          {contentType ? (
            contentType.startsWith('image') ? (
              // NOTE: it is recommended to use next/image for images
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={name ?? 'An image attachment'}
                className={size === 'large' 
                  ? "rounded-lg w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  : "rounded-md size-full object-cover"
                }
                onClick={() => {
                  if (size === 'large' && onImageClick) {
                    onImageClick(url, name ?? 'Image');
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center p-4">
                <span className="text-muted-foreground text-sm">
                  {contentType.split('/')[1]?.toUpperCase() || 'FILE'}
                </span>
              </div>
            )
          ) : (
            <div className="" />
          )}

          {isUploading && (
            <div
              data-testid="input-attachment-loader"
              className="animate-spin absolute text-zinc-500"
            >
              <LoaderIcon />
            </div>
          )}
        </div>
      </div>
      {size !== 'large' && (
        <div className="text-xs text-zinc-500 max-w-16 truncate">
          {name}
        </div>
      )}
    </div>
  );
};
