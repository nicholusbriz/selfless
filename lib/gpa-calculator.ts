// lib/gpa-calculator.ts

export interface Course {
  id: string;
  courseName: string;
  credits: number;
}

export interface Grade {
  id: string;
  courseId: string;
  week: number;
  gradeLetter: string;
  gradePoints: number;
}

const GRADE_POINTS: Record<string, number> = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.4,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.4,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.4,
  'D': 1.0,
  'D-': 0.7,
  'E': 0.0,
  'F': 0.0
};

export function calculateGPA(courses: Course[], grades: Grade[]): number {
  if (!courses.length) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  for (const course of courses) {
    // Get the latest grade for each course (highest week)
    const courseGrades = grades.filter(g => g.courseId === course.id);
    if (courseGrades.length === 0) continue;
    
    const latestGrade = courseGrades.reduce((latest, current) => 
      current.week > latest.week ? current : latest
    );
    
    const gradePoints = GRADE_POINTS[latestGrade.gradeLetter] || 0;
    totalPoints += gradePoints * course.credits;
    totalCredits += course.credits;
  }
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0;
}

export function calculateGradePoints(gradeLetter: string): number {
  return GRADE_POINTS[gradeLetter] || 0;
}

export function calculateWeeklyGPAs(courses: Course[], grades: Grade[]): { week: number; gpa: number }[] {
  const weeklyResults = [];
  
  for (let week = 1; week <= 7; week++) {
    let totalPoints = 0;
    let totalCredits = 0;
    
    for (const course of courses) {
      const weekGrade = grades.find(g => g.courseId === course.id && g.week === week);
      if (!weekGrade) continue;
      
      const gradePoints = GRADE_POINTS[weekGrade.gradeLetter] || 0;
      totalPoints += gradePoints * course.credits;
      totalCredits += course.credits;
    }
    
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    weeklyResults.push({ week, gpa });
  }
  
  return weeklyResults;
}