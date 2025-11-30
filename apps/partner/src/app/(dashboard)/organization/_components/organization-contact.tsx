'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  Globe, 
  MessageCircle, 
  Pencil,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useOrgContext } from '../page';

export function OrganizationContact() {
  const { org, canEdit } = useOrgContext();

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <Phone className='size-4' />
            Contact Information
          </CardTitle>
          <CardDescription>How customers can reach you</CardDescription>
        </div>
        {canEdit && (
          <Button asChild variant='outline' size='sm'>
            <Link href='/organization/edit/contact'>
              <Pencil className='size-3 mr-1.5' />
              Edit
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-3'>
          {org.email && (
            <div className='flex items-start gap-3'>
              <Mail className='size-4 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Email</p>
                <a 
                  href={`mailto:${org.email}`} 
                  className='font-medium hover:underline'
                >
                  {org.email}
                </a>
              </div>
            </div>
          )}
          
          {org.phoneNumber && (
            <div className='flex items-start gap-3'>
              <Phone className='size-4 text-muted-foreground mt-0.5' />
              <div>
                <div className='flex items-center gap-2'>
                  <p className='text-sm text-muted-foreground'>Phone</p>
                  {org.phoneNumberVerified ? (
                    <Badge variant='success' className='text-xs gap-0.5'>
                      <CheckCircle className='size-2.5' />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant='secondary' className='text-xs gap-0.5'>
                      <XCircle className='size-2.5' />
                      Not Verified
                    </Badge>
                  )}
                </div>
                <a 
                  href={`tel:${org.phoneNumber}`} 
                  className='font-medium hover:underline'
                >
                  {org.phoneNumber}
                </a>
              </div>
            </div>
          )}
          
          {org.whatsapp && (
            <div className='flex items-start gap-3'>
              <MessageCircle className='size-4 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>WhatsApp</p>
                <a 
                  href={`https://wa.me/${org.whatsapp.replace(/[^0-9]/g, '')}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium hover:underline'
                >
                  {org.whatsapp}
                </a>
              </div>
            </div>
          )}
          
          {org.website && (
            <div className='flex items-start gap-3'>
              <Globe className='size-4 text-muted-foreground mt-0.5' />
              <div>
                <p className='text-sm text-muted-foreground'>Website</p>
                <a 
                  href={org.website}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='font-medium hover:underline'
                >
                  {org.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          )}
        </div>

        {!org.email && !org.phoneNumber && !org.website && (
          <p className='text-sm text-muted-foreground text-center py-4'>
            No contact information added yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
