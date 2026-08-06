// app/tech-center/mbale/components/Hero.tsx
import React from 'react';
import TechCenterHero from '../../components/TechCenterHero';

export default function MbaleHero() {
  return (
    <TechCenterHero
      location="Mbale, Uganda"
      description="Nestled at the foot of Mount Elgon, our Mbale tech center combines natural inspiration with cutting-edge education technology to serve Eastern Uganda students."
      features={[
        {
          icon: '🏔️',
          title: 'Mountain Learning',
          description: 'Inspired by the majesty of Mount Elgon, our campus provides a unique learning environment that fosters creativity.',
        },
        {
          icon: '📈',
          title: 'Eastern Excellence',
          description: 'Serving as the leading educational institution for Eastern Uganda with comprehensive academic programs.',
        },
        {
          icon: '🌟',
          title: 'Student Success',
          description: 'Dedicated to helping students achieve their academic goals through personalized support and guidance.',
        },
      ]}
      comingSoonText="Reaching New Heights"
      comingSoonDescription="New programs, expanded facilities, and enhanced learning resources coming to Mbale Tech Center."
    />
  );
}