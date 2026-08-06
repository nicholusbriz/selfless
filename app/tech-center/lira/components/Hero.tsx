// app/tech-center/lira/components/Hero.tsx
import React from 'react';
import TechCenterHero from '../../components/TechCenterHero';

export default function LiraHero() {
  return (
    <TechCenterHero
      location="Lira, Uganda"
      description="Northern Uganda's premier educational hub for BYU-Idaho courses and academic advancement. Empowering the region through technology and education."
      features={[
        {
          icon: '🏫',
          title: 'Northern Excellence',
          description: 'Dedicated to providing world-class education opportunities in the Northern region of Uganda.',
        },
        {
          icon: '💡',
          title: 'Innovation Hub',
          description: 'Fostering innovation and technological advancement through modern facilities and resources.',
        },
        {
          icon: '🌅',
          title: 'Future Ready',
          description: 'Preparing students for the future with skills that bridge the gap between education and industry.',
        },
      ]}
      comingSoonText="Expanding Impact"
      comingSoonDescription="New facilities, enhanced programs, and increased opportunities coming to Lira Tech Center."
    />
  );
}