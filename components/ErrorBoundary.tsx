import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  // Fix: The 'Property 'props' does not exist' error suggests a potential issue with 'this' context.
  // Using a constructor and explicitly calling super(props) is a more robust way to initialize the component,
  // which can resolve such subtle type inference problems.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-lg mx-auto">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong.</h1>
                <p className="text-gray-700 mb-6">We're sorry for the inconvenience. Please try refreshing the page. If the problem persists, please contact our support team.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                    Refresh Page
                </button>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="mt-6 text-left bg-gray-50 p-4 rounded">
                        <summary className="font-semibold cursor-pointer">Error Details</summary>
                        <pre className="mt-2 text-sm text-red-700 whitespace-pre-wrap">
                           {this.state.error.toString()}
                        </pre>
                    </details>
                )}
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
