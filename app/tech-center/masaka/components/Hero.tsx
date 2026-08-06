// app/tech-center/masaka/components/Hero.tsx
import React from 'react';
import TechCenterHero from '../../components/TechCenterHero';

export default function MasakaHero() {
  return (
    <TechCenterHero
      location="Masaka, Uganda"
      description="Empowering students in the central region with innovative learning solutions and comprehensive academic support for BYU-Idaho courses."
      features={[
        {
          icon: '🌿',
          title: 'Green Learning',
          description: 'A serene learning environment surrounded by Masaka\'s natural beauty, fostering focus and growth.',
        },
        {
          icon: '⚡',
          title: 'Tech Empowerment',
          description: 'Equipping students with cutting-edge technology skills for the modern digital economy.',
        },
        {
          icon: '🌟',
          title: 'Excellence Hub',
          description: 'Central region\'s premier destination for BYU-Idaho academic success and personal growth.',
        },
      ]}
      comingSoonText="Growing Stronger"
      comingSoonDescription="New programs, expanded facilities, and enhanced resources coming to Masaka Tech Center."
    />
  );
}