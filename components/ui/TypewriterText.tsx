'use client';

import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  texts: string[];
  className?: string;
  speed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
}

export default function TypewriterText({
  texts,
  className = '',
  speed = 100,
  deleteSpeed = 50,
  pauseDuration = 2000
}: TypewriterTextProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentFullText = texts[currentTextIndex];

    const handleTyping = () => {
      if (isPaused) {
        const pauseTimeout = setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
        return;
      }

      if (isDeleting) {
        if (currentText.length > 0) {
          const deleteTimeout = setTimeout(() => {
            setCurrentText(currentText.slice(0, -1));
          }, deleteSpeed);
          return;
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      } else {
        if (currentText.length < currentFullText.length) {
          const typeTimeout = setTimeout(() => {
            setCurrentText(currentFullText.slice(0, currentText.length + 1));
          }, speed);
          return;
        } else {
          setIsPaused(true);
        }
      }
    };

    handleTyping();

    return () => clearTimeout(handleTyping as unknown as NodeJS.Timeout);
  }, [currentText, isDeleting, isPaused, currentTextIndex, texts, speed, deleteSpeed, pauseDuration]);

  return (
    <span className={`typewriter-container ${className}`}>
      <span className="typewriter">{currentText}</span>
    </span>
  );
}
