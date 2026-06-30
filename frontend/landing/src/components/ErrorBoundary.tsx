import { Component } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC', p: 3 }}>
          <Box sx={{ textAlign: 'center', maxWidth: 480 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              Algo salió mal al cargar la página.
            </Alert>
            <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
              {this.state.error?.message}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}
