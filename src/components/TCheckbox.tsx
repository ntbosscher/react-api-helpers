import * as React from 'react';
import { TFormValue } from './TFormValue';
import { Checkbox, FormControlLabel } from '@mui/material';
import { FormObj } from './TForm';

export function TCheckbox<T extends FormObj>(props: {
  obj: T;
  objKey: keyof T;
  required?: boolean;
  disabled?: boolean;
  label?: string;
  yesText?: string;
  noText?: string;
}) {
  const yesText = props.yesText || 'Yes';
  const noText = props.noText || 'No';

  return (
    <TFormValue
      obj={props.obj}
      objKey={props.objKey}
      label={props.label}
      displayValue={(v) => <>{v ? yesText : noText}</>}
    >
      {(p) => (
        <FormControlLabel
          control={
            <Checkbox
              disabled={props.disabled}
              checked={!!p.value}
              onChange={(e) => {
                p.onChange(e.target.checked);
              }}
            />
          }
          label={props.label || <>{null}</>}
        />
      )}
    </TFormValue>
  );
}
