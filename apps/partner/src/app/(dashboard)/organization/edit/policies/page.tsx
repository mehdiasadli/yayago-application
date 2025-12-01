'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, AlertCircle, FileText, Info, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type CancellationPolicyType = 'flexible' | 'moderate' | 'strict' | 'custom';
type FuelPolicyType = 'full_to_full' | 'same_to_same' | 'prepaid';
type MileagePolicyType = 'unlimited' | 'limited';

type PoliciesState = {
  cancellationPolicy: { type: CancellationPolicyType; fullRefundHours: number; partialRefundHours: number; partialRefundPercent: number };
  lateReturnPolicy: { gracePeriodMinutes: number; hourlyCharge: number };
  fuelPolicy: { type: FuelPolicyType };
  mileagePolicy: { type: MileagePolicyType; dailyLimit: number; extraKmCharge: number };
  damagePolicy: { depositRequired: boolean; depositAmount: number };
  insurancePolicy: { included: boolean; types: string[] };
  agePolicy: { minAge: number; maxAge: number; youngDriverSurcharge: number; youngDriverAge: number };
  additionalDriverPolicy: { allowed: boolean; feePerDay: number; maxAdditional: number };
  crossBorderPolicy: { allowed: boolean; additionalFee: number };
  petPolicy: { allowed: boolean; feePerDay: number };
  smokingPolicy: { allowed: boolean; cleaningFee: number };
};

const DEFAULT_POLICIES: PoliciesState = {
  cancellationPolicy: { type: 'moderate', fullRefundHours: 48, partialRefundHours: 24, partialRefundPercent: 50 },
  lateReturnPolicy: { gracePeriodMinutes: 30, hourlyCharge: 50 },
  fuelPolicy: { type: 'full_to_full' },
  mileagePolicy: { type: 'unlimited', dailyLimit: 300, extraKmCharge: 0.5 },
  damagePolicy: { depositRequired: true, depositAmount: 2000 },
  insurancePolicy: { included: true, types: ['basic'] },
  agePolicy: { minAge: 21, maxAge: 75, youngDriverSurcharge: 50, youngDriverAge: 25 },
  additionalDriverPolicy: { allowed: true, feePerDay: 25, maxAdditional: 2 },
  crossBorderPolicy: { allowed: false, additionalFee: 100 },
  petPolicy: { allowed: false, feePerDay: 25 },
  smokingPolicy: { allowed: false, cleaningFee: 200 },
};

export default function EditOrganizationPoliciesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: org, isLoading, error } = useQuery(
    orpc.organizations.getMyOrganization.queryOptions()
  );

  const [policies, setPolicies] = useState<PoliciesState>(DEFAULT_POLICIES);

  const mutation = useMutation(
    orpc.organizations.updatePolicies.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ predicate: (query) => 
          Array.isArray(query.queryKey) && query.queryKey.some(k => 
            typeof k === 'string' && k.includes('organization')
          )
        });
        toast.success('Policies updated');
        router.push('/organization');
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to update');
      },
    })
  );

  useEffect(() => {
    if (org) {
      setPolicies((prev) => ({
        cancellationPolicy: { ...prev.cancellationPolicy, ...(org.cancellationPolicy as object) },
        lateReturnPolicy: { ...prev.lateReturnPolicy, ...(org.lateReturnPolicy as object) },
        fuelPolicy: { ...prev.fuelPolicy, ...(org.fuelPolicy as object) },
        mileagePolicy: { ...prev.mileagePolicy, ...(org.mileagePolicy as object) },
        damagePolicy: { ...prev.damagePolicy, ...(org.damagePolicy as object) },
        insurancePolicy: { ...prev.insurancePolicy, ...(org.insurancePolicy as object) },
        agePolicy: { ...prev.agePolicy, ...(org.agePolicy as object) },
        additionalDriverPolicy: { ...prev.additionalDriverPolicy, ...(org.additionalDriverPolicy as object) },
        crossBorderPolicy: { ...prev.crossBorderPolicy, ...(org.crossBorderPolicy as object) },
        petPolicy: { ...prev.petPolicy, ...(org.petPolicy as object) },
        smokingPolicy: { ...prev.smokingPolicy, ...(org.smokingPolicy as object) },
      }));
    }
  }, [org]);

  // biome-ignore lint/suspicious/noExplicitAny: Nested policy updates
  const updatePolicy = (policyKey: keyof PoliciesState, field: string, value: any) => {
    setPolicies((prev) => ({
      ...prev,
      [policyKey]: {
        ...prev[policyKey],
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    // Cast to match API schema types
    mutation.mutate({
      cancellationPolicy: {
        ...policies.cancellationPolicy,
        type: policies.cancellationPolicy.type as 'flexible' | 'moderate' | 'strict' | 'custom',
      },
      lateReturnPolicy: policies.lateReturnPolicy,
      fuelPolicy: {
        ...policies.fuelPolicy,
        type: policies.fuelPolicy.type as 'full_to_full' | 'same_to_same' | 'prepaid',
      },
      mileagePolicy: {
        ...policies.mileagePolicy,
        type: policies.mileagePolicy.type as 'unlimited' | 'limited',
      },
      damagePolicy: policies.damagePolicy,
      insurancePolicy: policies.insurancePolicy,
      agePolicy: policies.agePolicy,
      additionalDriverPolicy: policies.additionalDriverPolicy,
      crossBorderPolicy: policies.crossBorderPolicy,
      petPolicy: policies.petPolicy,
      smokingPolicy: policies.smokingPolicy,
    });
  };

  if (isLoading) {
    return (
      <div className='container py-6 max-w-3xl'>
        <Skeleton className='h-8 w-48 mb-6' />
        <Skeleton className='h-96' />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className='container py-6 max-w-3xl'>
        <Alert variant='destructive'>
          <AlertCircle className='size-4' />
          <AlertDescription>Failed to load organization data</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user is owner or admin
  if (org.memberRole !== 'owner' && org.memberRole !== 'admin') {
    return (
      <div className='container py-6 max-w-3xl'>
        <Alert variant='destructive'>
          <ShieldAlert className='size-4' />
          <AlertDescription>
            Only organization owners or admins can edit policies.
          </AlertDescription>
        </Alert>
        <Button asChild variant='outline' className='mt-4'>
          <Link href='/organization'>
            <ArrowLeft className='size-4 mr-1.5' />
            Back to Organization
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='container py-6 max-w-3xl'>
      <Button asChild variant='ghost' size='sm' className='mb-4'>
        <Link href='/organization'>
          <ArrowLeft className='size-4 mr-1.5' />
          Back to Organization
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='size-5' />
            Edit Default Policies
          </CardTitle>
          <CardDescription>Configure your organization's rental policies and terms</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Info about defaults */}
          <Alert className='mb-6'>
            <Info className='size-4' />
            <AlertDescription>
              These policies serve as <strong>defaults</strong> for all your listings. You can override these on individual listings if needed. Customers will see these policies when booking.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue='cancellation' className='w-full'>
            <TabsList className='w-full grid grid-cols-3 lg:grid-cols-6 h-auto'>
              <TabsTrigger value='cancellation' className='text-xs'>Cancellation</TabsTrigger>
              <TabsTrigger value='fuel' className='text-xs'>Fuel & Mileage</TabsTrigger>
              <TabsTrigger value='deposit' className='text-xs'>Deposit</TabsTrigger>
              <TabsTrigger value='age' className='text-xs'>Age & Drivers</TabsTrigger>
              <TabsTrigger value='rules' className='text-xs'>Rules</TabsTrigger>
              <TabsTrigger value='late' className='text-xs'>Late Return</TabsTrigger>
            </TabsList>

            {/* Cancellation Policy */}
            <TabsContent value='cancellation' className='space-y-4 mt-4'>
              <div className='space-y-2'>
                <Label>Cancellation Type</Label>
                <Select
                  value={policies.cancellationPolicy.type}
                  onValueChange={(v) => updatePolicy('cancellationPolicy', 'type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='flexible' textValue='Flexible'>
                      <div className='flex flex-col'>
                        <span>Flexible</span>
                        <span className='text-xs text-muted-foreground'>Full refund up to 24 hours before pickup</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='moderate' textValue='Moderate'>
                      <div className='flex flex-col'>
                        <span>Moderate</span>
                        <span className='text-xs text-muted-foreground'>Full refund up to 48 hours before pickup</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='strict' textValue='Strict'>
                      <div className='flex flex-col'>
                        <span>Strict</span>
                        <span className='text-xs text-muted-foreground'>50% refund up to 7 days before pickup</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='custom' textValue='Custom'>
                      <div className='flex flex-col'>
                        <span>Custom</span>
                        <span className='text-xs text-muted-foreground'>Define your own refund rules</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className='text-xs text-muted-foreground'>
                  Determines how refunds are handled when customers cancel their booking.
                </p>
              </div>
              
              {policies.cancellationPolicy.type === 'custom' && (
                <>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>Full Refund (hours before pickup)</Label>
                      <Input
                        type='number'
                        value={policies.cancellationPolicy.fullRefundHours}
                        onChange={(e) => updatePolicy('cancellationPolicy', 'fullRefundHours', Number(e.target.value))}
                      />
                      <p className='text-xs text-muted-foreground'>Cancellations before this get 100% refund</p>
                    </div>
                    <div className='space-y-2'>
                      <Label>Partial Refund (hours before pickup)</Label>
                      <Input
                        type='number'
                        value={policies.cancellationPolicy.partialRefundHours}
                        onChange={(e) => updatePolicy('cancellationPolicy', 'partialRefundHours', Number(e.target.value))}
                      />
                      <p className='text-xs text-muted-foreground'>Cancellations before this get partial refund</p>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label>Partial Refund Percentage (%)</Label>
                    <Input
                      type='number'
                      value={policies.cancellationPolicy.partialRefundPercent}
                      onChange={(e) => updatePolicy('cancellationPolicy', 'partialRefundPercent', Number(e.target.value))}
                      min={0}
                      max={100}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            {/* Fuel & Mileage */}
            <TabsContent value='fuel' className='space-y-4 mt-4'>
              <div className='space-y-2'>
                <Label>Fuel Policy</Label>
                <Select
                  value={policies.fuelPolicy.type}
                  onValueChange={(v) => updatePolicy('fuelPolicy', 'type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='full_to_full' textValue='Full to Full'>
                      <div className='flex flex-col'>
                        <span>Full to Full</span>
                        <span className='text-xs text-muted-foreground'>Pick up with full tank, return with full tank</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='same_to_same' textValue='Same to Same'>
                      <div className='flex flex-col'>
                        <span>Same to Same</span>
                        <span className='text-xs text-muted-foreground'>Return with same fuel level as pickup</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='prepaid' textValue='Prepaid Fuel'>
                      <div className='flex flex-col'>
                        <span>Prepaid Fuel</span>
                        <span className='text-xs text-muted-foreground'>Customer pays for full tank upfront</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>Mileage Policy</Label>
                <Select
                  value={policies.mileagePolicy.type}
                  onValueChange={(v) => updatePolicy('mileagePolicy', 'type', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='unlimited' textValue='Unlimited Mileage'>
                      <div className='flex flex-col'>
                        <span>Unlimited Mileage</span>
                        <span className='text-xs text-muted-foreground'>No restrictions on distance traveled</span>
                      </div>
                    </SelectItem>
                    <SelectItem value='limited' textValue='Limited Mileage'>
                      <div className='flex flex-col'>
                        <span>Limited Mileage</span>
                        <span className='text-xs text-muted-foreground'>Daily limit with extra charges for excess</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {policies.mileagePolicy.type === 'limited' && (
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Daily Limit (km)</Label>
                    <Input
                      type='number'
                      value={policies.mileagePolicy.dailyLimit}
                      onChange={(e) => updatePolicy('mileagePolicy', 'dailyLimit', Number(e.target.value))}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Extra km Charge (per km)</Label>
                    <Input
                      type='number'
                      step='0.1'
                      value={policies.mileagePolicy.extraKmCharge}
                      onChange={(e) => updatePolicy('mileagePolicy', 'extraKmCharge', Number(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Deposit */}
            <TabsContent value='deposit' className='space-y-4 mt-4'>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <Label>Security Deposit Required</Label>
                  <p className='text-sm text-muted-foreground'>
                    Hold a deposit before rental starts. Released after vehicle inspection.
                  </p>
                </div>
                <Switch
                  checked={policies.damagePolicy.depositRequired}
                  onCheckedChange={(v) => updatePolicy('damagePolicy', 'depositRequired', v)}
                />
              </div>

              {policies.damagePolicy.depositRequired && (
                <div className='space-y-2'>
                  <Label>Deposit Amount (AED)</Label>
                  <Input
                    type='number'
                    value={policies.damagePolicy.depositAmount}
                    onChange={(e) => updatePolicy('damagePolicy', 'depositAmount', Number(e.target.value))}
                  />
                  <p className='text-xs text-muted-foreground'>
                    Amount held on customer's card. Can be adjusted per listing.
                  </p>
                </div>
              )}

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <Label>Insurance Included</Label>
                  <p className='text-sm text-muted-foreground'>
                    Basic insurance coverage is included in rental price.
                  </p>
                </div>
                <Switch
                  checked={policies.insurancePolicy.included}
                  onCheckedChange={(v) => updatePolicy('insurancePolicy', 'included', v)}
                />
              </div>
            </TabsContent>

            {/* Age & Drivers */}
            <TabsContent value='age' className='space-y-4 mt-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Minimum Driver Age</Label>
                  <Input
                    type='number'
                    value={policies.agePolicy.minAge}
                    onChange={(e) => updatePolicy('agePolicy', 'minAge', Number(e.target.value))}
                  />
                  <p className='text-xs text-muted-foreground'>Youngest allowed driver age</p>
                </div>
                <div className='space-y-2'>
                  <Label>Maximum Driver Age</Label>
                  <Input
                    type='number'
                    value={policies.agePolicy.maxAge}
                    onChange={(e) => updatePolicy('agePolicy', 'maxAge', Number(e.target.value))}
                  />
                  <p className='text-xs text-muted-foreground'>Oldest allowed driver age</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Young Driver Age Threshold</Label>
                  <Input
                    type='number'
                    value={policies.agePolicy.youngDriverAge}
                    onChange={(e) => updatePolicy('agePolicy', 'youngDriverAge', Number(e.target.value))}
                  />
                  <p className='text-xs text-muted-foreground'>Surcharge applies below this age</p>
                </div>
                <div className='space-y-2'>
                  <Label>Young Driver Surcharge (AED)</Label>
                  <Input
                    type='number'
                    value={policies.agePolicy.youngDriverSurcharge}
                    onChange={(e) => updatePolicy('agePolicy', 'youngDriverSurcharge', Number(e.target.value))}
                  />
                  <p className='text-xs text-muted-foreground'>Extra daily fee for young drivers</p>
                </div>
              </div>

              <div className='pt-4 border-t space-y-4'>
                <div className='flex items-center justify-between p-4 border rounded-lg'>
                  <div>
                    <Label>Additional Drivers Allowed</Label>
                    <p className='text-sm text-muted-foreground'>
                      Allow customers to add extra drivers to the rental.
                    </p>
                  </div>
                  <Switch
                    checked={policies.additionalDriverPolicy.allowed}
                    onCheckedChange={(v) => updatePolicy('additionalDriverPolicy', 'allowed', v)}
                  />
                </div>

                {policies.additionalDriverPolicy.allowed && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label>Fee per Day (AED)</Label>
                      <Input
                        type='number'
                        value={policies.additionalDriverPolicy.feePerDay}
                        onChange={(e) => updatePolicy('additionalDriverPolicy', 'feePerDay', Number(e.target.value))}
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label>Max Additional Drivers</Label>
                      <Input
                        type='number'
                        value={policies.additionalDriverPolicy.maxAdditional}
                        onChange={(e) => updatePolicy('additionalDriverPolicy', 'maxAdditional', Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Rules */}
            <TabsContent value='rules' className='space-y-4 mt-4'>
              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <Label>Cross-Border Travel Allowed</Label>
                  <p className='text-sm text-muted-foreground'>
                    Allow vehicle to be driven across international borders.
                  </p>
                </div>
                <Switch
                  checked={policies.crossBorderPolicy.allowed}
                  onCheckedChange={(v) => updatePolicy('crossBorderPolicy', 'allowed', v)}
                />
              </div>

              {policies.crossBorderPolicy.allowed && (
                <div className='space-y-2'>
                  <Label>Cross-Border Fee (AED)</Label>
                  <Input
                    type='number'
                    value={policies.crossBorderPolicy.additionalFee}
                    onChange={(e) => updatePolicy('crossBorderPolicy', 'additionalFee', Number(e.target.value))}
                  />
                </div>
              )}

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <Label>Pets Allowed</Label>
                  <p className='text-sm text-muted-foreground'>
                    Allow pets inside the vehicle during rental.
                  </p>
                </div>
                <Switch
                  checked={policies.petPolicy.allowed}
                  onCheckedChange={(v) => updatePolicy('petPolicy', 'allowed', v)}
                />
              </div>

              {policies.petPolicy.allowed && (
                <div className='space-y-2'>
                  <Label>Pet Fee per Day (AED)</Label>
                  <Input
                    type='number'
                    value={policies.petPolicy.feePerDay}
                    onChange={(e) => updatePolicy('petPolicy', 'feePerDay', Number(e.target.value))}
                  />
                </div>
              )}

              <div className='flex items-center justify-between p-4 border rounded-lg'>
                <div>
                  <Label>Smoking Allowed</Label>
                  <p className='text-sm text-muted-foreground'>
                    Allow smoking inside the vehicle.
                  </p>
                </div>
                <Switch
                  checked={policies.smokingPolicy.allowed}
                  onCheckedChange={(v) => updatePolicy('smokingPolicy', 'allowed', v)}
                />
              </div>

              {!policies.smokingPolicy.allowed && (
                <div className='space-y-2'>
                  <Label>Cleaning Fee if Violated (AED)</Label>
                  <Input
                    type='number'
                    value={policies.smokingPolicy.cleaningFee}
                    onChange={(e) => updatePolicy('smokingPolicy', 'cleaningFee', Number(e.target.value))}
                  />
                  <p className='text-xs text-muted-foreground'>
                    Charged if customer smokes in a non-smoking vehicle.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Late Return */}
            <TabsContent value='late' className='space-y-4 mt-4'>
              <div className='space-y-2'>
                <Label>Grace Period (minutes)</Label>
                <Input
                  type='number'
                  value={policies.lateReturnPolicy.gracePeriodMinutes}
                  onChange={(e) => updatePolicy('lateReturnPolicy', 'gracePeriodMinutes', Number(e.target.value))}
                />
                <p className='text-xs text-muted-foreground'>
                  Time after scheduled return before late fees start. Gives customers flexibility for traffic or minor delays.
                </p>
              </div>

              <div className='space-y-2'>
                <Label>Hourly Late Charge (AED)</Label>
                <Input
                  type='number'
                  value={policies.lateReturnPolicy.hourlyCharge}
                  onChange={(e) => updatePolicy('lateReturnPolicy', 'hourlyCharge', Number(e.target.value))}
                />
                <p className='text-xs text-muted-foreground'>
                  Charged for each hour past the grace period. Typically a fraction of the daily rate.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className='flex justify-end gap-3 pt-6 border-t mt-6'>
            <Button type='button' variant='outline' onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className='size-4 mr-2 animate-spin' />}
              Save Policies
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
