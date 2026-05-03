'use client';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'WebApplication';
  data: Record<string, unknown>;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2)
      }}
    />
  );
}

// Organization structured data component
export function OrganizationStructuredData() {
  const organizationData = {
    name: "Freedom City Tech Center",
    alternateName: "FCTC",
    url: "https://selfless-henna.vercel.app",
    logo: "https://selfless-henna.vercel.app/freedom.png",
    description: "Professional technology education center providing comprehensive registration and management systems for students and tutors.",
    foundingDate: "2026",
    address: {
      "@type": "PostalAddress",
      addressCountry: "UG",
      addressLocality: "Kampala",
      addressRegion: "Central"
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "atbriz256@gmail.com",
      contactType: "customer service",
      availableLanguage: ["English"]
    },
    sameAs: [
      "https://selfless-henna.vercel.app"
    ],
    knowsAbout: [
      "Technology Education",
      "Student Management",
      "Course Registration",
      "Cleaning Schedule Management",
      "Professional Development",
      "Software Development"
    ],
    author: {
      "@type": "Person",
      name: "Atbriz Nicholus",
      email: "atbriz256@gmail.com",
      jobTitle: "Software Developer",
      address: {
        "@type": "PostalAddress",
        addressCountry: "UG",
        addressLocality: "Kampala"
      }
    }
  };

  return <StructuredData type="Organization" data={organizationData} />;
}

// WebSite structured data component
export function WebSiteStructuredData() {
  const webSiteData = {
    name: "Freedom City Tech Center - Professional Registration System",
    url: "https://selfless-henna.vercel.app",
    description: "Professional cleaning and course registration system for Freedom City Tech Center. Streamline student registrations, track cleaning schedules, and manage course credits efficiently.",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://selfless-henna.vercel.app/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    publisher: {
      "@type": "Organization",
      name: "Freedom City Tech Center",
      url: "https://selfless-henna.vercel.app"
    },
    about: [
      {
        "@type": "Thing",
        name: "Technology Education"
      },
      {
        "@type": "Thing",
        name: "Student Registration System"
      },
      {
        "@type": "Thing",
        name: "Course Management"
      },
      {
        "@type": "Thing",
        name: "Cleaning Schedule"
      }
    ],
    keywords: "Freedom City Tech Center, cleaning registration, course registration, student management, technology education, software development, Atbriz Nicholus, Kampala Uganda, education management system"
  };

  return <StructuredData type="WebSite" data={webSiteData} />;
}

// WebApplication structured data component
export function WebApplicationStructuredData() {
  const webApplicationData = {
    name: "Freedom City Tech Center Registration System",
    url: "https://selfless-henna.vercel.app",
    description: "Comprehensive web application for student registration, course management, and cleaning schedule tracking at Freedom City Tech Center.",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    featureList: [
      "Student Registration",
      "Course Management",
      "Cleaning Schedule Tracking",
      "Admin Dashboard",
      "Tutor Management",
      "Announcement System",
      "Profile Management",
      "Data Export"
    ],
    screenshot: "https://selfless-henna.vercel.app/freedom.png",
    softwareVersion: "1.0",
    author: {
      "@type": "Person",
      name: "Atbriz Nicholus",
      email: "atbriz256@gmail.com",
      jobTitle: "Software Developer"
    },
    provider: {
      "@type": "Organization",
      name: "Freedom City Tech Center",
      url: "https://selfless-henna.vercel.app"
    }
  };

  return <StructuredData type="WebApplication" data={webApplicationData} />;
}
