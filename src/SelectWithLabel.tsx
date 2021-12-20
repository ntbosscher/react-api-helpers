import React, { CSSProperties, PropsWithChildren, useEffect, useState } from 'react';
import { FormControl, InputLabel, Select } from '@mui/material';

let id = 0;

export function SelectWithLabel(
  props: PropsWithChildren<{
    style?: CSSProperties;
    value?: any;
    label: string;
    variant?: 'standard' | 'outlined' | 'filled';
    onChange?(value: string): void;
  }>,
) {
  const [labelId, setLabelId] = useState<string>();
  useEffect(() => {
    id++;
    setLabelId('select-with-label-' + id);
  }, []);

  return (
    <FormControl variant={props.variant} fullWidth style={props.style}>
      <InputLabel id={labelId} shrink={true}>
        {props.label}
      </InputLabel>
      <Select
        labelId={labelId}
        label={props.label}
        fullWidth
        value={props.value}
        onChange={(e) => props.onChange?.(e.target.value as string)}
      >
        {props.children}
      </Select>
    </FormControl>
  );
}
