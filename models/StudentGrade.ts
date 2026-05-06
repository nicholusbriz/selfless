import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface defining the StudentGrade document structure
 * Extends Mongoose Document for TypeScript support
 */
export interface IStudentGrade extends Document {
  studentId: mongoose.Types.ObjectId;    // Reference to the student
  courseName: string;                     // Course unit name
  courseCode: string;                     // Course code (generated)
  credits: number;                        // Course credits
  gradeLetter: string;                    // Grade letter (A, B, C, etc.)
  tutorId: mongoose.Types.ObjectId;      // Tutor who assigned the grade
  gradedAt: Date;                         // When grade was assigned
  semester: string;                       // Academic semester
  academicYear: string;                   // Academic year
  createdAt: Date;                        // Record creation time
  updatedAt: Date;                        // Last update time
}

/**
 * Mongoose schema for StudentGrade documents
 * 
 * This schema defines the structure and validation rules for student grades.
 * It links students to their course units with assigned grades.
 */
const StudentGradeSchema: Schema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
    index: true
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true,
    maxlength: [20, 'Course code cannot exceed 20 characters']
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits cannot exceed 10']
  },
  gradeLetter: {
    type: String,
    required: [true, 'Grade letter is required'],
    enum: {
      values: ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'E', 'F', 'UW', 'CR', 'I', 'IP', 'NC', 'NR', 'P', 'T', 'W', 'AU', 'V'],
      message: 'Invalid grade letter'
    },
    uppercase: true,
    trim: true
  },
  tutorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tutor ID is required']
  },
  gradedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    default: 'Current',
    trim: true
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    default: new Date().getFullYear().toString(),
    trim: true
  }
}, {
  timestamps: true  // Automatically add createdAt and updatedAt fields
});

// Database indexes for performance optimization
StudentGradeSchema.index({ studentId: 1, academicYear: 1 });
StudentGradeSchema.index({ tutorId: 1 });
StudentGradeSchema.index({ courseName: 1 });
StudentGradeSchema.index({ gradeLetter: 1 });
StudentGradeSchema.index({ gradedAt: -1 });

// Compound index for unique student-course-grade combination
StudentGradeSchema.index({ studentId: 1, courseName: 1, academicYear: 1 }, { unique: true });

/**
 * Pre-save middleware to generate course code from course name
 */
StudentGradeSchema.pre('save', function (this: any, next: any) {
  if (this.isModified('courseName') && !this.courseCode) {
    // Generate course code from first 6 characters of course name
    const courseName = this.courseName as string;
    this.courseCode = courseName
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
      .substring(0, 6)
      .toUpperCase()
      .trim() + Math.floor(Math.random() * 100); // Add random number for uniqueness
  }
  next();
});

export default mongoose.models.StudentGrade || mongoose.model<IStudentGrade>('StudentGrade', StudentGradeSchema);
