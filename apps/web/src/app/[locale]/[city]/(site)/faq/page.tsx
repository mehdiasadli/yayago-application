'use client';

import React from 'react';
import { FaqContent } from './_components/faq-content';
import { FaqHero } from './_components/faq-hero';

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  return (
    <div className='flex min-h-screen flex-col'>
      <FaqHero searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <FaqContent searchTerm={searchTerm} onClearSearch={() => setSearchTerm('')} />
    </div>
  );
}
