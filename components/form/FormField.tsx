import React from 'react';
import { Controller, Control } from 'react-hook-form';

type FormFieldProps = {
  control: Control<any>;
  name: string;
  render: (args: { value: any; onChange: (v: any) => void }) => React.ReactElement;
};

export function FormField({ control, name, render }: FormFieldProps) {
  return (
    <Controller control={control} name={name} render={({ field: { value, onChange } }) => render({ value, onChange })} />
  );
}


