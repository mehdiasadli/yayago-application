import { Header } from '@/components/header';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main className='min-h-screen'>{children}</main>
    </div>
  );
}
