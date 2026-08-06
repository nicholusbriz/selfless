// app/tech-center/ntinda/components/Hero.tsx
import React from 'react';
import TechCenterHero from '../../components/TechCenterHero';

export default function NtindaHero() {
  return (
    <TechCenterHero
      location="Kampala, Uganda"
      description="Located in the heart of Ntinda, Kampala, our tech center serves students in the metropolitan area with state-of-the-art facilities and comprehensive academic support."
      features={[
        {
          icon: '🚀',
          title: 'Urban Innovation',
          description: 'At the heart of Kampala\'s tech scene, we provide students with cutting-edge resources and opportunities.',
        },
        {
          icon: '🌐',
          title: 'Connected Learning',
          description: 'Seamless access to global educational resources and a network of learners and mentors.',
        },
        {
          icon: '⚡',
          title: '24/7 Access',
          description: 'Flexible learning hours with round-the-clock access to facilities and digital resources.',
        },
      ]}
      comingSoonText="Expanding Horizons"
      comingSoonDescription="New programs, enhanced facilities, and expanded learning opportunities coming to Ntinda Tech Center."
    />
  );
}