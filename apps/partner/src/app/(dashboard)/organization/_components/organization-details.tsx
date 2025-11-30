'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Pencil, Calendar, Award } from 'lucide-react';
import { useOrgContext } from '../page';

export function OrganizationDetails() {
  const { org, canEdit } = useOrgContext();
  const certifications = org.certificationsJson as string[] | null;
  
  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <Building2 className='size-4' />
            Business Details
          </CardTitle>
          <CardDescription>Basic information about your organization</CardDescription>
        </div>
        {canEdit && (
          <Button asChild variant='outline' size='sm'>
            <Link href='/organization/edit/details'>
              <Pencil className='size-3 mr-1.5' />
              Edit
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-3'>
          <div>
            <p className='text-sm text-muted-foreground'>Organization Name</p>
            <p className='font-medium'>{org.name}</p>
          </div>
          
          {org.legalName && (
            <div>
              <p className='text-sm text-muted-foreground'>Legal Name</p>
              <p className='font-medium'>{org.legalName}</p>
            </div>
          )}
          
          {org.taxId && (
            <div>
              <p className='text-sm text-muted-foreground'>Tax ID / Trade License</p>
              <p className='font-medium font-mono'>{org.taxId}</p>
            </div>
          )}

          {org.tagline && (
            <div>
              <p className='text-sm text-muted-foreground'>Tagline</p>
              <p className='font-medium'>{org.tagline}</p>
            </div>
          )}

          {org.foundedYear && (
            <div className='flex items-center gap-2'>
              <Calendar className='size-4 text-muted-foreground' />
              <span className='text-sm'>
                Established in <span className='font-medium'>{org.foundedYear}</span>
              </span>
            </div>
          )}
        </div>

        {org.specializations && org.specializations.length > 0 && (
          <div>
            <p className='text-sm text-muted-foreground mb-2'>Specializations</p>
            <div className='flex flex-wrap gap-1.5'>
              {org.specializations.map((spec) => (
                <Badge key={spec} variant='secondary' className='capitalize'>
                  {spec}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {certifications && certifications.length > 0 && (
          <div>
            <p className='text-sm text-muted-foreground mb-2 flex items-center gap-1'>
              <Award className='size-3.5' />
              Certifications
            </p>
            <div className='flex flex-wrap gap-1.5'>
              {certifications.map((cert) => (
                <Badge key={cert} variant='outline'>
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
