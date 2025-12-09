import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You could log to an external service here
    this.setState({ error, info });
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ padding: 24, fontFamily: 'Inter, system-ui, Arial', color: '#111' }}>
        <h2 style={{ marginTop: 0 }}>Something went wrong rendering the app</h2>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #eee' }}>
          {String(this.state.error && this.state.error.toString())}
        </pre>
        <details style={{ marginTop: 12 }}>
          <summary>Technical details</summary>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.info?.componentStack}</pre>
        </details>
      </div>
    );
  }
}
