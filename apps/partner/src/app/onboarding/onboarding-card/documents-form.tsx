import FormInput from '@/components/form-input';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { FileTextIcon, UploadIcon, CheckCircle2Icon, XIcon, AlertCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FindCitiesForOnboardingOutputType } from '@yayago-app/validators';
import type { UploadedDocument } from './onboarding-form';

interface DocumentsFormProps {
  form: UseFormReturn<any>;
  selectedCity: FindCitiesForOnboardingOutputType[number] | null;
  uploadedDocuments: UploadedDocument[];
  setUploadedDocuments: React.Dispatch<React.SetStateAction<UploadedDocument[]>>;
}

export default function DocumentsForm({
  form,
  selectedCity,
  uploadedDocuments,
  setUploadedDocuments,
}: DocumentsFormProps) {
  const handleFileUpload = (documentType: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setUploadedDocuments((prev) => {
        const existing = prev.findIndex((d) => d.documentType === documentType);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { documentType, file };
          return updated;
        }
        return [...prev, { documentType, file }];
      });
    }
  };

  const removeDocument = (documentType: string) => {
    setUploadedDocuments((prev) => prev.filter((d) => d.documentType !== documentType));
  };

  const getUploadedFile = (documentType: string) => {
    return uploadedDocuments.find((d) => d.documentType === documentType);
  };

  if (!selectedCity) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <AlertCircleIcon className='w-12 h-12 text-muted-foreground mb-4' />
        <h3 className='text-lg font-semibold mb-2'>City Required</h3>
        <p className='text-muted-foreground max-w-md'>
          Please go to the &quot;Location &amp; City&quot; step and select a city first. The required documents depend
          on your selected country.
        </p>
      </div>
    );
  }

  const requiredDocuments = selectedCity.country.requiredDocuments.filter((d) => d.isRequired);
  const optionalDocuments = selectedCity.country.requiredDocuments.filter((d) => !d.isRequired);

  return (
    <div className='space-y-6'>
      <FormInput
        control={form.control}
        name='taxId'
        label='Tax ID / Business Registration Number'
        description='Your official business tax identification number (VOEN/TRN)'
        render={(field) => (
          <Input id={field.name} {...field} placeholder='e.g., 12-3456789' className='max-w-md' required />
        )}
      />

      <div className='space-y-4'>
        <div>
          <Label className='text-base font-semibold mb-1 block'>Required Documents</Label>
          <p className='text-sm text-muted-foreground mb-4'>
            Please upload the following documents for verification. Accepted formats: PDF, JPG, PNG (max 5MB each)
          </p>
        </div>

        {requiredDocuments.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground border rounded-lg'>
            No required documents for {selectedCity.country.name}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {requiredDocuments.map((doc) => {
              const uploaded = getUploadedFile(doc.label);
              return (
                <div
                  key={doc.label}
                  className={`relative border-2 rounded-lg p-6 transition-colors ${
                    uploaded
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : 'border-dashed hover:border-primary'
                  }`}
                >
                  <div className='flex flex-col items-center text-center'>
                    {uploaded ? (
                      <>
                        <CheckCircle2Icon className='w-10 h-10 text-green-500 mb-3' />
                        <p className='text-sm font-medium text-green-700 dark:text-green-300 mb-1'>{doc.label}</p>
                        <p className='text-xs text-muted-foreground mb-3 truncate max-w-full'>{uploaded.file.name}</p>
                        <div className='flex gap-2'>
                          <Label htmlFor={doc.label} className='cursor-pointer'>
                            <Button variant='outline' size='sm' asChild>
                              <span>Change</span>
                            </Button>
                          </Label>
                          <Button variant='ghost' size='sm' onClick={() => removeDocument(doc.label)}>
                            <XIcon className='w-4 h-4' />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <FileTextIcon className='w-10 h-10 text-muted-foreground mb-3' />
                        <p className='text-sm font-medium mb-1'>{doc.label}</p>
                        <p className='text-xs text-muted-foreground mb-3 line-clamp-2'>{doc.description}</p>
                        <Label htmlFor={doc.label} className='cursor-pointer'>
                          <Button variant='outline' size='sm' asChild>
                            <span>
                              <UploadIcon className='w-4 h-4 mr-2' />
                              Upload
                            </span>
                          </Button>
                        </Label>
                        <span className='text-xs text-red-500 mt-2'>Required</span>
                      </>
                    )}
                    <Input
                      id={doc.label}
                      type='file'
                      accept='.pdf,.jpg,.jpeg,.png'
                      className='hidden'
                      onChange={handleFileUpload(doc.label)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {optionalDocuments.length > 0 && (
          <>
            <div className='mt-6'>
              <Label className='text-base font-semibold mb-1 block'>Optional Documents</Label>
              <p className='text-sm text-muted-foreground mb-4'>
                These documents are optional but may help speed up the verification process.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {optionalDocuments.map((doc) => {
                const uploaded = getUploadedFile(doc.label);
                return (
                  <div
                    key={doc.label}
                    className={`relative border-2 rounded-lg p-6 transition-colors ${
                      uploaded
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-dashed hover:border-primary'
                    }`}
                  >
                    <div className='flex flex-col items-center text-center'>
                      {uploaded ? (
                        <>
                          <CheckCircle2Icon className='w-10 h-10 text-green-500 mb-3' />
                          <p className='text-sm font-medium text-green-700 dark:text-green-300 mb-1'>{doc.label}</p>
                          <p className='text-xs text-muted-foreground mb-3 truncate max-w-full'>{uploaded.file.name}</p>
                          <div className='flex gap-2'>
                            <Label htmlFor={`optional-${doc.label}`} className='cursor-pointer'>
                              <Button variant='outline' size='sm' asChild>
                                <span>Change</span>
                              </Button>
                            </Label>
                            <Button variant='ghost' size='sm' onClick={() => removeDocument(doc.label)}>
                              <XIcon className='w-4 h-4' />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <FileTextIcon className='w-10 h-10 text-muted-foreground mb-3' />
                          <p className='text-sm font-medium mb-1'>{doc.label}</p>
                          <p className='text-xs text-muted-foreground mb-3 line-clamp-2'>{doc.description}</p>
                          <Label htmlFor={`optional-${doc.label}`} className='cursor-pointer'>
                            <Button variant='outline' size='sm' asChild>
                              <span>
                                <UploadIcon className='w-4 h-4 mr-2' />
                                Upload
                              </span>
                            </Button>
                          </Label>
                          <span className='text-xs text-muted-foreground mt-2'>Optional</span>
                        </>
                      )}
                      <Input
                        id={`optional-${doc.label}`}
                        type='file'
                        accept='.pdf,.jpg,.jpeg,.png'
                        className='hidden'
                        onChange={handleFileUpload(doc.label)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className='bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
        <p className='text-sm text-blue-900 dark:text-blue-100'>
          <strong>Document requirements:</strong> All documents must be clear, legible, and valid. Business licenses
          must be current and not expired. We'll verify these documents during our review process.
        </p>
      </div>
    </div>
  );
}
