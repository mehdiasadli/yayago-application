'use client';

import { Badge, BadgeProps } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Users,
  Car,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatEnumValue } from '@/lib/utils';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { OrganizationStatus, DocumentVerificationStatus } from '@yayago-app/db/enums';
import UpdateOrganizationStatusDialog from './update-status-dialog';
import Link from 'next/link';

interface OrganizationDetailsContentProps {
  slug: string;
}

function getStatusBadgeVariant(status: OrganizationStatus): BadgeProps['variant'] {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING_APPROVAL':
      return 'warning';
    case 'REJECTED':
      return 'destructive';
    case 'SUSPENDED':
      return 'destructive';
    case 'ARCHIVED':
      return 'secondary';
    case 'ONBOARDING':
      return 'info';
    case 'DRAFT':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getDocStatusBadgeVariant(status: DocumentVerificationStatus): BadgeProps['variant'] {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'REJECTED':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export default function OrganizationDetailsContent({ slug }: OrganizationDetailsContentProps) {
  const { data: org, isLoading, error } = useQuery(
    orpc.organizations.findOne.queryOptions({
      input: { slug },
    })
  );

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-48 w-full' />
        <Skeleton className='h-64 w-full' />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-destructive'>Error: {error.message}</CardContent>
      </Card>
    );
  }

  if (!org) {
    return (
      <Card>
        <CardContent className='py-8 text-center text-muted-foreground'>Organization not found</CardContent>
      </Card>
    );
  }

  const canUpdateStatus = ['PENDING_APPROVAL', 'REJECTED', 'APPROVED', 'SUSPENDED'].includes(org.status);

  return (
    <div className='space-y-6'>
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Avatar className='size-16'>
                <AvatarImage src={org.logo || undefined} />
                <AvatarFallback className='bg-primary/10 text-primary'>
                  <Building2 className='size-8' />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className='text-2xl font-bold'>{org.name}</h2>
                <p className='text-muted-foreground font-normal'>
                  {org.legalName || org.slug}
                  {org.taxId && <span className='ml-2'>• Tax ID: {org.taxId}</span>}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              {canUpdateStatus ? (
                <UpdateOrganizationStatusDialog slug={org.slug} currentStatus={org.status}>
                  <Badge variant={getStatusBadgeVariant(org.status)} className='cursor-pointer gap-1 px-3 py-1'>
                    {org.status === 'APPROVED' && <CheckCircle className='size-3' />}
                    {org.status === 'PENDING_APPROVAL' && <Clock className='size-3' />}
                    {org.status === 'REJECTED' && <XCircle className='size-3' />}
                    {org.status === 'SUSPENDED' && <Ban className='size-3' />}
                    {formatEnumValue(org.status)}
                  </Badge>
                </UpdateOrganizationStatusDialog>
              ) : (
                <Badge variant={getStatusBadgeVariant(org.status)} className='gap-1 px-3 py-1'>
                  {formatEnumValue(org.status)}
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Email */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Mail className='size-5 text-muted-foreground mt-0.5' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm text-muted-foreground'>Email</p>
                <p className='font-medium truncate'>{org.email || '—'}</p>
              </div>
            </div>

            {/* Phone */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Phone className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Phone</p>
                <p className='font-medium'>{org.phoneNumber || '—'}</p>
                {org.phoneNumber && (
                  <Badge
                    variant={org.phoneNumberVerified ? 'success' : 'warning'}
                    appearance='outline'
                    className='mt-1 text-xs'
                  >
                    {org.phoneNumberVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                )}
              </div>
            </div>

            {/* Location */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <MapPin className='size-5 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Location</p>
                <p className='font-medium'>
                  {org.city ? `${org.city.name}, ${org.city.country.name}` : '—'}
                </p>
                {org.address && <p className='text-xs text-muted-foreground truncate max-w-40'>{org.address}</p>}
              </div>
            </div>

            {/* Website */}
            <div className='flex items-start gap-3 p-4 rounded-lg bg-muted/50'>
              <Globe className='size-5 text-muted-foreground mt-0.5' />
              <div className='min-w-0 flex-1'>
                <p className='text-sm text-muted-foreground'>Website</p>
                {org.website ? (
                  <a
                    href={org.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-medium text-primary hover:underline truncate block'
                  >
                    {org.website.replace(/^https?:\/\//, '')}
                  </a>
                ) : (
                  <p className='font-medium'>—</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rejection/Suspension Info */}
      {(org.rejectionReason || org.banReason) && (
        <Card className='border-destructive/50 bg-destructive/5'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg text-destructive'>
              <AlertTriangle className='size-5' />
              {org.status === 'REJECTED' ? 'Rejection Details' : 'Suspension Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{org.rejectionReason || org.banReason}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-lg bg-primary/10'>
                <Users className='size-6 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{org._count.members}</p>
                <p className='text-sm text-muted-foreground'>Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-lg bg-primary/10'>
                <Car className='size-6 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{org._count.listings}</p>
                <p className='text-sm text-muted-foreground'>Listings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 rounded-lg bg-primary/10'>
                <CreditCard className='size-6 text-primary' />
              </div>
              <div>
                <p className='text-2xl font-bold'>{org._count.subscriptions}</p>
                <p className='text-sm text-muted-foreground'>Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Users className='size-5' />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {org.members.length === 0 ? (
              <p className='text-muted-foreground text-center py-4'>No members</p>
            ) : (
              <div className='space-y-3'>
                {org.members.map((member) => (
                  <div key={member.id} className='flex items-center justify-between py-2 border-b last:border-b-0'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='size-8'>
                        <AvatarImage src={member.user.image || undefined} />
                        <AvatarFallback className='text-xs'>
                          {member.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-medium text-sm'>{member.user.name}</p>
                        <p className='text-xs text-muted-foreground'>@{member.user.username}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary' className='capitalize'>
                        {member.role}
                      </Badge>
                      <Button variant='ghost' size='sm' asChild>
                        <Link href={`/users/${member.user.username}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <FileText className='size-5' />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {org.documents.length === 0 ? (
              <p className='text-muted-foreground text-center py-4'>No documents uploaded</p>
            ) : (
              <div className='space-y-3'>
                {org.documents.map((doc) => (
                  <div key={doc.id} className='flex items-center justify-between py-2 border-b last:border-b-0'>
                    <div>
                      <p className='font-medium text-sm'>Document #{doc.documentNumber || doc.id.slice(0, 8)}</p>
                      <p className='text-xs text-muted-foreground'>
                        {doc.files.length} file(s) • Uploaded {format(doc.createdAt, 'd MMM yyyy')}
                      </p>
                      {doc.expiresAt && (
                        <p className='text-xs text-muted-foreground'>Expires: {format(doc.expiresAt, 'd MMM yyyy')}</p>
                      )}
                    </div>
                    <Badge variant={getDocStatusBadgeVariant(doc.status)} appearance='outline'>
                      {formatEnumValue(doc.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Calendar className='size-5' />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex items-center justify-between py-2 border-b'>
                <span className='text-muted-foreground'>Created</span>
                <span className='font-medium'>{format(org.createdAt, 'd MMM yyyy, HH:mm')}</span>
              </div>
              <div className='flex items-center justify-between py-2 border-b'>
                <span className='text-muted-foreground'>Last Updated</span>
                <span className='font-medium'>{format(org.updatedAt, 'd MMM yyyy, HH:mm')}</span>
              </div>
              <div className='flex items-center justify-between py-2'>
                <span className='text-muted-foreground'>Onboarding Step</span>
                <Badge variant='secondary'>{org.onboardingStep} / 5</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <FileText className='size-5' />
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            {org.description ? (
              <p className='text-sm'>{typeof org.description === 'string' ? org.description : JSON.stringify(org.description)}</p>
            ) : (
              <p className='text-muted-foreground text-center py-4'>No description provided</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

