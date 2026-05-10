import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
  userId: string;
  email: string;
  cleaningDayId: number;
  cleaningDayName: string;
  cleaningDayDate: string;
  attendanceStatus: 'pending' | 'attended' | 'no-show';
  markedBy?: string;
  markedAt?: Date;
  createdAt: Date;
}

const RegistrationSchema: Schema = new Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    ref: 'User'
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  cleaningDayId: {
    type: Number,
    required: [true, 'Cleaning day ID is required']
  },
  cleaningDayName: {
    type: String,
    required: [true, 'Cleaning day name is required']
  },
  cleaningDayDate: {
    type: String,
    required: [true, 'Cleaning day date is required']
  },
  attendanceStatus: {
    type: String,
    enum: ['pending', 'attended', 'no-show'],
    default: 'pending'
  },
  markedBy: {
    type: String,
    ref: 'User'
  },
  markedAt: {
    type: Date
  }
}, {
  timestamps: true,
});

// Indexes for preventing duplicate registrations
RegistrationSchema.index({ userId: 1, cleaningDayId: 1 }, { unique: true });
RegistrationSchema.index({ email: 1 }, { unique: true }); // One registration per email

export default mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema);
