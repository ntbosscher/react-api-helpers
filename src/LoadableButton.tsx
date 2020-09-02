import { Button, ButtonProps } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';

export function LoadableButton(props: ButtonProps & { loading: boolean }) {
  let { children, loading, disabled, ...other } = props;
  disabled = disabled || loading;

  return (
    <Button disabled={disabled} {...other}>
      {loading ? (
        <div style={{ top: 3, position: 'relative' }}>
          <CircularProgress size={30} color="inherit" />
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
