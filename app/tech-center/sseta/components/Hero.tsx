// app/tech-center/sseta/components/Hero.tsx
import React from 'react';
import TechCenterHero from '../../components/TechCenterHero';

export default function SsetaHero() {
  return (
    <TechCenterHero
      location="Central Region, Uganda"
      description="A beacon of educational excellence in central Uganda, providing transformative learning experiences and comprehensive support for BYU-Idaho academic programs."
      features={[
        {
          icon: '🏛️',
          title: 'Central Excellence',
          description: 'Serving as the educational cornerstone of central Uganda with world-class academic programs.',
        },
        {
          icon: '💫',
          title: 'Transformative Learning',
          description: 'Empowering students through innovative teaching methods and comprehensive academic support.',
        },
        {
          icon: '🤝',
          title: 'Community Impact',
          description: 'Building a legacy of education and opportunity that strengthens the entire central region.',
        },
      ]}
      comingSoonText="Expanding Impact"
      comingSoonDescription="New programs, enhanced facilities, and expanded opportunities coming to Sseta Tech Center."
    />
  );
}