import LoginForm from './login-form';
import { Car, Shield, TrendingUp, Clock } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className='flex min-h-screen'>
      {/* Left Side - Branding */}
      <div className='relative hidden w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 lg:flex lg:flex-col lg:justify-between p-12'>
        {/* Background Pattern */}
        <div className='absolute inset-0 opacity-10'>
          <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
            <defs>
              <pattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'>
                <path d='M 40 0 L 0 0 0 40' fill='none' stroke='white' strokeWidth='1' />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#grid)' />
          </svg>
        </div>

        {/* Logo */}
        <div className='relative z-10'>
          <h2 className='text-2xl font-bold text-primary-foreground'>
            YayaGO<span className='font-normal opacity-70'> Partner</span>
          </h2>
        </div>

        {/* Main Content */}
        <div className='relative z-10 space-y-8'>
          <div>
            <h1 className='text-4xl font-bold leading-tight text-primary-foreground'>
              Grow Your Rental
              <br />
              Business With Us
            </h1>
            <p className='mt-4 text-lg text-primary-foreground/80'>
              Join thousands of rental companies maximizing their fleet potential.
            </p>
          </div>

          {/* Features */}
          <div className='grid grid-cols-2 gap-4'>
            <FeatureCard
              icon={<Car className='h-5 w-5' />}
              title='Fleet Management'
              description='Manage all your vehicles in one place'
            />
            <FeatureCard
              icon={<TrendingUp className='h-5 w-5' />}
              title='Analytics'
              description='Track revenue and performance'
            />
            <FeatureCard
              icon={<Clock className='h-5 w-5' />}
              title='24/7 Bookings'
              description='Accept bookings around the clock'
            />
            <FeatureCard
              icon={<Shield className='h-5 w-5' />}
              title='Secure Payments'
              description='Get paid safely and on time'
            />
          </div>
        </div>

        {/* Footer */}
        <div className='relative z-10'>
          <p className='text-sm text-primary-foreground/60'>
            © {new Date().getFullYear()} YayaGO. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className='flex w-full items-center justify-center bg-background px-6 lg:w-1/2'>
        <LoginForm />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className='rounded-xl bg-white/10 p-4 backdrop-blur-sm'>
      <div className='mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-primary-foreground'>
        {icon}
      </div>
      <h3 className='font-semibold text-primary-foreground'>{title}</h3>
      <p className='text-sm text-primary-foreground/70'>{description}</p>
    </div>
  );
}
