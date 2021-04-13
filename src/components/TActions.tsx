import { Grid } from '@material-ui/core';
import React from 'react';
import Button from '@material-ui/core/Button';

export function TActions(props: { loadingOrError: JSX.Element | null; onCancel?: () => void; confirmText?: string }) {
  return (
    <Grid container justify="flex-end" spacing={2}>
      {props.loadingOrError && <Grid item>{props.loadingOrError}</Grid>}
      {props.onCancel && (
        <Grid item>
          <Button variant="contained" onClick={props.onCancel}>
            Cancel
          </Button>
        </Grid>
      )}
      <Grid item>
        <Button variant="contained" color="primary" type="submit">
          {props.confirmText || 'Save'}
        </Button>
      </Grid>
    </Grid>
  );
}
