import { Contact } from '@/components/contact';
import { ContactCard } from '@/components/contact-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className='px-12 flex flex-col gap-0'>
      <Contact />

      <ContactCard
        className='mb-4 mx-4'
        title='Send us a message'
        contactInfo={[
          {
            icon: MailIcon,
            label: 'Email',
            value: 'support@yayago.ae',
          },
          {
            icon: PhoneIcon,
            label: 'Phone',
            value: '+971 50 123 4567',
          },
          {
            icon: MapPinIcon,
            label: 'Address',
            value: 'Office # 10, Al Mulla Building, Al Karama, Dubai, UAE',
          },
        ]}
      >
        <form className='w-full flex flex-col gap-4'>
          <Input type='text' placeholder='Name' />
          <Input type='email' placeholder='Email' />
          <Input type='text' placeholder='Subject' />
          <Textarea placeholder='Message' />

          <Button type='submit'>Send</Button>
        </form>
      </ContactCard>
    </div>
  );
}
