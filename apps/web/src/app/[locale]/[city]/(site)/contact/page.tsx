import { ContactCTA } from './_components/contact-cta';
import { ContactFormSection } from './_components/contact-form-section';
import { ContactHero } from './_components/contact-hero';
import { ContactSocial } from './_components/contact-social';

export default function ContactPage() {
  return (
    <div className='flex min-h-screen flex-col'>
      <ContactHero />
      <ContactFormSection />
      <ContactSocial />
      <ContactCTA />
    </div>
  );
}
