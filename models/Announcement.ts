import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
}

const AnnouncementSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [500, 'Content cannot exceed 500 characters']
  },
  adminId: {
    type: String,
    required: [true, 'Admin ID is required']
  },
  adminName: {
    type: String,
    required: [true, 'Admin name is required']
  },
  adminEmail: {
    type: String,
    required: [true, 'Admin email is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Announcement || mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
