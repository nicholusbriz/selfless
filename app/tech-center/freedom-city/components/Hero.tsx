// app/tech-center/freedom-city/components/Hero.tsx
import React from 'react';
import TechCenterHero from '../../components/TechCenterHero';

export default function FreedomCityHero() {
  return (
    <TechCenterHero
      location="Kampala, Uganda"
      description="The flagship tech center of Selfless CE, located at Freedom City Mall. We provide world-class education and support for students pursuing BYU-Idaho courses and academic excellence."
      features={[
        {
          icon: '🎓',
          title: 'Academic Support',
          description: 'Dedicated tutoring and mentoring for BYU-Idaho students in a collaborative learning environment.',
        },
        {
          icon: '🌐',
          title: 'Community Hub',
          description: 'A vibrant space where students connect, collaborate, and grow together in their educational journey.',
        },
        {
          icon: '⚡',
          title: 'Tech Resources',
          description: 'Access to modern facilities, high-speed internet, and learning resources for academic success.',
        },
      ]}
      comingSoonText="Coming Soon"
      comingSoonDescription="Center-specific courses, events, and local announcements are being prepared."
    />
  );
}