import { cn } from '@/lib/utils';
import { Locale, LOCALES, ZLocalizedInput } from '@yayago-app/i18n';
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group';

const flags: Record<Locale, string> = {
  en: '🇺🇸', // united states
  az: '🇦🇿', // azerbaijan
  ru: '🇷🇺', // russia
  ar: '🇸🇦', // united arab emirates
};

// Flexible field type that works with both react-hook-form and standalone state
type LocalizedField = {
  value: ZLocalizedInput | Record<string, string | undefined> | unknown;
  onChange: (value: ZLocalizedInput) => void;
};

interface LocalizedInputProps extends React.ComponentPropsWithoutRef<typeof InputGroupInput> {
  containerClassName?: string;
  field: LocalizedField;
  placeholders?: Partial<Record<Locale, string>>;
}

export default function LocalizedInput({
  containerClassName,
  placeholders,
  placeholder,
  field,
  ...props
}: LocalizedInputProps) {
  // Safely cast value to localized object type
  const value = (field.value || {}) as Record<string, string | undefined>;

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-2', containerClassName)}>
      {LOCALES.map((locale) => (
        <InputGroup key={locale}>
          <InputGroupInput
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            {...props}
            value={value[locale] || ''}
            onChange={(e) => {
              const newValue: ZLocalizedInput = {
                en: value.en || '',
                az: value.az,
                ru: value.ru,
                ar: value.ar,
                [locale]: e.target.value || '',
              };
              field.onChange(newValue);
            }}
            placeholder={placeholders?.[locale] || placeholder}
          />
          <InputGroupAddon>
            <span>{flags[locale]}</span>
          </InputGroupAddon>
        </InputGroup>
      ))}
    </div>
  );
}
