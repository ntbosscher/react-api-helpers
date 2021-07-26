import { Checkbox, FormControlLabel } from '@material-ui/core';
import * as React from 'react';
import { TFormValue } from './TFormValue';

export function TCheckbox<T>(props: {
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
          label={props.label}
        />
      )}
    </TFormValue>
  );
}
