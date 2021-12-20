import * as React from 'react';
import { FormControl, InputLabel, Select, SelectProps, styled } from '@mui/material';


const StyledFormControl = styled(FormControl)(() => ({
  marginBottom: 4,
}))

export function USelect<T>(
  props: {
    style?: React.CSSProperties;
    label: string;
    onChange?: (value: any) => void;
    children: JSX.Element[];
  } & Omit<SelectProps, 'onChange'>,
) {

  return (
    <StyledFormControl style={props.style} variant={props.variant || 'filled'} fullWidth>
      <InputLabel
        style={props.variant === 'outlined' ? { backgroundColor: 'white' } : undefined}
        variant={props.variant || 'filled'}
        required={props.required}
        shrink={true}
      >
        {props.label}
      </InputLabel>
      <Select {...props} onChange={(e) => props.onChange && props.onChange(e.target.value)}>
        {props.children}
      </Select>
    </StyledFormControl>
  );
}
