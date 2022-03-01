import clsx from 'clsx';
import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { FormObj, TFormContext } from './TForm';
import { useDebounce } from 'use-debounce';
import { styled, Typography } from '@mui/material';

const Wrapper = styled('div')<{ marginBottom: boolean }>(({ marginBottom, theme }) => ({
  marginBottom: theme.spacing(2),
}));

interface Props {
  value: string;
  onChange(value: any): void;
}

type UserForm<T> = {
  update(key: keyof T, value: any): void;
};

export type UserChangeCallback<T> = (value: any, form: UserForm<T>) => void;

function useDebounceHelper(value: any, debounce?: number) {
  if (!debounce) {
    return value;
  }

  const [db] = useDebounce(value, debounce || 0);
  return db;
}

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
  const ctx = useContext(TFormContext);
  const [value, setValue] = useState<string>();

  const debouncedValue = useDebounceHelper(value, props.debounce || 0);
  const calculatedValue = (value !== undefined ? value : ctx.value[props.objKey]) || '';

  useEffect(() => {
    return ctx.subscribeToExternalChanges(props.objKey as string, (value) => {
      setValue(value);
    });
  }, [ctx]);

  useEffect(() => {
    if (debouncedValue === undefined) return;
    ctx.inputUpdated(props.objKey as string, debouncedValue);
  }, [debouncedValue]);

  useEffect(() => {
    if (!props.onChange) return;
    if (debouncedValue === undefined) return;
    props.onChange(debouncedValue, {
      update: ctx.triggerUpdate,
    });
  }, [debouncedValue, props.onChange]);

  if (!ctx.editing) {
    return (
      <Wrapper marginBottom={!props.noBottomMargin}>
        {props.label && <Typography style={{ fontSize: '0.7rem' }}>{props.label}</Typography>}
        <Typography variant="body1">
          {(props.displayValue ? props.displayValue(calculatedValue) : calculatedValue) || '-'}
        </Typography>
      </Wrapper>
    );
  }

  return props.children({
    value: calculatedValue || '',
    onChange: setValue,
  });
}
