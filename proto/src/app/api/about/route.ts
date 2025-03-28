import { NextResponse } from 'next/server';

// Company information
const companyInfo = {
  name: "ShopSmart",
  founded: "2020",
  logo: "/logo.png",
  story: "ShopSmart was founded in 2024 with a simple mission: to make sustainable shopping accessible to everyone. What started as a small online store with just a handful of eco-friendly products has grown into a comprehensive marketplace offering thousands of sustainable alternatives to everyday items.",
  mission: "To provide high-quality, sustainable products at affordable prices while promoting environmental consciousness and ethical consumption.",
  vision: "To become the leading global marketplace for sustainable products, making eco-friendly living the new normal.",
  values: [
    {
      title: "Sustainability",
      description: "We prioritize products that minimize environmental impact and promote sustainable practices."
    },
    {
      title: "Transparency",
      description: "We provide clear information about our products, their origins, and their environmental impact."
    },
    {
      title: "Affordability",
      description: "We believe sustainable living should be accessible to everyone, regardless of budget."
    },
    {
      title: "Community",
      description: "We foster a community of environmentally conscious consumers and businesses."
    }
  ],
  team: [
    {
      name: "Ahmed Kachhi",
      position: "CEO",
      bio: "Former environmental consultant with a passion for sustainable living. Ahmed holds an MBA from Stanford and has been recognized as one of Forbes' 30 Under 30 in Retail.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
    },
    {
      name: "Taufique Ansari",
      position: "CTO",
      bio: "Tech veteran with 15+ years of experience in e-commerce platforms. Taufique leads our engineering team and ensures our platform is secure, scalable, and user-friendly.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
    },
    {
      name: "Dipti Khalane",
      position: "Head of Sustainability",
      bio: "Environmental scientist with a PhD in Sustainable Resource Management. Dipti oversees our product vetting process and sustainability initiatives.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400"
    },
    {
      name: "Neha Sonar",
      position: "Chief Marketing Officer",
      bio: "Marketing expert with a background in purpose-driven brands. Neha leads our efforts to spread awareness about sustainable living.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400"
    }
  ],
  contact: {
    email: "info@shopsmart.com",
    phone: "+1 (555) 123-4567",
    address: "123 Green Street, San Francisco, CA 94110",
    social: {
      twitter: "https://twitter.com/shopsmart",
      facebook: "https://facebook.com/shopsmart",
      instagram: "https://instagram.com/shopsmart"
    }
  },
  certifications: [
    {
      name: "B Corporation",
      description: "Certified B Corporations are businesses that meet the highest standards of verified social and environmental performance, public transparency, and legal accountability.",
      image: "/certifications/bcorp.png"
    },
    {
      name: "Climate Neutral",
      description: "Climate Neutral Certified businesses measure, reduce, and offset their entire carbon footprint.",
      image: "/certifications/climate-neutral.png"
    },
    {
      name: "1% for the Planet",
      description: "Members of 1% for the Planet commit to donating 1% of annual sales to environmental nonprofits.",
      image: "/certifications/one-percent.png"
    }
  ]
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: companyInfo
    });
  } catch (error) {
    console.error('Error fetching about data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch about data' },
      { status: 500 }
    );
  }
} 