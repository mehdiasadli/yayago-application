import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2Icon,
  PhoneIcon,
  MapPinIcon,
  FileTextIcon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { FindCitiesForOnboardingOutputType } from '@yayago-app/validators';
import { Badge } from '@/components/ui/badge';
import type { UploadedDocument } from './onboarding-form';

interface ReviewFormProps {
  form: UseFormReturn<any>;
  data: any;
  selectedCity: FindCitiesForOnboardingOutputType[number] | null;
  uploadedDocuments: UploadedDocument[];
}

export default function ReviewForm({ form, data, selectedCity, uploadedDocuments }: ReviewFormProps) {
  const values = form.getValues();

  const requiredDocs = selectedCity?.country.requiredDocuments.filter((d) => d.isRequired) || [];
  const allRequiredUploaded = requiredDocs.every((doc) =>
    uploadedDocuments.some((ud) => ud.documentType === doc.label)
  );

  const InfoRow = ({
    label,
    value,
    required,
  }: {
    label: string;
    value: string | null | undefined;
    required?: boolean;
  }) => (
    <div className='flex justify-between py-2'>
      <span className='text-sm text-muted-foreground'>
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}:
      </span>
      <span className={`text-sm font-medium ${!value ? 'text-muted-foreground' : ''}`}>{value || 'Not provided'}</span>
    </div>
  );

  return (
    <div className='space-y-6'>
      <div className='bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3'>
        <CheckCircle2Icon className='w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5' />
        <div>
          <p className='font-medium text-green-900 dark:text-green-100'>Almost done!</p>
          <p className='text-sm text-green-800 dark:text-green-200 mt-1'>
            Please review your information below. You can go back to any step to make changes before submitting.
          </p>
        </div>
      </div>

      {/* Validation warnings */}
      {(!selectedCity || !allRequiredUploaded) && (
        <div className='bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3'>
          <AlertCircleIcon className='w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5' />
          <div>
            <p className='font-medium text-amber-900 dark:text-amber-100'>Missing information</p>
            <ul className='text-sm text-amber-800 dark:text-amber-200 mt-1 list-disc list-inside'>
              {!selectedCity && <li>No city selected</li>}
              {!allRequiredUploaded && <li>Some required documents are not uploaded</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Organization Details */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <Building2Icon className='w-5 h-5 text-primary' />
            Organization Details
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-1'>
          <InfoRow label='Organization Name' value={values.name} required />
          <InfoRow label='URL Slug' value={values.slug} required />
          <InfoRow label='Legal Name' value={values.legalName} />
          <Separator className='my-2' />
          <div className='py-2'>
            <span className='text-sm text-muted-foreground'>Description:</span>
            <p className='text-sm mt-1 text-muted-foreground'>{values.description || <em>Not provided</em>}</p>
          </div>
        </CardContent>
      </Card>

      {/* City */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <MapPinIcon className='w-5 h-5 text-primary' />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-1'>
          <InfoRow label='Selected City' value={selectedCity?.name} required />
          <InfoRow label='Country' value={selectedCity?.country.name} />
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <PhoneIcon className='w-5 h-5 text-primary' />
            Contact Information & Address
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-1'>
          <InfoRow label='Email' value={values.email} required />
          <InfoRow label='Phone Number' value={values.phoneNumber} required />
          <InfoRow label='Website' value={values.website} />
          <Separator className='my-2' />
          <div className='py-2'>
            <span className='text-sm text-muted-foreground'>
              Address<span className='text-red-500 ml-1'>*</span>:
            </span>
            <p className='text-sm mt-1 whitespace-pre-wrap'>
              {values.address || <em className='text-muted-foreground'>Not provided</em>}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <FileTextIcon className='w-5 h-5 text-primary' />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <InfoRow label='Tax ID' value={values.taxId} required />
          <Separator className='my-2' />

          {selectedCity ? (
            <div className='space-y-3'>
              <span className='text-sm text-muted-foreground font-medium'>Uploaded Documents:</span>

              {selectedCity.country.requiredDocuments.map((doc) => {
                const uploaded = uploadedDocuments.find((ud) => ud.documentType === doc.label);
                return (
                  <div key={doc.label} className='flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50'>
                    <div className='flex items-center gap-2'>
                      {uploaded ? (
                        <CheckCircle2Icon className='w-4 h-4 text-green-500' />
                      ) : (
                        <XCircleIcon className='w-4 h-4 text-red-500' />
                      )}
                      <span className='text-sm'>{doc.label}</span>
                      <Badge variant={doc.isRequired ? 'destructive' : 'secondary'} className='text-xs'>
                        {doc.isRequired ? 'Required' : 'Optional'}
                      </Badge>
                    </div>
                    <span className='text-xs text-muted-foreground'>
                      {uploaded ? uploaded.file.name : 'Not uploaded'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>Select a city to see required documents</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
