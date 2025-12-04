import { AboutCTA } from './_components/about-cta';
import { AboutDifference } from './_components/about-difference';
import { AboutForPartners } from './_components/about-for-partners';
import { AboutHero } from './_components/about-hero';
import { AboutHowItWorks } from './_components/about-how-it-works';
import { AboutMission } from './_components/about-mission';

export default function AboutPage() {
  return (
    <div className='flex min-h-screen flex-col'>
      <AboutHero />
      <AboutDifference />
      <AboutHowItWorks />
      <AboutMission />
      <AboutForPartners />
      <AboutCTA />
    </div>
  );
}
