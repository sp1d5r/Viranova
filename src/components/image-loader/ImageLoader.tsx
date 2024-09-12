import React, { useState, useEffect } from 'react';
import { FirebaseStorageService } from '../../services/storage/strategies';

interface EnhancedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
}

export const EnhancedImage: React.FC<EnhancedImageProps> = ({
                                                              src,
                                                              fallbackSrc = 'https://placehold.co/400x400',
                                                              alt,
                                                              className = 'w-full h-auto',
                                                              ...props
                                                            }) => {
  const [imageSrc, setImageSrc] = useState<string>(fallbackSrc);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadImage = async () => {
      if (!src) {
        setImageSrc(fallbackSrc);
        setIsLoading(false);
        return;
      }

      try {
        // Check if the src is a Firebase Storage path
        const url = await FirebaseStorageService.getDownloadURL(src);
        setImageSrc(url);
      } catch (error) {
        console.error('Error loading image:', error);
        setImageSrc(fallbackSrc);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [src, fallbackSrc]);

  return (
    <>
      {isLoading && (
        <div className={`${className} bg-gray-200 animate-pulse`}
             style={{ aspectRatio: '1 / 1' }}
        />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'hidden' : ''}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageSrc(fallbackSrc);
          setIsLoading(false);
        }}
        {...props}
      />
    </>
  );
};