'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface ReligionSelectorProps {
  takesReligion: boolean;
  onSave: (takesReligion: boolean) => void;
  isLoading: boolean;
}

export default function ReligionSelector({ takesReligion, onSave, isLoading }: ReligionSelectorProps) {
  const [selectedValue, setSelectedValue] = useState(takesReligion);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    try {
      await onSave(selectedValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving religion preference:', error);
    }
  };

  const handleCancel = () => {
    setSelectedValue(takesReligion);
    setIsEditing(false);
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
        Religion Courses
      </h2>

      {!isEditing ? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs sm:text-sm">Do you take religion courses?</p>
            <p className="text-white font-medium text-sm sm:text-base">
              {takesReligion ? 'Yes, you are taking religion' : 'No, you are not taking religion'}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-xs sm:text-sm"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-gray-400 text-xs sm:text-sm mb-2">Do you take religion courses?</label>
            <div className="flex gap-3 sm:gap-4">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer text-xs sm:text-sm">
                <input
                  type="radio"
                  name="religion"
                  checked={selectedValue === true}
                  onChange={() => setSelectedValue(true)}
                  className="w-4 h-4 accent-violet-600"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer text-xs sm:text-sm">
                <input
                  type="radio"
                  name="religion"
                  checked={selectedValue === false}
                  onChange={() => setSelectedValue(false)}
                  className="w-4 h-4 accent-violet-600"
                />
                <span>No</span>
              </label>
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
