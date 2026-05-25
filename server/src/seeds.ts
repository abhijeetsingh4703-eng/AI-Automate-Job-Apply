import dotenv from 'dotenv';
import { connectDB, disconnectDB } from './config/database';
import { Job } from './models/Job';

dotenv.config();

const mockJobs = [
  // Software Engineering Roles
  {
    title: 'Senior Full Stack Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    description: 'We are looking for a Senior Full Stack Engineer to join our core infrastructure team. You will work on systems that serve billions of users.',
    requirements: ['TypeScript', 'React', 'Node.js', 'Google Cloud', '5+ years experience'],
    salary: { min: 200000, max: 350000, currency: 'USD' },
    sourcePortal: 'indeed',
    externalJobId: 'google-1001',
    externalUrl: 'https://example.com/google-1001',
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Frontend Developer - React',
    company: 'Meta',
    location: 'Menlo Park, CA',
    description: 'Join Meta to build products used by billions. We are looking for experienced React developers.',
    requirements: ['React', 'JavaScript', 'CSS', 'Git', '3+ years experience'],
    salary: { min: 180000, max: 300000, currency: 'USD' },
    sourcePortal: 'linkedin',
    externalJobId: 'meta-2001',
    externalUrl: 'https://example.com/meta-2001',
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Backend Engineer - Python',
    company: 'Amazon',
    location: 'Seattle, WA',
    description: 'Work on AWS services and help millions of developers build on the cloud.',
    requirements: ['Python', 'AWS', 'SQL', 'Microservices', '4+ years experience'],
    salary: { min: 190000, max: 320000, currency: 'USD' },
    sourcePortal: 'indeed',
    externalJobId: 'amazon-3001',
    externalUrl: 'https://example.com/amazon-3001',
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'DevOps Engineer',
    company: 'Netflix',
    location: 'Remote',
    description: 'Build the infrastructure that streams content to 200M+ users worldwide.',
    requirements: ['Kubernetes', 'Docker', 'AWS', 'Terraform', '5+ years experience'],
    salary: { min: 220000, max: 340000, currency: 'USD' },
    sourcePortal: 'glassdoor',
    externalJobId: 'netflix-4001',
    externalUrl: 'https://example.com/netflix-4001',
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Software Engineer - Machine Learning',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    description: 'Help us build the next generation of AI models. Work with cutting-edge ML technologies.',
    requirements: ['Python', 'PyTorch', 'TensorFlow', 'Linear Algebra', 'ML fundamentals'],
    salary: { min: 250000, max: 400000, currency: 'USD' },
    sourcePortal: 'linkedin',
    externalJobId: 'openai-5001',
    externalUrl: 'https://example.com/openai-5001',
    postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Mobile App Developer - iOS',
    company: 'Apple',
    location: 'Cupertino, CA',
    description: 'Create experiences that delight millions of users on iOS, iPadOS, and watchOS.',
    requirements: ['Swift', 'Objective-C', 'Xcode', 'iOS SDK', '3+ years experience'],
    salary: { min: 180000, max: 320000, currency: 'USD' },
    sourcePortal: 'indeed',
    externalJobId: 'apple-6001',
    externalUrl: 'https://example.com/apple-6001',
    postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Data Engineer',
    company: 'Databricks',
    location: 'San Francisco, CA',
    description: 'Build data processing platforms that power analytics at scale.',
    requirements: ['Python', 'Spark', 'SQL', 'Data Warehousing', 'AWS/GCP'],
    salary: { min: 200000, max: 350000, currency: 'USD' },
    sourcePortal: 'angellist',
    externalJobId: 'databricks-7001',
    externalUrl: 'https://example.com/databricks-7001',
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Quality Assurance Engineer',
    company: 'Microsoft',
    location: 'Redmond, WA',
    description: 'Ensure quality of cloud services used by enterprises worldwide.',
    requirements: ['Test automation', 'C#', 'SQL', 'Azure', '2+ years experience'],
    salary: { min: 140000, max: 220000, currency: 'USD' },
    sourcePortal: 'indeed',
    externalJobId: 'microsoft-8001',
    externalUrl: 'https://example.com/microsoft-8001',
    postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Product Manager - Engineering',
    company: 'Stripe',
    location: 'San Francisco, CA',
    description: 'Lead the vision for payment technology that moves the internet forward.',
    requirements: ['Product strategy', 'SQL', 'Analytics', 'API design', '4+ years PM experience'],
    salary: { min: 200000, max: 350000, currency: 'USD' },
    sourcePortal: 'linkedin',
    externalJobId: 'stripe-9001',
    externalUrl: 'https://example.com/stripe-9001',
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    title: 'Security Engineer',
    company: 'Cloudflare',
    location: 'Remote',
    description: 'Build security tools that protect millions of websites from attacks.',
    requirements: ['Network security', 'C/C++', 'Linux', 'Cryptography', '4+ years experience'],
    salary: { min: 210000, max: 340000, currency: 'USD' },
    sourcePortal: 'glassdoor',
    externalJobId: 'cloudflare-10001',
    externalUrl: 'https://example.com/cloudflare-10001',
    postedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
];

// Extended set of additional jobs
const additionalJobs = Array.from({ length: 90 }, (_, i) => {
  const companies = [
    'Google', 'Meta', 'Amazon', 'Netflix', 'Apple', 'Microsoft', 'Stripe', 'Cloudflare',
    'Uber', 'Airbnb', 'Slack', 'Shopify', 'Spotify', 'Discord', 'Notion', 'Figma',
    'Canva', 'Grammarly', 'Dropbox', 'Box', 'Datadog', 'New Relic', 'CrunchBase', 'AngelList'
  ];

  const titles = [
    'Senior Backend Engineer', 'Junior Frontend Developer', 'Full Stack Engineer',
    'DevOps Engineer', 'Data Engineer', 'ML Engineer', 'Mobile Developer',
    'QA Engineer', 'Product Manager', 'Solutions Architect', 'Technical Lead',
    'Engineering Manager', 'Security Engineer', 'Platform Engineer'
  ];

  const locations = [
    'Remote', 'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
    'Denver, CO', 'Boston, MA', 'Los Angeles, CA', 'Chicago, IL', 'Toronto, Canada'
  ];

  const skills = [
    ['Python', 'Django', 'PostgreSQL'],
    ['TypeScript', 'Next.js', 'Tailwind'],
    ['Go', 'Rust', 'gRPC'],
    ['Java', 'Spring Boot', 'Kafka'],
    ['React', 'Vue', 'Angular'],
    ['AWS', 'Terraform', 'Docker'],
    ['Kubernetes', 'Helm', 'CI/CD'],
    ['GraphQL', 'REST APIs', 'WebSockets'],
  ];

  return {
    title: titles[i % titles.length],
    company: companies[i % companies.length],
    location: locations[i % locations.length],
    description: `Join our team and make an impact! We are looking for talented engineers to build innovative products.`,
    requirements: skills[i % skills.length],
    salary: {
      min: 100000 + Math.floor(Math.random() * 200000),
      max: 200000 + Math.floor(Math.random() * 250000),
      currency: 'USD'
    },
    sourcePortal: ['indeed', 'linkedin', 'glassdoor', 'angellist'][i % 4] as 'indeed' | 'linkedin' | 'glassdoor' | 'angellist',
    externalJobId: `job-${i + 1001}`,
    externalUrl: `https://example.com/job-${i + 1001}`,
    postedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
  };
});

async function seedDatabase() {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...');

    // Clear existing jobs
    await Job.deleteMany({});
    console.log('🗑️  Cleared existing jobs');

    // Insert new jobs
    const allJobs = [...mockJobs, ...additionalJobs];
    await Job.insertMany(allJobs);
    console.log(`✅ Seeded ${allJobs.length} jobs successfully!`);

    // Stats
    const totalJobs = await Job.countDocuments();
    const byPortal = await Job.aggregate([
      { $group: { _id: '$sourcePortal', count: { $sum: 1 } } }
    ]);

    console.log(`\n📊 Stats:`);
    console.log(`Total jobs: ${totalJobs}`);
    console.log(`By portal:`, byPortal);

    await disconnectDB();
    console.log('\n✅ Seed complete!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedDatabase();
