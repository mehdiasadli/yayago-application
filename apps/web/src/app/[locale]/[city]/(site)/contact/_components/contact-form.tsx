'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Loader2, Send } from 'lucide-react';
import React from 'react';

const topics = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'booking', label: 'Booking Support' },
  { value: 'partner', label: 'Partner/Host Inquiry' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other', label: 'Other' },
];

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <div className='flex size-16 items-center justify-center rounded-full bg-primary/10 mb-6'>
          <CheckCircle className='size-8 text-primary' />
        </div>
        <h3 className='font-bold text-2xl mb-2'>Message Sent!</h3>
        <p className='text-muted-foreground max-w-sm'>
          Thank you for reaching out. Our team will get back to you within 24 hours.
        </p>
        <Button className='mt-6' variant='outline' onClick={() => setIsSubmitted(false)}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-5'>
      <div className='grid sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='name'>Full Name</Label>
          <Input id='name' placeholder='John Doe' required className='h-11 rounded-xl' />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email Address</Label>
          <Input id='email' type='email' placeholder='john@example.com' required className='h-11 rounded-xl' />
        </div>
      </div>

      <div className='grid sm:grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='phone'>Phone Number (Optional)</Label>
          <Input id='phone' type='tel' placeholder='+971 50 123 4567' className='h-11 rounded-xl' />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='topic'>Topic</Label>
          <Select defaultValue='general'>
            <SelectTrigger id='topic' className='h-11 rounded-xl'>
              <SelectValue placeholder='Select a topic' />
            </SelectTrigger>
            <SelectContent>
              {topics.map((topic) => (
                <SelectItem key={topic.value} value={topic.value}>
                  {topic.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='subject'>Subject</Label>
        <Input id='subject' placeholder='How can we help you?' required className='h-11 rounded-xl' />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='message'>Message</Label>
        <Textarea
          id='message'
          placeholder='Tell us more about your inquiry...'
          required
          className='min-h-[150px] rounded-xl resize-none'
        />
      </div>

      <Button type='submit' size='lg' className='w-full h-12 rounded-xl' disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className='mr-2 size-5 animate-spin' />
            Sending...
          </>
        ) : (
          <>
            <Send className='mr-2 size-5' />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}

