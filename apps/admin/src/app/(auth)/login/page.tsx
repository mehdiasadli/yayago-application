import LoginForm from './login-form';
import { Users, BarChart3, Settings, Shield } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className='flex min-h-screen'>
      {/* Left Side - Branding */}
      <div className='relative hidden w-1/2 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 lg:flex lg:flex-col lg:justify-between p-12'>
        {/* Background Pattern */}
        <div className='absolute inset-0 opacity-5'>
          <svg className='h-full w-full' xmlns='http://www.w3.org/2000/svg'>
            <defs>
              <pattern id='grid' width='32' height='32' patternUnits='userSpaceOnUse'>
                <path d='M 32 0 L 0 0 0 32' fill='none' stroke='white' strokeWidth='0.5' />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#grid)' />
          </svg>
        </div>

        {/* Decorative circles */}
        <div className='absolute top-20 right-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute bottom-20 left-20 h-48 w-48 rounded-full bg-primary/5 blur-3xl' />

        {/* Logo */}
        <div className='relative z-10'>
          <h2 className='text-2xl font-bold text-white'>
            YayaGO<span className='font-normal text-zinc-400'> Admin</span>
          </h2>
        </div>

        {/* Main Content */}
        <div className='relative z-10 space-y-8'>
          <div>
            <h1 className='text-4xl font-bold leading-tight text-white'>
              Platform
              <br />
              Administration
            </h1>
            <p className='mt-4 text-lg text-zinc-400'>
              Manage users, organizations, listings, and platform operations.
            </p>
          </div>

          {/* Features */}
          <div className='grid grid-cols-2 gap-4'>
            <FeatureCard
              icon={<Users className='h-5 w-5' />}
              title='User Management'
              description='Manage users and verifications'
            />
            <FeatureCard
              icon={<BarChart3 className='h-5 w-5' />}
              title='Analytics'
              description='Platform insights and metrics'
            />
            <FeatureCard
              icon={<Settings className='h-5 w-5' />}
              title='Configuration'
              description='System settings and controls'
            />
            <FeatureCard
              icon={<Shield className='h-5 w-5' />}
              title='Security'
              description='Access control and audit logs'
            />
          </div>
        </div>

        {/* Footer */}
        <div className='relative z-10'>
          <p className='text-sm text-zinc-500'>© {new Date().getFullYear()} YayaGO. Internal use only.</p>
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
    <div className='rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-4 backdrop-blur-sm'>
      <div className='mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-700/50 text-zinc-300'>
        {icon}
      </div>
      <h3 className='font-semibold text-white'>{title}</h3>
      <p className='text-sm text-zinc-400'>{description}</p>
    </div>
  );
}
