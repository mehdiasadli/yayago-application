'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { orpc } from '@/utils/orpc';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import LocalizedInput from '@/components/localized-input';
import NumberInput from '@/components/ui/number-input';
import { ZLocalizedInput } from '@yayago-app/i18n';

interface AddFeatureDialogProps {
  children: React.ReactNode;
  planSlug: string;
}

export default function AddFeatureDialog({ children, planSlug }: AddFeatureDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<ZLocalizedInput>({ en: '', az: '', ru: '', ar: '' });
  const [description, setDescription] = useState<ZLocalizedInput>({ en: '', az: '', ru: '', ar: '' });
  const [isIncluded, setIsIncluded] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const queryClient = useQueryClient();

  const { mutate: createFeature, isPending } = useMutation(
    orpc.subscriptionPlans.createFeature.mutationOptions({
      onError(error) {
        toast.error(error.message || 'Failed to add feature');
      },
      onSuccess() {
        toast.success('Feature added successfully');
        queryClient.invalidateQueries({
          queryKey: orpc.subscriptionPlans.findOne.queryKey({ input: { slug: planSlug } }),
        });
        setOpen(false);
        resetForm();
      },
    })
  );

  function resetForm() {
    setName({ en: '', az: '', ru: '', ar: '' });
    setDescription({ en: '', az: '', ru: '', ar: '' });
    setIsIncluded(true);
    setSortOrder(0);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createFeature({
      planSlug,
      name,
      description: description.en ? description : undefined,
      isIncluded,
      sortOrder,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Add Feature</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label>Feature Name</Label>
            <LocalizedInput
              field={{ value: name, onChange: setName }}
              placeholders={{
                en: 'e.g., Priority support',
                az: 'e.g., Prioritet dəstək',
                ru: 'e.g., Приоритетная поддержка',
                ar: 'e.g., دعم الأولوية',
              }}
            />
          </div>

          <div className='space-y-2'>
            <Label>Description (Optional)</Label>
            <LocalizedInput
              field={{ value: description, onChange: setDescription }}
              placeholders={{
                en: 'e.g., Get help within 24 hours',
                az: 'e.g., 24 saat ərzində kömək alın',
                ru: 'e.g., Получите помощь в течение 24 часов',
                ar: 'e.g., احصل على المساعدة خلال 24 ساعة',
              }}
            />
          </div>

          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='space-y-0.5'>
              <Label>Included in Plan</Label>
              <p className='text-xs text-muted-foreground'>
                If disabled, feature will show as excluded (with strikethrough)
              </p>
            </div>
            <Switch checked={isIncluded} onCheckedChange={setIsIncluded} />
          </div>

          <div className='space-y-2'>
            <Label>Sort Order</Label>
            <NumberInput value={sortOrder} onChange={setSortOrder} minValue={0} placeholder='0' />
            <p className='text-xs text-muted-foreground'>Lower numbers appear first</p>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button type='button' variant='outline' onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isPending}>
              {isPending ? <Loader2Icon className='size-4 animate-spin' /> : 'Add Feature'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

