import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { FormObj, TFormContext } from './TForm';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useDebounce } from 'use-debounce';

const useStyles = makeStyles((theme) => ({
  text: {},
  textWithMargin: {
    marginBottom: theme.spacing(2),
  },
  label: {
    fontSize: '0.7rem',
  },
}));

interface Props {
  value: string;
  onChange(value: any): void;
}

type UserForm<T> = {
  update(key: keyof T, value: any): void;
};

export type UserChangeCallback<T> = (value: any, form: UserForm<T>) => void;

export function TFormValue<T extends FormObj>(props: {
  obj: T; // just for type-inferencing
  objKey: keyof T;
  label?: string;
  noBottomMargin?: boolean;
  debounce?: number;
  onChange?: UserChangeCallback<T>;
  displayValue?: (input: any) => JSX.Element;
  children: (p: Props) => JSX.Element;
}) {
  const styles = useStyles();

  const ctx = useContext(TFormContext);
  const [value, setValue] = useState<string>(ctx.value[props.objKey]);
  const [debouncedValue] = useDebounce(value, props.debounce || 0);

  useEffect(() => {
    return ctx.subscribeToChanges(props.objKey as string, (value) => {
      setValue(value);
    });
  }, [ctx]);

  useEffect(() => {
    ctx.inputUpdated(props.objKey as string, debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    if (!props.onChange) return;
    props.onChange(debouncedValue, {
      update: ctx.triggerUpdate,
    });
  }, [debouncedValue, props.onChange]);

  if (!ctx.editing) {
    return (
      <div
        className={clsx({
          [styles.text]: true,
          [styles.textWithMargin]: !props.noBottomMargin,
        })}
      >
        {props.label && <Typography className={styles.label}>{props.label}</Typography>}
        <Typography variant="body1">{(props.displayValue ? props.displayValue(value) : value) || '-'}</Typography>
      </div>
    );
  }

  return props.children({
    value: value || '',
    onChange: setValue,
  });
}
