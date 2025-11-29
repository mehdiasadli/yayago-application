'use client';

import { useRouter } from 'next/navigation';

export default function Error() {
  const router = useRouter();
  router.push('/');

  return null;
}
