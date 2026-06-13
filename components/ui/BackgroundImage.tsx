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
            filter: 'brightness(0.25) contrast(1.2) saturate(1.1) blur(0.3px)',
            objectFit: 'cover',
            objectPosition: 'center',
            ...style
          }}
          priority={priority}
        />
        {/* Modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
}
