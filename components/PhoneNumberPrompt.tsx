'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export default function PhoneNumberPrompt() {
  const [user, setUser] = useState<User | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    // Check if user is logged in and missing phone number
    const checkUserPhone = async () => {
      try {
        // Get user data from URL params (same approach as form page)
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('userId');
        const email = urlParams.get('email');

        if (!userId || !email) {
          // No auth params, don't show prompt
          return;
        }

        const response = await fetch('/api/user-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, email }),
        });

        if (!response.ok) {
          throw new Error('Failed to check user status');
        }

        const data = await response.json();

        if (data.success && data.user && !data.user.phoneNumber) {
          setUser(data.user);
          setShowPrompt(true);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        // Silently fail - don't show prompt if we can't check
      }
    };

    checkUserPhone();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setMessage('Please enter your phone number');
      setMessageType('error');
      return;
    }

    // Basic phone number validation
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setMessage('Please enter a valid phone number');
      setMessageType('error');
      return;
    }

    // Get userId from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    if (!userId) {
      setMessage('User session expired. Please log in again.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/update-phone', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          phoneNumber: phoneNumber.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Your phone number has been updated successfully!');
        setMessageType('success');
        setShowPrompt(false);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowPrompt(false);
        }, 3000);
      } else {
        setMessage(data.message || 'Failed to update phone number');
        setMessageType('error');
      }
    } catch {
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };


  if (!showPrompt || !user) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-xl p-6 shadow-2xl border border-white/30 backdrop-blur-lg max-w-md">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">📱</span>
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Complete Your Profile</h3>
          <p className="text-yellow-100 text-sm">
            Hi {user.firstName}! Phone number is required for cleaning registration. Please add your number to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-yellow-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              required
            />
          </div>

          {message && (
            <div className={`text-sm p-2 rounded-lg ${messageType === 'success'
              ? 'bg-green-500/20 text-green-100 border border-green-400/30'
              : 'bg-red-500/20 text-red-100 border border-red-400/30'
              }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-orange-600 px-4 py-3 rounded-lg font-bold hover:bg-yellow-50 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Adding...' : 'Add Phone Number to Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
