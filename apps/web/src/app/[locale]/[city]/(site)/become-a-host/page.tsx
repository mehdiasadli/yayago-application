import { HostBenefits } from './_components/host-benefits';
import { HostCTA } from './_components/host-cta';
import { HostEarningsCalculator } from './_components/host-earnings-calculator';
import { HostHero } from './_components/host-hero';
import { HostHowItWorks } from './_components/host-how-it-works';
import { HostPricing } from './_components/host-pricing';

export default function BecomeAHostPage() {
  return (
    <div className='flex min-h-screen flex-col'>
      <HostHero />
      <HostBenefits />
      <HostHowItWorks />
      <HostEarningsCalculator />
      <HostPricing />
      <HostCTA />
    </div>
  );
}
