import { orpc } from '@/utils/orpc';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, Car, DollarSign, CalendarCheck, ImageIcon, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatEnumValue } from '@/lib/utils';

interface EditListingPageProps {
  params: Promise<{ slug: string }>;
}

const editSections = [
  {
    title: 'Listing Details',
    description: 'Edit title, description, and tags',
    href: 'details',
    icon: FileText,
  },
  {
    title: 'Vehicle',
    description: 'Edit vehicle specifications and features',
    href: 'vehicle',
    icon: Car,
  },
  {
    title: 'Pricing',
    description: 'Edit rental rates and deposit settings',
    href: 'pricing',
    icon: DollarSign,
  },
  {
    title: 'Booking Rules',
    description: 'Edit booking requirements and policies',
    href: 'booking',
    icon: CalendarCheck,
  },
  {
    title: 'Media',
    description: 'Manage photos and videos',
    href: 'media',
    icon: ImageIcon,
  },
];

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { slug } = await params;
  const listing = await orpc.listings.findOne.call({ slug });

  return (
    <div className='space-y-6'>
      <PageHeader
        title={
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='sm' asChild>
              <Link href={`/listings/${slug}`}>
                <ArrowLeft className='size-4' />
              </Link>
            </Button>
            <span>Edit Listing</span>
          </div>
        }
        description={listing.title}
      />

      {/* Current Status */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base'>Current Status</CardTitle>
            <div className='flex gap-2'>
              <Badge variant={listing.status === 'AVAILABLE' ? 'success' : 'secondary'}>
                {formatEnumValue(listing.status)}
              </Badge>
              <Badge
                variant={
                  listing.verificationStatus === 'APPROVED'
                    ? 'success'
                    : listing.verificationStatus === 'PENDING'
                      ? 'warning'
                      : 'destructive'
                }
              >
                {formatEnumValue(listing.verificationStatus)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-muted-foreground'>
            {listing.vehicle
              ? `${listing.vehicle.year} ${listing.vehicle.model.brand.name} ${listing.vehicle.model.name}`
              : 'No vehicle details'}
          </p>
        </CardContent>
      </Card>

      {/* Edit Sections */}
      <div className='grid gap-4'>
        {editSections.map((section) => (
          <Link key={section.href} href={`/listings/${slug}/edit/${section.href}`}>
            <Card className='hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group'>
              <CardContent className='flex items-center gap-4 py-4'>
                <div className='flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors'>
                  <section.icon className='size-6' />
                </div>
                <div className='flex-1'>
                  <CardTitle className='text-base'>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
                <ChevronRight className='size-5 text-muted-foreground group-hover:text-primary transition-colors' />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

