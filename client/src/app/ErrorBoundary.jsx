import { Component } from 'react';
import { Button } from '../components/ui/Button.jsx';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ui] unhandled error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-ink-900 px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent-400">
          Unexpected error
        </p>
        <h1 className="text-2xl">This page could not be displayed</h1>
        <p className="max-w-md text-sm leading-relaxed text-ink-400">
          Something broke while rendering. Reloading usually fixes it.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => window.location.reload()}>Reload page</Button>
          <Button variant="outline" href="/">
            Back to home
          </Button>
        </div>
      </div>
    );
  }
}
