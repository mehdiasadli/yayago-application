import { Input } from './input';

interface SlugInputProps extends React.ComponentProps<typeof Input> {}

export default function SlugInput({ ...props }: SlugInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!value) {
      props.onChange?.(e);
      return;
    }

    // normalize the value
    const normalizedValue = value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');

    props.onChange?.({
      ...e,
      target: {
        ...e.target,
        value: normalizedValue,
      },
    });
  };

  return <Input {...props} onChange={handleChange} />;
}
