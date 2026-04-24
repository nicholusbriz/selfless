import mongoose from 'mongoose';

const CourseRegistrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courses: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    }
  }],
  takesReligion: {
    type: Boolean,
    default: false
  },
  totalCredits: {
    type: Number,
    required: true
  },
  semester: {
    type: String,
    required: true,
    default: 'Current'
  },
  academicYear: {
    type: String,
    required: true,
    default: new Date().getFullYear().toString()
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
CourseRegistrationSchema.index({ userId: 1, academicYear: 1 });
CourseRegistrationSchema.index({ registrationDate: -1 });

export default mongoose.models.CourseRegistration || mongoose.model('CourseRegistration', CourseRegistrationSchema);
