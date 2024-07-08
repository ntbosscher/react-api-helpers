import * as React from 'react';
import { TFormValue, UserChangeCallback } from './TFormValue';
import { first } from '../ArrayUtils';
import { FormControl, InputLabel, Select } from '@mui/material';
import { FormObj } from './TForm';

export function TSelect<T extends FormObj>(props: {
  style?: React.CSSProperties;
  label: string;
  obj: T;
  objKey: keyof T;
  onChange?: UserChangeCallback<T>;
  children: JSX.Element[];
  disabled?: boolean;
  variant?: 'filled' | 'outlined';
  required?: boolean;
  displayValue?: (value: any) => JSX.Element;
}) {
  return (
    <TFormValue
      obj={props.obj}
      objKey={props.objKey}
      label={props.label}
      onChange={props.onChange}
      displayValue={(e) => {
        if (props.displayValue) {
          return props.displayValue(e);
        }

        const match = first(props.children, (c) => c.props.value === e);
        if (!match) return '';
        return match.props.children;
      }}
    >
      {(p) => (
        <FormControl
          style={Object.assign({ marginBottom: 4 }, props.style)}
          variant={props.variant || 'filled'}
          fullWidth
        >
          <InputLabel
            style={props.variant === 'outlined' ? { backgroundColor: 'white' } : undefined}
            variant={props.variant || 'filled'}
            required={props.required}
            shrink={true}
          >
            {props.label}
          </InputLabel>
          <Select
            disabled={props.disabled}
            required={props.required}
            value={p.value}
            onChange={(event) => {
              p.onChange(event.target.value as any);
            }}
          >
            {props.children}
          </Select>
        </FormControl>
      )}
    </TFormValue>
  );
}
