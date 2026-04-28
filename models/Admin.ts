import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  addedBy: string; // Super admin who added this admin
  addedAt: Date;
  isActive: boolean;
  permissions: {
    canManageUsers: boolean;
    canManageCourses: boolean;
    canManageAnnouncements: boolean;
    canManageTutors: boolean;
    canManageAdmins: boolean; // Only super admin can have this
    canDeleteData: boolean;
  };
  role: 'super-admin' | 'admin'; // Super admin is hardcoded, others are promoted
}

const AdminSchema: Schema = new Schema({
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
    canManageUsers: {
      type: Boolean,
      default: true
    },
    canManageCourses: {
      type: Boolean,
      default: true
    },
    canManageAnnouncements: {
      type: Boolean,
      default: true
    },
    canManageTutors: {
      type: Boolean,
      default: true
    },
    canManageAdmins: {
      type: Boolean,
      default: true // Promoted admins can manage other admins
    },
    canDeleteData: {
      type: Boolean,
      default: true // Promoted admins can delete data
    }
  },
  role: {
    type: String,
    enum: ['super-admin', 'admin'],
    default: 'admin'
  }
}, {
  timestamps: true
});

// Index for efficient queries
AdminSchema.index({ userId: 1 });
AdminSchema.index({ email: 1 });
AdminSchema.index({ addedBy: 1 });
AdminSchema.index({ isActive: 1 });
AdminSchema.index({ role: 1 });

const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
