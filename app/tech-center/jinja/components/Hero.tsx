// app/tech-center/jinja/components/Hero.tsx
import React from 'react';
import TechCenterHero from '../../components/TechCenterHero';

export default function JinjaHero() {
  return (
    <TechCenterHero
      location="Jinja, Uganda"
      description="Serving the Eastern region with excellence in education. Our Jinja tech center combines traditional learning values with modern technology to create an optimal learning environment."
      features={[
        {
          icon: '📚',
          title: 'Regional Excellence',
          description: 'Serving as the premier tech education hub for the Eastern region with tailored academic support.',
        },
        {
          icon: '🏗️',
          title: 'Skills Development',
          description: 'Practical training programs designed to bridge the gap between education and industry demands.',
        },
        {
          icon: '🤝',
          title: 'Community Focus',
          description: 'Building a supportive community of learners and educators dedicated to academic excellence.',
        },
      ]}
      comingSoonText="Expanding Horizons"
      comingSoonDescription="New programs, expanded facilities, and enhanced learning resources coming to Jinja Tech Center."
    />
  );
}