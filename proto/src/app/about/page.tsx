'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

interface TeamMember {
  name: string;
  position: string;
  bio: string;
  image: string;
}

interface Value {
  title: string;
  description: string;
}

interface Certification {
  name: string;
  description: string;
  image: string;
}

interface SocialLinks {
  twitter: string;
  facebook: string;
  instagram: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  social: SocialLinks;
}

interface CompanyInfo {
  name: string;
  founded: string;
  logo: string;
  story: string;
  mission: string;
  vision: string;
  values: Value[];
  team: TeamMember[];
  contact: ContactInfo;
  certifications: Certification[];
}

export default function AboutPage() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/about');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch about data');
        }
        
        setCompanyInfo(data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching about data:', err);
        setError('Failed to load company information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-3/4 mb-8" />
        
        <Skeleton className="h-10 w-1/4 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        
        <Skeleton className="h-10 w-1/4 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">About Us</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!companyInfo) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About {companyInfo.name}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Founded in {companyInfo.founded}, we're on a mission to {companyInfo.mission.toLowerCase()}
        </p>
      </div>
      
      {/* Our Story */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Our Story</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-lg leading-relaxed">{companyInfo.story}</p>
        </div>
      </section>
      
      {/* Mission & Vision */}
      <section className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-primary/10 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg">{companyInfo.mission}</p>
        </div>
        <div className="bg-secondary/10 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
          <p className="text-lg">{companyInfo.vision}</p>
        </div>
      </section>
      
      {/* Values */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companyInfo.values.map((value, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p>{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Team */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {companyInfo.team.map((member, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative h-64 w-full">
                <Image 
                  src={member.image} 
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-primary font-medium mb-2">{member.position}</p>
                <p className="text-sm text-gray-600">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Certifications */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Our Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {companyInfo.certifications.map((cert, index) => (
            <Card key={index} className="flex flex-col items-center p-6">
              <div className="relative h-16 w-16 mb-4">
                <Image 
                  src={cert.image} 
                  alt={cert.name}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 text-center">{cert.name}</h3>
              <p className="text-center text-sm">{cert.description}</p>
            </Card>
          ))}
        </div>
      </section>
      
      {/* Contact */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Mail className="mr-2 text-primary" />
                <span>{companyInfo.contact.email}</span>
              </div>
              <div className="flex items-center mb-4">
                <Phone className="mr-2 text-primary" />
                <span>{companyInfo.contact.phone}</span>
              </div>
              <div className="flex items-center mb-6">
                <MapPin className="mr-2 text-primary" />
                <span>{companyInfo.contact.address}</span>
              </div>
              <div className="flex space-x-4">
                <Link href={companyInfo.contact.social.twitter} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon">
                    <Twitter />
                  </Button>
                </Link>
                <Link href={companyInfo.contact.social.facebook} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon">
                    <Facebook />
                  </Button>
                </Link>
                <Link href={companyInfo.contact.social.instagram} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon">
                    <Instagram />
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Send us a message</h3>
              <p className="mb-4">Have questions or feedback? We'd love to hear from you!</p>
              <Link href="/contact">
                <Button>Contact Form</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 