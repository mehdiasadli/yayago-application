'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Phone,
  IdCard,
  User,
  ExternalLink,
  History,
  Loader2,
  Calendar,
  MapPin,
  Lock,
} from 'lucide-react';
import { orpc } from '@/utils/orpc';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { DriverLicenseStatus } from '@yayago-app/db/enums';
import type { FindOneUserOutputType } from '@yayago-app/validators';
import { Country, CountryDropdown } from '@/components/country-dropdown';
import { CircleFlag } from 'react-circle-flags';

interface UserVerificationSectionProps {
  user: FindOneUserOutputType;
}

// Approval form schema
const approvalFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  licenseCountry: z.string().min(2, 'Country is required'),
  licenseCountryCode: z.string().length(2, 'Country code is required'),
  licenseExpiry: z.string().min(1, 'Expiry date is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
});

type ApprovalFormValues = z.infer<typeof approvalFormSchema>;

function getStatusBadge(status: DriverLicenseStatus) {
  switch (status) {
    case 'APPROVED':
      return (
        <Badge variant='success' className='gap-1'>
          <CheckCircle className='size-3' />
          Verified
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge variant='warning' className='gap-1'>
          <Clock className='size-3' />
          Pending Review
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant='destructive' className='gap-1'>
          <XCircle className='size-3' />
          Rejected
        </Badge>
      );
    case 'EXPIRED':
      return (
        <Badge variant='secondary' className='gap-1'>
          <AlertCircle className='size-3' />
          Expired
        </Badge>
      );
    default:
      return (
        <Badge variant='outline' className='gap-1'>
          <Shield className='size-3' />
          Not Submitted
        </Badge>
      );
  }
}

function formatGender(gender: string | null): string {
  if (!gender) return 'Not set';
  return gender.charAt(0).toUpperCase() + gender.slice(1).replace(/_/g, ' ');
}

export default function UserVerificationSection({ user }: UserVerificationSectionProps) {
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [attemptToReview, setAttemptToReview] = useState<string | null>(null);

  // Approval form
  const approvalForm = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      licenseNumber: '',
      licenseCountry: '',
      licenseCountryCode: '',
      licenseExpiry: '',
      gender: undefined,
    },
  });

  // Fetch verification history
  const { data: history, isLoading: isHistoryLoading } = useQuery({
    ...orpc.users.getUserVerificationHistory.queryOptions({
      input: { userId: user.id },
    }),
    enabled: user.driverLicenseVerificationStatus !== 'NOT_SUBMITTED',
  });

  // Fetch secure document URLs (admin can view any user's documents)
  const {
    data: documentUrls,
    isLoading: isLoadingDocuments,
    refetch: refetchDocuments,
  } = useQuery({
    ...orpc.users.getVerificationDocumentUrls.queryOptions({
      input: { userId: user.id },
    }),
    enabled: user.driverLicenseVerificationStatus !== 'NOT_SUBMITTED',
    staleTime: 4 * 60 * 1000, // 4 minutes (refresh before 5-minute expiration)
  });

  // Review mutation
  const reviewMutation = useMutation(
    orpc.users.reviewVerification.mutationOptions({
      onSuccess: () => {
        toast.success('Verification reviewed successfully');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        setShowRejectDialog(false);
        setShowApproveDialog(false);
        setRejectionReason('');
        setAttemptToReview(null);
        approvalForm.reset();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to review verification');
      },
    })
  );

  const handleApprove = (values: ApprovalFormValues) => {
    if (!attemptToReview) return;

    reviewMutation.mutate({
      attemptId: attemptToReview,
      status: 'APPROVED',
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: new Date(values.dateOfBirth),
      licenseNumber: values.licenseNumber,
      licenseCountry: values.licenseCountry,
      licenseCountryCode: values.licenseCountryCode,
      licenseExpiry: new Date(values.licenseExpiry),
      gender: values.gender,
    });
  };

  const handleReject = () => {
    if (!attemptToReview || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    reviewMutation.mutate({
      attemptId: attemptToReview,
      status: 'REJECTED',
      rejectionReason: rejectionReason.trim(),
    });
  };

  const openApproveDialog = (attemptId: string) => {
    setAttemptToReview(attemptId);
    approvalForm.reset();
    setShowApproveDialog(true);
  };

  const openRejectDialog = (attemptId: string) => {
    setAttemptToReview(attemptId);
    setShowRejectDialog(true);
  };

  const handleCountryChange = (country: Country) => {
    approvalForm.setValue('licenseCountry', country.name);
    approvalForm.setValue('licenseCountryCode', country.alpha2);
  };

  // Get latest pending attempt if any
  const latestPendingAttempt = history?.find((a) => a.status === 'PENDING');

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Shield className='size-5' />
              Identity Verification
            </div>
            {getStatusBadge(user.driverLicenseVerificationStatus)}
          </CardTitle>
          {user.driverLicenseVerificationStatus === 'REJECTED' && user.driverLicenseRejectionReason && (
            <CardDescription className='text-destructive'>
              Rejection reason: {user.driverLicenseRejectionReason}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Current Verification Status */}
          {user.driverLicenseVerificationStatus === 'NOT_SUBMITTED' ? (
            <div className='text-center py-8 text-muted-foreground'>
              <Shield className='size-12 mx-auto mb-4 opacity-50' />
              <p>User has not submitted verification documents</p>
            </div>
          ) : (
            <>
              {/* Verified User Data (shown when APPROVED) */}
              {user.driverLicenseVerificationStatus === 'APPROVED' && (
                <div className='space-y-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900'>
                  <h4 className='font-medium flex items-center gap-2 text-green-800 dark:text-green-400'>
                    <CheckCircle className='size-4' />
                    Verified Information
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                    {/* Personal Info */}
                    <div className='space-y-3'>
                      <div className='flex items-center gap-2'>
                        <User className='size-4 text-muted-foreground' />
                        <span className='text-muted-foreground'>Legal Name:</span>
                        <span className='font-medium'>
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : 'Not set'}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Calendar className='size-4 text-muted-foreground' />
                        <span className='text-muted-foreground'>Date of Birth:</span>
                        <span className='font-medium'>
                          {user.dateOfBirth ? format(user.dateOfBirth, 'PPP') : 'Not set'}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <User className='size-4 text-muted-foreground' />
                        <span className='text-muted-foreground'>Gender:</span>
                        <span className='font-medium'>{formatGender(user.gender)}</span>
                      </div>
                    </div>
                    {/* License Info */}
                    <div className='space-y-3'>
                      <div className='flex items-center gap-2'>
                        <IdCard className='size-4 text-muted-foreground' />
                        <span className='text-muted-foreground'>License Number:</span>
                        <span className='font-medium font-mono'>
                          {user.driverLicenseNumber || 'Not set'}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <MapPin className='size-4 text-muted-foreground' />
                        <span className='text-muted-foreground'>Issuing Country:</span>
                        <span className='font-medium flex items-center gap-1.5'>
                          {user.driverLicenseCountryCode && (
                            <CircleFlag
                              countryCode={user.driverLicenseCountryCode.toLowerCase()}
                              height={16}
                            />
                          )}
                          {user.driverLicenseCountry || 'Not set'}
                          {user.driverLicenseCountryCode && (
                            <span className='text-muted-foreground'>
                              ({user.driverLicenseCountryCode})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Calendar className='size-4 text-muted-foreground' />
                        <span className='text-muted-foreground'>Expiry Date:</span>
                        <span className='font-medium'>
                          {user.driverLicenseExpiry
                            ? format(user.driverLicenseExpiry, 'PPP')
                            : 'Not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submitted Documents */}
              {user.verificationSubmittedAt && (
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Clock className='size-4' />
                  Submitted on {format(user.verificationSubmittedAt, 'PPP')}
                </div>
              )}

              {/* Document Preview Grid (Secure Access) */}
              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Lock className='size-4' />
                  <span>Documents are securely accessed with time-limited URLs</span>
                </div>
                {isLoadingDocuments ? (
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className='aspect-video rounded-lg' />
                    ))}
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {/* License Front */}
                    <div className='space-y-2'>
                      <Label className='flex items-center gap-2'>
                        <IdCard className='size-4' />
                        License Front
                      </Label>
                      {documentUrls?.licenseFrontUrl ? (
                        <div
                          className='relative aspect-video rounded-lg overflow-hidden border bg-muted cursor-pointer hover:opacity-90 transition-opacity'
                          onClick={() => {
                            setSelectedImage(documentUrls.licenseFrontUrl!);
                            refetchDocuments(); // Refresh URLs when viewing
                          }}
                        >
                          <img
                            src={documentUrls.licenseFrontUrl}
                            alt='License Front'
                            className='w-full h-full object-cover'
                          />
                          <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity'>
                            <Eye className='size-6 text-white' />
                          </div>
                        </div>
                      ) : (
                        <div className='aspect-video rounded-lg border bg-muted flex items-center justify-center text-muted-foreground'>
                          Not available
                        </div>
                      )}
                    </div>

                    {/* License Back */}
                    <div className='space-y-2'>
                      <Label className='flex items-center gap-2'>
                        <IdCard className='size-4' />
                        License Back
                      </Label>
                      {documentUrls?.licenseBackUrl ? (
                        <div
                          className='relative aspect-video rounded-lg overflow-hidden border bg-muted cursor-pointer hover:opacity-90 transition-opacity'
                          onClick={() => {
                            setSelectedImage(documentUrls.licenseBackUrl!);
                            refetchDocuments();
                          }}
                        >
                          <img
                            src={documentUrls.licenseBackUrl}
                            alt='License Back'
                            className='w-full h-full object-cover'
                          />
                          <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity'>
                            <Eye className='size-6 text-white' />
                          </div>
                        </div>
                      ) : (
                        <div className='aspect-video rounded-lg border bg-muted flex items-center justify-center text-muted-foreground'>
                          Not available
                        </div>
                      )}
                    </div>

                    {/* Selfie */}
                    <div className='space-y-2'>
                      <Label className='flex items-center gap-2'>
                        <User className='size-4' />
                        Selfie
                      </Label>
                      {documentUrls?.selfieUrl ? (
                        <div
                          className='relative aspect-video rounded-lg overflow-hidden border bg-muted cursor-pointer hover:opacity-90 transition-opacity'
                          onClick={() => {
                            setSelectedImage(documentUrls.selfieUrl!);
                            refetchDocuments();
                          }}
                        >
                          <img src={documentUrls.selfieUrl} alt='Selfie' className='w-full h-full object-cover' />
                          <div className='absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity'>
                            <Eye className='size-6 text-white' />
                          </div>
                        </div>
                      ) : (
                        <div className='aspect-video rounded-lg border bg-muted flex items-center justify-center text-muted-foreground'>
                          Not available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              {user.phoneNumber && (
                <div className='flex items-center gap-2 p-3 rounded-lg bg-muted/50'>
                  <Phone className='size-4 text-muted-foreground' />
                  <span className='font-medium'>{user.phoneNumber}</span>
                  <Badge variant={user.phoneNumberVerified ? 'success' : 'warning'} className='ml-auto'>
                    {user.phoneNumberVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              )}

              {/* Review Actions for Pending Verification */}
              {latestPendingAttempt && (
                <div className='flex gap-2 pt-4 border-t'>
                  <Button
                    variant='default'
                    className='flex-1 bg-green-600 hover:bg-green-700'
                    onClick={() => openApproveDialog(latestPendingAttempt.id)}
                    disabled={reviewMutation.isPending}
                  >
                    <ThumbsUp className='size-4 mr-2' />
                    Approve Verification
                  </Button>
                  <Button
                    variant='destructive'
                    className='flex-1'
                    onClick={() => openRejectDialog(latestPendingAttempt.id)}
                    disabled={reviewMutation.isPending}
                  >
                    <ThumbsDown className='size-4 mr-2' />
                    Reject Verification
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Verification History */}
          {isHistoryLoading ? (
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-20 w-full' />
            </div>
          ) : history && history.length > 0 ? (
            <div className='pt-4 border-t'>
              <h4 className='flex items-center gap-2 font-medium mb-3'>
                <History className='size-4' />
                Verification History
              </h4>
              <div className='space-y-3'>
                {history.map((attempt) => (
                  <div
                    key={attempt.id}
                    className='flex items-start justify-between p-3 rounded-lg bg-muted/50 text-sm'
                  >
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        {getStatusBadge(attempt.status)}
                        <span className='text-muted-foreground'>{format(attempt.createdAt, 'PPP')}</span>
                      </div>
                      {attempt.rejectionReason && (
                        <p className='text-destructive text-xs'>Reason: {attempt.rejectionReason}</p>
                      )}
                      {attempt.reviewedAt && (
                        <p className='text-muted-foreground text-xs'>
                          Reviewed on {format(attempt.reviewedAt, 'PPP')}
                        </p>
                      )}
                    </div>
                    {attempt.status === 'PENDING' && (
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-green-600'
                          onClick={() => openApproveDialog(attempt.id)}
                          disabled={reviewMutation.isPending}
                        >
                          <ThumbsUp className='size-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='text-destructive'
                          onClick={() => openRejectDialog(attempt.id)}
                          disabled={reviewMutation.isPending}
                        >
                          <ThumbsDown className='size-4' />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className='relative aspect-video'>
              <img src={selectedImage} alt='Document' className='w-full h-full object-contain' />
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' asChild>
              <a href={selectedImage || ''} target='_blank' rel='noopener noreferrer'>
                <ExternalLink className='size-4 mr-2' />
                Open in New Tab
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog with Form */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Approve Verification</DialogTitle>
            <DialogDescription>
              Enter the information extracted from the user&apos;s documents. This data will be saved to their profile.
            </DialogDescription>
          </DialogHeader>
          <Form {...approvalForm}>
            <form onSubmit={approvalForm.handleSubmit(handleApprove)} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={approvalForm.control}
                  name='firstName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='John' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={approvalForm.control}
                  name='lastName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder='Doe' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={approvalForm.control}
                  name='dateOfBirth'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input type='date' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={approvalForm.control}
                  name='gender'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select gender' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='male'>Male</SelectItem>
                          <SelectItem value='female'>Female</SelectItem>
                          <SelectItem value='other'>Other</SelectItem>
                          <SelectItem value='prefer_not_to_say'>Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='border-t pt-4'>
                <h4 className='font-medium mb-3 flex items-center gap-2'>
                  <IdCard className='size-4' />
                  Driver License Information
                </h4>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={approvalForm.control}
                    name='licenseNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Number *</FormLabel>
                        <FormControl>
                          <Input placeholder='DL123456789' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={approvalForm.control}
                    name='licenseCountry'
                    render={() => (
                      <FormItem>
                        <FormLabel>Issuing Country *</FormLabel>
                        <FormControl>
                          <CountryDropdown
                            onChange={handleCountryChange}
                            placeholder='Select country'
                          />
                        </FormControl>
                        <FormMessage />
                        {approvalForm.watch('licenseCountryCode') && (
                          <p className='text-xs text-muted-foreground'>
                            Code: {approvalForm.watch('licenseCountryCode')}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                <div className='mt-4'>
                  <FormField
                    control={approvalForm.control}
                    name='licenseExpiry'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Expiry Date *</FormLabel>
                        <FormControl>
                          <Input type='date' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter className='pt-4 border-t'>
                <Button type='button' variant='outline' onClick={() => setShowApproveDialog(false)}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='bg-green-600 hover:bg-green-700'
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending ? (
                    <>
                      <Loader2 className='size-4 mr-2 animate-spin' />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className='size-4 mr-2' />
                      Approve & Save
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this verification. This will be shown to the user.
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='rejection-reason'>Rejection Reason</Label>
              <Textarea
                id='rejection-reason'
                placeholder="e.g., Photos are blurry, documents are expired, selfie doesn't match..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleReject}
              disabled={!rejectionReason.trim() || reviewMutation.isPending}
            >
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className='size-4 mr-2 animate-spin' />
                  Rejecting...
                </>
              ) : (
                'Reject Verification'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
