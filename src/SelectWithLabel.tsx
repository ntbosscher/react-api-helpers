import React, {
  CSSProperties,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';

let id = 0;

export function SelectWithLabel(
  props: PropsWithChildren<{
    style?: CSSProperties;
    value?: any;
    label: string;
    variant?: 'standard' | 'outlined' | 'filled',
    onChange?(value: string): void;
  }>
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
