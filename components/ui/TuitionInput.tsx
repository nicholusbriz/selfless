'use client';

import { useState } from 'react';
import { DollarSign } from 'lucide-react';

interface TuitionInputProps {
  currentTuition: number | null;
  onSave: (tuition: number) => void;
  isLoading: boolean;
  tuitionPaid: boolean;
}

export default function TuitionInput({ currentTuition, onSave, isLoading, tuitionPaid }: TuitionInputProps) {
  const [inputValue, setInputValue] = useState(currentTuition?.toString() || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    const tuitionValue = parseFloat(inputValue);
    if (isNaN(tuitionValue) || tuitionValue < 0) {
      alert('Please enter a valid tuition amount');
      return;
    }
    try {
      await onSave(tuitionValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving tuition:', error);
    }
  };

  const handleCancel = () => {
    setInputValue(currentTuition?.toString() || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
        Tuition Information
      </h2>

      {!isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total Tuition</p>
              <p className="text-white font-medium text-xl sm:text-2xl">
                {currentTuition ? `$${currentTuition.toLocaleString()}` : 'Not set'}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-xs sm:text-sm"
            >
              Edit
            </button>
          </div>
          {currentTuition && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              tuitionPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {tuitionPaid ? (
                <>
                  <span className="text-xs sm:text-sm font-medium">✓ Tuition Paid</span>
                </>
              ) : (
                <>
                  <span className="text-xs sm:text-sm font-medium">⚠ Tuition Pending</span>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-gray-400 text-xs sm:text-sm mb-2">Enter total tuition amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 text-xs sm:text-sm"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-xs sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
