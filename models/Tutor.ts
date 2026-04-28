import mongoose, { Schema, Document } from 'mongoose';

export interface ITutor extends Document {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  addedBy: string; // Admin who added this tutor
  addedAt: Date;
  isActive: boolean;
  permissions: {
    canViewAnnouncements: boolean;
    canPostAnnouncements: boolean;
    canManageUsers: boolean;
  };
}

const TutorSchema: Schema = new Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true,
    ref: 'User'
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  addedBy: {
    type: String,
    required: [true, 'Added by is required'],
    ref: 'User'
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    canViewAnnouncements: {
      type: Boolean,
      default: true
    },
    canPostAnnouncements: {
      type: Boolean,
      default: true
    },
    canManageUsers: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
TutorSchema.index({ userId: 1 });
TutorSchema.index({ email: 1 });
TutorSchema.index({ addedBy: 1 });
TutorSchema.index({ isActive: 1 });

const Tutor = mongoose.models.Tutor || mongoose.model<ITutor>('Tutor', TutorSchema);

export default Tutor;
