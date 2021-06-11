import * as React from 'react';
import { FormControl, InputLabel, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { TFormValue, UserChangeCallback } from './TFormValue';
import { first } from '../ArrayUtils';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    marginBottom: 4,
  },
}));

export function TSelect<T>(props: {
  style?: React.CSSProperties;
  label: string;
  obj: T;
  objKey: keyof T;
  onChange?: UserChangeCallback<T>;
  children: JSX.Element[];
  variant?: 'filled' | 'outlined';
  required?: boolean;
  displayValue?: (value: any) => JSX.Element;
}) {
  const styles = useStyles();

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
