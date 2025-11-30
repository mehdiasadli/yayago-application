'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Pencil, 
  XCircle, 
  Clock, 
  Fuel,
  Gauge, 
  Shield, 
  UserCheck,
  Users,
  Globe2,
  Dog,
  Cigarette,
  Info
} from 'lucide-react';
import { useOrgContext } from '../page';

// biome-ignore lint/suspicious/noExplicitAny: Policy types are dynamic JSON
type PolicyConfig = { icon: React.ReactNode; label: string; getValue: (data: any) => React.ReactNode };

const policyConfigs: Record<string, PolicyConfig> = {
  cancellationPolicy: {
    icon: <XCircle className='size-4' />,
    label: 'Cancellation',
    getValue: (data) => (
      <Badge variant={data.type === 'flexible' ? 'success' : data.type === 'strict' ? 'destructive' : 'secondary'} className='capitalize'>
        {data.type}
      </Badge>
    ),
  },
  lateReturnPolicy: {
    icon: <Clock className='size-4' />,
    label: 'Late Return',
    getValue: (data) => (
      <span className='text-sm'>
        {data.gracePeriodMinutes}min grace, then {data.hourlyCharge ? `${data.hourlyCharge}/hr` : 'charges apply'}
      </span>
    ),
  },
  fuelPolicy: {
    icon: <Fuel className='size-4' />,
    label: 'Fuel',
    getValue: (data) => (
      <Badge variant='outline' className='capitalize'>
        {data.type?.replace(/_/g, ' ')}
      </Badge>
    ),
  },
  mileagePolicy: {
    icon: <Gauge className='size-4' />,
    label: 'Mileage',
    getValue: (data) => (
      <>
        {data.type === 'unlimited' ? (
          <Badge variant='success'>Unlimited</Badge>
        ) : (
          <span className='text-sm'>
            {data.dailyLimit}km/day, extra: {data.extraKmCharge}/km
          </span>
        )}
      </>
    ),
  },
  damagePolicy: {
    icon: <Shield className='size-4' />,
    label: 'Damage/Deposit',
    getValue: (data) => (
      <span className='text-sm'>
        {data.depositRequired ? `${data.depositAmount} deposit` : 'No deposit'}
      </span>
    ),
  },
  insurancePolicy: {
    icon: <Shield className='size-4' />,
    label: 'Insurance',
    getValue: (data) => (
      <div className='flex gap-1'>
        {data.included ? (
          <Badge variant='success'>Included</Badge>
        ) : (
          <Badge variant='secondary'>Optional</Badge>
        )}
        {data.types?.map((t: string) => (
          <Badge key={t} variant='outline' className='capitalize text-xs'>
            {t}
          </Badge>
        ))}
      </div>
    ),
  },
  agePolicy: {
    icon: <UserCheck className='size-4' />,
    label: 'Age Requirement',
    getValue: (data) => (
      <span className='text-sm'>
        Min: {data.minAge}
        {data.maxAge && `, Max: ${data.maxAge}`}
        {data.youngDriverSurcharge && ` (${data.youngDriverSurcharge} surcharge under ${data.youngDriverAge || 25})`}
      </span>
    ),
  },
  additionalDriverPolicy: {
    icon: <Users className='size-4' />,
    label: 'Additional Driver',
    getValue: (data) => (
      <>
        {data.allowed ? (
          <span className='text-sm'>
            {data.feePerDay ? `${data.feePerDay}/day` : 'Free'}, max {data.maxAdditional || 'unlimited'}
          </span>
        ) : (
          <Badge variant='destructive'>Not Allowed</Badge>
        )}
      </>
    ),
  },
  crossBorderPolicy: {
    icon: <Globe2 className='size-4' />,
    label: 'Cross Border',
    getValue: (data) => (
      <>
        {data.allowed ? (
          <span className='text-sm'>
            Allowed {data.additionalFee && `(+${data.additionalFee})`}
          </span>
        ) : (
          <Badge variant='secondary'>Not Allowed</Badge>
        )}
      </>
    ),
  },
  petPolicy: {
    icon: <Dog className='size-4' />,
    label: 'Pets',
    getValue: (data) => (
      <>
        {data.allowed ? (
          <span className='text-sm'>
            Allowed {data.feePerDay && `(+${data.feePerDay}/day)`}
          </span>
        ) : (
          <Badge variant='secondary'>Not Allowed</Badge>
        )}
      </>
    ),
  },
  smokingPolicy: {
    icon: <Cigarette className='size-4' />,
    label: 'Smoking',
    getValue: (data) => (
      <>
        {data.allowed ? (
          <Badge variant='warning'>Allowed</Badge>
        ) : (
          <div className='flex items-center gap-1'>
            <Badge variant='secondary'>Not Allowed</Badge>
            {data.cleaningFee && (
              <span className='text-xs text-muted-foreground'>
                ({data.cleaningFee} cleaning fee if violated)
              </span>
            )}
          </div>
        )}
      </>
    ),
  },
};

export function OrganizationPolicies() {
  const { org, canEditLimited } = useOrgContext();
  
  const policies = Object.entries(policyConfigs)
    .map(([key, config]) => ({
      key,
      ...config,
      data: org[key as keyof typeof org],
    }))
    .filter((p) => p.data);

  const configuredCount = policies.length;
  const totalCount = Object.keys(policyConfigs).length;

  return (
    <Card>
      <CardHeader className='flex flex-row items-start justify-between'>
        <div>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='size-4' />
            Default Policies
          </CardTitle>
          <CardDescription>
            {configuredCount} of {totalCount} policies configured
          </CardDescription>
        </div>
        {canEditLimited && (
          <Button asChild variant='outline' size='sm'>
            <Link href='/organization/edit/policies'>
              <Pencil className='size-3 mr-1.5' />
              Edit
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Info about default policies */}
        <Alert>
          <Info className='size-4' />
          <AlertDescription>
            These are your organization's <strong>default policies</strong>. They will automatically apply to all your listings unless you override them with listing-specific policies when creating or editing a listing.
          </AlertDescription>
        </Alert>

        {policies.length > 0 ? (
          <div className='grid gap-3'>
            {policies.map(({ key, icon, label, getValue, data }) => (
              <div
                key={key}
                className='flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors'
              >
                <div className='flex items-center gap-2 text-muted-foreground'>
                  {icon}
                  <span className='text-sm font-medium text-foreground'>{label}</span>
                </div>
                <div>{getValue(data)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-6'>
            <FileText className='size-8 mx-auto mb-2 text-muted-foreground opacity-50' />
            <p className='text-sm text-muted-foreground'>
              No default policies configured yet
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              Set up your rental policies to inform customers about your terms
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
