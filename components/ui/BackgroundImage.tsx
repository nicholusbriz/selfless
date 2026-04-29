'use client';

import Image from 'next/image';

interface BackgroundImageProps {
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  children?: React.ReactNode;
}

export default function BackgroundImage({
  className = "h-screen relative overflow-hidden",
  style,
  priority = true,
  children
}: BackgroundImageProps) {
  return (
    <div className={className}>
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/atbriz.jpg"
          alt="Background"
          fill
          className="object-cover"
          style={{
            filter: 'brightness(0.3) contrast(1.1) saturate(0.8) blur(0.8px)',
            objectFit: 'cover',
            objectPosition: 'center',
            ...style
          }}
          priority={priority}
        />
      </div>
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}
