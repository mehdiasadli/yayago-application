import { LeasingBenefits } from './_components/leasing-benefits';
import { LeasingCalculator } from './_components/leasing-calculator';
import { LeasingCTA } from './_components/leasing-cta';
import { LeasingHero } from './_components/leasing-hero';
import { LeasingSteps } from './_components/leasing-steps';

export default function LeasingPage() {
  return (
    <div className='flex min-h-screen flex-col'>
      <LeasingHero />
      <LeasingBenefits />
      <LeasingSteps />
      <LeasingCalculator />
      <LeasingCTA />
    </div>
  );
}
