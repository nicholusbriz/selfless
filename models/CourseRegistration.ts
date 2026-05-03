import mongoose from 'mongoose';

// Database schema for course registrations
const CourseRegistrationSchema = new mongoose.Schema({
  // Reference to the user who registered
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // List of courses with their credit values
  courses: [{
    // Course name (e.g., "Math 101")
    name: {
      type: String,
      required: true,
      trim: true
    },
    // Number of credits for this course (1-10)
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    }
  }],
  // Whether student is taking religion courses
  takesReligion: {
    type: Boolean,
    default: false
  },
  // Total credits across all courses
  totalCredits: {
    type: Number,
    required: true
  },
  // Academic semester (e.g., "Fall", "Spring")
  semester: {
    type: String,
    required: true,
    default: 'Current'
  },
  // Academic year (e.g., "2023")
  academicYear: {
    type: String,
    required: true,
    default: new Date().getFullYear().toString()
  },
  // When the registration was first created
  registrationDate: {
    type: Date,
    default: Date.now
  },
  // When the registration was last modified
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create database indexes for faster queries
CourseRegistrationSchema.index({ userId: 1, academicYear: 1 });
CourseRegistrationSchema.index({ registrationDate: -1 });

export default mongoose.models.CourseRegistration || mongoose.model('CourseRegistration', CourseRegistrationSchema);
