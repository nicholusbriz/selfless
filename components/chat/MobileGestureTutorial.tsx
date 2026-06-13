'use client';

import { useState, useEffect } from 'react';

interface MobileGestureTutorialProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function MobileGestureTutorial({ isVisible, onClose }: MobileGestureTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if user is on mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't show on desktop
  if (!isMobile || !isVisible) return null;

  const tutorialSteps = [
    {
      title: "📱 Welcome to Freedom City Tech Center Chat!",
      description: "Learn how to use our intuitive mobile messaging gestures",
      icon: "👋",
      animation: "wave"
    },
    {
      title: "👆 Swipe Right to Reply",
      description: "Swipe any message right to quickly reply",
      icon: "➡️",
      animation: "swipe-right"
    },
    {
      title: "👈 Swipe Left to Delete",
      description: "Swipe your own messages left to delete them",
      icon: "🗑️",
      animation: "swipe-left"
    },
    {
      title: "👆 Long Press for Options",
      description: "Hold down on messages for more options",
      icon: "⏱️",
      animation: "long-press"
    },
    {
      title: "✅ Message Status",
      description: "Check message status: ⏳ Sending → ✅ Sent → ✅✅ Delivered → ✅✅✅ Read",
      icon: "📊",
      animation: "status"
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      // Save that user has seen the tutorial
      localStorage.setItem('mobileChatTutorialSeen', 'true');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    onClose();
    localStorage.setItem('mobileChatTutorialSeen', 'true');
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Freedom City Tech Center Tutorial</h3>
            <button
              onClick={skipTutorial}
              className="text-white/80 hover:text-white transition-colors"
            >
              Skip
            </button>
          </div>
          <div className="flex gap-1 mt-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${index === currentStep ? 'bg-white' : 'bg-white/30'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Animated Icon */}
          <div className={`text-6xl mb-4 ${getAnimationClass(currentTutorial.animation)}`}>
            {currentTutorial.icon}
          </div>

          {/* Title */}
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            {currentTutorial.title}
          </h4>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">
            {currentTutorial.description}
          </p>

          {/* Visual Demo */}
          {currentStep === 1 && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">Demo:</div>
              <div className="bg-white rounded-lg p-2 border border-gray-200">
                <div className="text-sm text-gray-800">Sample message</div>
                <div className="text-xs text-blue-500 mt-1">➡️ Swipe right to reply</div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">Demo:</div>
              <div className="bg-blue-500 text-white rounded-lg p-2 border border-blue-600">
                <div className="text-sm">Your message</div>
                <div className="text-xs text-white/80 mt-1">🗑️ Swipe left to delete</div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">Demo:</div>
              <div className="bg-white rounded-lg p-2 border border-gray-200 relative">
                <div className="text-sm text-gray-800">Hold down...</div>
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                  Delete
                </div>
              </div>
            </div>
          )}


          {currentStep === 5 && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">Status Indicators:</div>
              <div className="space-y-1 text-left">
                <div className="text-xs">⏳ Sending...</div>
                <div className="text-xs">✅ Sent</div>
                <div className="text-xs">✅✅ Delivered</div>
                <div className="text-xs">✅✅✅ Read</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentStep === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            Previous
          </button>

          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            {currentStep === tutorialSteps.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function getAnimationClass(animation: string): string {
  switch (animation) {
    case 'wave':
      return 'animate-bounce';
    case 'swipe-right':
      return 'animate-pulse';
    case 'swipe-left':
      return 'animate-pulse';
    case 'long-press':
      return 'animate-pulse';
    case 'reaction':
      return 'animate-bounce';
    case 'status':
      return 'animate-pulse';
    default:
      return '';
  }
}
