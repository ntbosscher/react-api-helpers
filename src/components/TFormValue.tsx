import clsx from 'clsx';
import Typography from '@material-ui/core/Typography';
import React, { useContext, useState, useEffect } from 'react';
import { TFormContext } from './TForm';
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
  initialValue: string;
  onChange(value: any): void;
}

export function TFormValue(props: {
  objKey: any;
  label?: string;
  noBottomMargin?: boolean;
  debounce?: number;
  displayValue?: (input: any) => JSX.Element;
  children: (p: Props) => JSX.Element;
}) {
  const styles = useStyles();

  const ctx = useContext(TFormContext);
  const parentValue = ctx.initialValue ? ctx.initialValue[props.objKey] : '';
  const [value, setValue] = useState<string>(parentValue);
  const [debouncedValue] = useDebounce(value, props.debounce || 0);

  useEffect(() => {
    setValue(parentValue);
  }, [parentValue]);

  useEffect(() => {
    ctx.update(props.objKey, debouncedValue);
  }, [debouncedValue]);

  if (!ctx.editing) {
    return (
      <div
        className={clsx({
          [styles.text]: true,
          [styles.textWithMargin]: !props.noBottomMargin,
        })}
      >
        {props.label && <Typography className={styles.label}>{props.label}</Typography>}
        <Typography variant="body1">
          {(props.displayValue ? props.displayValue(parentValue) : parentValue) || '-'}
        </Typography>
      </div>
    );
  }

  return props.children({
    initialValue: value || '',
    onChange: setValue,
  });
}
