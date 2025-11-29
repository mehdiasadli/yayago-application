import {
  Controller,
  type ControllerFieldState,
  type ControllerProps,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseFormStateReturn,
} from 'react-hook-form';
import { Field, FieldDescription, FieldError, FieldLabel } from './ui/field';

interface FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> extends Pick<ControllerProps<TFieldValues, TName, TTransformedValues>, 'control' | 'defaultValue' | 'name'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  labelProps?: Omit<React.ComponentProps<typeof FieldLabel>, 'className' | 'children'>;
  descriptionProps?: Omit<React.ComponentProps<typeof FieldDescription>, 'className' | 'children'>;
  errorProps?: Omit<React.ComponentProps<typeof FieldError>, 'className' | 'errors'>;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
  containerClassName?: string;
  containerProps?: Omit<React.ComponentProps<typeof Field>, 'className' | 'children'>;
  render: (
    field: ControllerRenderProps<TFieldValues, TName>,
    fieldState: ControllerFieldState,
    formState: UseFormStateReturn<TFieldValues>
  ) => React.ReactNode;
}

export default function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  label,
  description,
  labelProps,
  descriptionProps,
  errorProps,
  labelClassName,
  descriptionClassName,
  errorClassName,
  containerClassName,
  containerProps,
  render,
  ...props
}: FormInputProps<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      {...props}
      render={({ field, fieldState, formState }) => {
        return (
          <Field className={containerClassName} {...containerProps}>
            {label && typeof label === 'string' && (
              <FieldLabel htmlFor={field.name} className={labelClassName} {...labelProps}>
                {label}
              </FieldLabel>
            )}

            {description && typeof description === 'string' && (
              <FieldDescription className={descriptionClassName} {...descriptionProps}>
                {description}
              </FieldDescription>
            )}

            {render(field, fieldState, formState)}

            {formState.errors[props.name]?.message && (
              <FieldError className={errorClassName} {...errorProps}>
                {formState.errors[props.name]?.message as React.ReactNode}
              </FieldError>
            )}
          </Field>
        );
      }}
    />
  );
}
