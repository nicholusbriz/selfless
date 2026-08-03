/**
 * Profile Completeness Checker
 * 
 * Analyzes user profile and identifies missing fields for recommendations.
 * Excludes sensitive information like email and password.
 */

interface MissingField {
  field: string;
  label: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

interface ProfileCompleteness {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: MissingField[];
  canJoinFootballTeam: boolean;
  recommendations: string[];
}

export function checkProfileCompleteness(user: any): ProfileCompleteness {
  const missingFields: MissingField[] = [];
  const recommendations: string[] = [];

  // Check personal information
  if (!user.phoneNumber) {
    missingFields.push({
      field: 'phoneNumber',
      label: 'Phone Number',
      recommendation: 'Add your phone number for important notifications',
      priority: 'high'
    });
  }

  if (!user.country) {
    missingFields.push({
      field: 'country',
      label: 'Country',
      recommendation: 'Specify your country for location-based services',
      priority: 'high'
    });
  }

  if (!user.city) {
    missingFields.push({
      field: 'city',
      label: 'City',
      recommendation: 'The administration recommends updating your city',
      priority: 'high'
    });
  }

  if (!user.town) {
    missingFields.push({
      field: 'town',
      label: 'Town/Village',
      recommendation: 'The administration recommends updating your town or village',
      priority: 'medium'
    });
  }

  if (!user.street) {
    missingFields.push({
      field: 'street',
      label: 'Street Address',
      recommendation: 'Add your street address for delivery services',
      priority: 'medium'
    });
  }

  // Check academic/professional information
  if (!user.generalCourse) {
    missingFields.push({
      field: 'generalCourse',
      label: 'General Course',
      recommendation: 'Specify your general course of study',
      priority: 'high'
    });
  }

  if (!user.linkedinUrl) {
    missingFields.push({
      field: 'linkedinUrl',
      label: 'LinkedIn Profile',
      recommendation: 'Add your LinkedIn URL for professional networking',
      priority: 'medium'
    });
  }

  if (!user.githubUrl) {
    missingFields.push({
      field: 'githubUrl',
      label: 'GitHub Profile',
      recommendation: 'Add your GitHub URL to showcase your coding projects',
      priority: 'medium'
    });
  }

  // Check team preferences
  if (!user.preferredTeamType) {
    missingFields.push({
      field: 'preferredTeamType',
      label: 'Preferred Team Type',
      recommendation: 'Select your preferred team type (football, etc.)',
      priority: 'low'
    });
  }

  if (!user.preferredTeamRole) {
    missingFields.push({
      field: 'preferredTeamRole',
      label: 'Preferred Team Role',
      recommendation: 'Specify your preferred role in team activities',
      priority: 'low'
    });
  }

  // Check football team participation
  const canJoinFootballTeam = !user?.footballTeamRegistration || user.footballTeamRegistration.length === 0;

  // Calculate completion percentage
  const totalFields = 11; // Total fields we check
  const completedFields = totalFields - missingFields.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  // Build recommendations
  if (missingFields.length > 0) {
    const highPriority = missingFields.filter(f => f.priority === 'high');
    const mediumPriority = missingFields.filter(f => f.priority === 'medium');
    
    if (highPriority.length > 0) {
      recommendations.push(
        `The administration recommends updating your profile information, particularly: ${highPriority.map(f => f.label).join(', ')}`
      );
    }
    
    if (mediumPriority.length > 0) {
      recommendations.push(
        `Consider adding: ${mediumPriority.map(f => f.label).join(', ')} to enhance your profile`
      );
    }
  }

  if (canJoinFootballTeam) {
    recommendations.push(
      'You can join the tech center football team! It\'s a great way to stay active and build teamwork skills.'
    );
  }

  return {
    isComplete: missingFields.length === 0,
    completionPercentage,
    missingFields,
    canJoinFootballTeam,
    recommendations
  };
}

export function generateProfileRecommendations(profileCompleteness: ProfileCompleteness): string {
  let message = '';

  if (!profileCompleteness.isComplete) {
    message += `\n\n📋 **Profile Recommendations:**\n`;
    message += `Your profile is ${profileCompleteness.completionPercentage}% complete.\n\n`;
    
    profileCompleteness.missingFields.forEach(field => {
      const emoji = field.priority === 'high' ? '⚠️' : field.priority === 'medium' ? '💡' : '✨';
      message += `${emoji} ${field.label}: ${field.recommendation}\n`;
    });
  }

  if (profileCompleteness.canJoinFootballTeam) {
    message += `\n\n⚽ **Football Team:**\n`;
    message += `You haven't joined the tech center football team yet. It's a great opportunity to stay active, build teamwork skills, and connect with fellow students!\n`;
  }

  if (profileCompleteness.recommendations.length > 0) {
    message += `\n\n💪 **What I Can Help With:**\n`;
    message += `I'm designed to help you in your learning journey. I can assist with:\n`;
    message += `• Academic guidance and assignments\n`;
    message += `• Personalized learning based on your progress\n`;
    message += `• Site navigation and platform features\n`;
    message += `• Coding help and debugging\n`;
    message += `• General knowledge and research\n`;
    message += `• Organization information\n`;
  }

  return message;
}