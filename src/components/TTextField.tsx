import React from 'react';
import { TextField } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import clsx from 'clsx';
import { TFormValue } from './TFormValue';

const useStyles = makeStyles((theme) => ({
  text: {
    minWidth: 100,
    marginBottom: theme.spacing(0.5),
  },
  textWithMargin: {
    marginBottom: theme.spacing(2),
  },
}));

function autoFormat(raw: string, phone?: boolean, email?: boolean): string {
  if (phone) {
    const nOnly = raw.replace(/[^0-9x]+/g, '');
    if (nOnly.length < 7) {
      return nOnly.substring(0, 3) + ' ' + nOnly.substring(3);
    }

    const value = '(' + nOnly.substring(0, 3) + ') ' + nOnly.substring(3, 6) + ' ' + nOnly.substr(6);
    return value.split('x').join(' x');
  }

  if (email) {
    return raw.toLowerCase();
  }

  return raw;
}

export function TTextField<T>(props: {
  label?: string;
  objKey: keyof T;
  obj: T;
  placeholder?: string;
  noBottomMargin?: boolean;
  disabled?: boolean;
  phone?: boolean;
  email?: boolean;
  required?: boolean;
  password?: boolean;
  width?: string;
}) {
  const styles = useStyles();
  const { phone, email } = props;

  return (
    <TFormValue
      label={props.label}
      obj={props.obj}
      objKey={props.objKey}
      debounce={200}
      noBottomMargin={props.noBottomMargin}
    >
      {(p) => (
        <TextField
          label={props.label}
          type={props.password ? 'password' : 'text'}
          variant="outlined"
          placeholder={props.placeholder}
          InputLabelProps={{ shrink: true }}
          onBlur={(e) => {
            const src = e.target.value;
            const formatted = autoFormat(src, phone, email);

            if (formatted !== src) {
              e.target.value = formatted;
              p.onChange(formatted);
            }
          }}
          style={{
            width: props.width,
            minWidth: props.width !== undefined ? '0' : undefined,
          }}
          required={props.required}
          className={clsx({
            [styles.text]: true,
            [styles.textWithMargin]: !props.noBottomMargin,
          })}
          disabled={props.disabled}
          fullWidth={true}
          value={p.value}
          onChange={(e) => p.onChange(e.target.value)}
        />
      )}
    </TFormValue>
  );
}
