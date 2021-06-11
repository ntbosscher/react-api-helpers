import * as React from 'react';
import { FormControl, InputLabel, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    marginBottom: 4,
  },
}));

export function USelect<T>(props: {
  style?: React.CSSProperties;
  label: string;
  onChange?: (value: any) => void;
  children: JSX.Element[];
  variant?: 'filled' | 'outlined';
  value?: any;
  required?: boolean;
}) {
  const styles = useStyles();

  return (
    <FormControl className={styles.wrapper} style={props.style} variant={props.variant || 'filled'} fullWidth>
      <InputLabel
        style={props.variant === 'outlined' ? { backgroundColor: 'white' } : undefined}
        variant={props.variant || 'filled'}
        required={props.required}
        shrink={true}
      >
        {props.label}
      </InputLabel>
      <Select
        required={props.required}
        value={props.value}
        onChange={(e) => props.onChange && props.onChange(e.target.value)}
      >
        {props.children}
      </Select>
    </FormControl>
  );
}
