import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Globe2, Layers, ShieldCheck, Smartphone, Users } from 'lucide-react';

const benefits = [
  {
    title: 'Global Reach',
    description: 'Showcase your fleet to thousands of local and international customers looking for rentals.',
    icon: Globe2,
  },
  {
    title: 'Verified Customers',
    description: 'We screen all users, verifying their identity and driving license before they can book.',
    icon: ShieldCheck,
  },
  {
    title: 'Smart Dashboard',
    description: 'Manage your inventory, pricing, availability, and bookings from one intuitive platform.',
    icon: LayoutDashboardIcon,
  },
  {
    title: 'Secure Payments',
    description: 'Get paid automatically. We handle payment processing and deposit earnings to your account.',
    icon: Layers, // Or Wallet
  },
  {
    title: 'Mobile Ready',
    description: 'Manage your business on the go with our mobile-friendly partner dashboard.',
    icon: Smartphone,
  },
  {
    title: 'Data & Analytics',
    description: 'Gain insights into your performance, popular cars, and revenue trends.',
    icon: BarChart3,
  },
];

import { LayoutDashboard as LayoutDashboardIcon } from 'lucide-react';

export function HostBenefits() {
  return (
    <section className='container mx-auto px-4 py-16'>
      <div className='mb-12 text-center'>
        <h2 className='font-bold text-3xl tracking-tight md:text-4xl'>Why Partner with YayaGO?</h2>
        <p className='mt-4 text-muted-foreground'>
          We provide the tools and audience you need to grow your rental business.
        </p>
      </div>
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {benefits.map((benefit, index) => (
          <Card key={index} className='bg-card transition-shadow hover:shadow-md'>
            <CardHeader>
              <benefit.icon className='mb-2 size-10 text-primary' />
              <CardTitle className='text-xl'>{benefit.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>{benefit.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

