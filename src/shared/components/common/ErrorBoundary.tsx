import { Component, type ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Uncaught error in ${this.props.name || 'component'}:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-surface-container-low text-on-surface">
          <span className="material-symbols-outlined text-4xl text-error mb-2">error</span>
          <h2 className="text-lg font-bold mb-1">Đã có lỗi xảy ra</h2>
          <p className="text-sm text-on-surface-variant mb-4">
            {this.state.error?.message || 'Có lỗi không xác định xảy ra.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-primary text-on-primary rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
