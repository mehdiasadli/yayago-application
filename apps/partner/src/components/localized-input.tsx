import { cn } from '@/lib/utils';
import { Locale, LOCALES } from '@yayago-app/i18n';
import { ControllerRenderProps, FieldPath, FieldValues } from 'react-hook-form';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from './ui/input-group';

const flags: Record<Locale, string> = {
  en: '🇺🇸', // united states
  az: '🇦🇿', // azerbaijan
  ru: '🇷🇺', // russia
  ar: '🇸🇦', // united arab emirates
};

interface LocalizedInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends React.ComponentPropsWithoutRef<typeof InputGroupInput> {
  containerClassName?: string;
  field: ControllerRenderProps<TFieldValues, TName>;
  placeholders?: Partial<Record<Locale, string>>;
  type?: 'input' | 'textarea';
}

export default function LocalizedInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  containerClassName,
  placeholders,
  placeholder,
  field,
  type = 'input',
  ...props
}: LocalizedInputProps<TFieldValues, TName>) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-2', containerClassName)}>
      {LOCALES.map((locale) => (
        <InputGroup key={locale}>
          {type === 'input' ? (
            <InputGroupInput
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              {...props}
              value={field.value?.[locale] || ''}
              onChange={(e) => field.onChange({ ...field.value, [locale]: e.target.value || '' })}
              placeholder={placeholders?.[locale] || placeholder}
            />
          ) : (
            <InputGroupTextarea
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              // {...props}
              value={field.value?.[locale] || ''}
              onChange={(e) => field.onChange({ ...field.value, [locale]: e.target.value || '' })}
              placeholder={placeholders?.[locale] || placeholder}
            />
          )}

          <InputGroupAddon>
            <span>{flags[locale]}</span>
          </InputGroupAddon>
        </InputGroup>
      ))}
    </div>
  );
}
