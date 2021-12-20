import * as React from 'react';
import { CircularProgress } from '@mui/material';

interface Props {
  smaller?: boolean;
}

export class Loading extends React.Component<Props, {}> {
  render() {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <CircularProgress size={this.props.smaller ? '20px' : undefined} />
      </div>
    );
  }
}
