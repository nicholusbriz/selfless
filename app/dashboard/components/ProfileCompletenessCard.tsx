'use client';

import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { checkProfileCompleteness } from '@/lib/profile-completeness';

interface ProfileCompletenessCardProps {
  user: any;
  inHeader?: boolean;
}

export default function ProfileCompletenessCard({ user, inHeader = false }: ProfileCompletenessCardProps) {
  const completeness = checkProfileCompleteness(user);
  const { completionPercentage, missingFields, isComplete } = completeness;

  const getStatusColor = () => {
    if (completionPercentage >= 80) return '#55705B'; // Green
    if (completionPercentage >= 50) return '#B98A3E'; // Gold
    return '#A4462F'; // Red
  };

  const getStatusText = () => {
    if (isComplete) return 'Complete!';
    if (completionPercentage >= 80) return 'Almost there';
    if (completionPercentage >= 50) return 'In progress';
    return 'Just started';
  };

  const highPriorityFields = missingFields.filter(f => f.priority === 'high');
  const mediumPriorityFields = missingFields.filter(f => f.priority === 'medium');

  // Different styles for header vs main content
  if (inHeader) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/20 bg-white/5 backdrop-blur-sm rounded-xl p-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${getStatusColor()}30` }}>
              <Sparkles className="w-5 h-5" style={{ color: getStatusColor() }} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-white">Profile Completion</h3>
              <p className="text-[11px] text-white/60 mt-0.5">{getStatusText()}</p>
            </div>
          </div>
          <span className="font-mono text-2xl font-black tabular-nums" style={{ color: getStatusColor() }}>
            {completionPercentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: getStatusColor() }}
            />
          </div>
        </div>

        {/* Missing Fields */}
        {!isComplete && (
          <div className="space-y-2 mb-4">
            {highPriorityFields.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A4462F] mb-2">
                  Important
                </p>
                {highPriorityFields.slice(0, 2).map((field) => (
                  <div key={field.field} className="flex items-center gap-2 text-[12px] text-white/80">
                    <AlertCircle className="w-3.5 h-3.5 text-[#A4462F] flex-shrink-0" />
                    <span className="truncate">{field.label}</span>
                  </div>
                ))}
              </div>
            )}

            {mediumPriorityFields.length > 0 && highPriorityFields.length === 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#B98A3E] mb-2">
                  Recommended
                </p>
                {mediumPriorityFields.slice(0, 2).map((field) => (
                  <div key={field.field} className="flex items-center gap-2 text-[12px] text-white/80">
                    <AlertCircle className="w-3.5 h-3.5 text-[#B98A3E] flex-shrink-0" />
                    <span className="truncate">{field.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Complete State */}
        {isComplete && (
          <div className="flex items-center gap-2 py-2 px-3 bg-[#55705B]/20 rounded-lg mb-4">
            <CheckCircle2 className="w-4 h-4 text-[#55705B]" />
            <span className="text-[12px] font-medium text-[#55705B]">
              Your profile is complete!
            </span>
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={() => window.location.href = '/dashboard/profile'}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all hover:-translate-y-px active:translate-y-px"
          style={{
            backgroundColor: isComplete ? 'rgba(255,255,255,0.15)' : getStatusColor(),
            color: 'white',
          }}
        >
          {isComplete ? 'View Profile' : 'Complete Profile'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-[#E5E7EB] bg-white rounded-xl p-5 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${getStatusColor()}15` }}>
            <Sparkles className="w-5 h-5" style={{ color: getStatusColor() }} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#1A2B4C]">Profile Completion</h3>
            <p className="text-[11px] text-[#6B7280] mt-0.5">{getStatusText()}</p>
          </div>
        </div>
        <span className="font-mono text-2xl font-black tabular-nums" style={{ color: getStatusColor() }}>
          {completionPercentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: getStatusColor() }}
          />
        </div>
      </div>

      {/* Missing Fields */}
      {!isComplete && (
        <div className="space-y-2 mb-4">
          {highPriorityFields.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A4462F] mb-2">
                Important
              </p>
              {highPriorityFields.slice(0, 2).map((field) => (
                <div key={field.field} className="flex items-center gap-2 text-[12px] text-[#1A2B4C]">
                  <AlertCircle className="w-3.5 h-3.5 text-[#A4462F] flex-shrink-0" />
                  <span className="truncate">{field.label}</span>
                </div>
              ))}
            </div>
          )}

          {mediumPriorityFields.length > 0 && highPriorityFields.length === 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#B98A3E] mb-2">
                Recommended
              </p>
              {mediumPriorityFields.slice(0, 2).map((field) => (
                <div key={field.field} className="flex items-center gap-2 text-[12px] text-[#1A2B4C]">
                  <AlertCircle className="w-3.5 h-3.5 text-[#B98A3E] flex-shrink-0" />
                  <span className="truncate">{field.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complete State */}
      {isComplete && (
        <div className="flex items-center gap-2 py-2 px-3 bg-[#55705B]/10 rounded-lg mb-4">
          <CheckCircle2 className="w-4 h-4 text-[#55705B]" />
          <span className="text-[12px] font-medium text-[#55705B]">
            Your profile is complete!
          </span>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={() => window.location.href = '/dashboard/profile'}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-bold transition-all hover:-translate-y-px active:translate-y-px"
        style={{
          backgroundColor: isComplete ? '#1A2B4C' : getStatusColor(),
          color: 'white',
        }}
      >
        {isComplete ? 'View Profile' : 'Complete Profile'}
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
