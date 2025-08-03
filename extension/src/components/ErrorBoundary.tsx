import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-80 min-h-96 bg-gray-900 p-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-red-400 mb-4">🚨 Something went wrong</h2>
            <div className="bg-gray-800 p-4 rounded-lg border border-red-700 text-left">
              <p className="text-sm text-red-300 mb-2">
                <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
              </p>
              <details className="text-xs text-gray-400">
                <summary className="cursor-pointer">Technical details</summary>
                <pre className="mt-2 overflow-auto">{this.state.error?.stack}</pre>
              </details>
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
