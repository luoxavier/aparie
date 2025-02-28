
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You could log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We apologize for the inconvenience. The application has encountered an unexpected error.
            </p>
            <details className="mb-6">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 mb-2">
                Technical Details
              </summary>
              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto">
                {this.state.error?.toString() || "Unknown error"}
              </pre>
            </details>
            <div className="flex space-x-4">
              <Button onClick={this.handleReset} className="w-full">
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
