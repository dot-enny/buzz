import React, { Component, ReactNode } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        this.setState({ errorInfo });
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReload = (): void => {
        window.location.reload();
    };

    handleReset = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-neutral-900 rounded-2xl p-8 text-center">
                        {/* Icon */}
                        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                        </div>

                        {/* Title */}
                        <h1 className="text-xl font-semibold text-white mb-2">
                            Something went wrong
                        </h1>

                        {/* Description */}
                        <p className="text-neutral-400 mb-6">
                            We're sorry, but something unexpected happened. Please try refreshing the page.
                        </p>

                        {/* Error details (only in development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-neutral-800 rounded-lg text-left overflow-auto max-h-40">
                                <p className="text-sm text-red-400 font-mono break-all">
                                    {this.state.error.message}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="text-xs text-neutral-500 mt-2 whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional wrapper for easier use with hooks
export const withErrorBoundary = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) => {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
};

// Route Error Boundary for React Router
export const RouteErrorBoundary = () => {
    const error = useRouteError();
    
    const handleReload = () => {
        window.location.reload();
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    // Get error message
    let errorMessage = 'An unexpected error occurred';
    let errorStatus = '';
    
    if (isRouteErrorResponse(error)) {
        errorStatus = `${error.status}`;
        errorMessage = error.statusText || error.data?.message || errorMessage;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-neutral-900 rounded-2xl p-8 text-center">
                {/* Icon */}
                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                </div>

                {/* Status code if available */}
                {errorStatus && (
                    <p className="text-6xl font-bold text-red-500 mb-2">{errorStatus}</p>
                )}

                {/* Title */}
                <h1 className="text-xl font-semibold text-white mb-2">
                    Something went wrong
                </h1>

                {/* Description */}
                <p className="text-neutral-400 mb-6">
                    {errorMessage}
                </p>

                {/* Error details (only in development) */}
                {import.meta.env.DEV && error instanceof Error && error.stack && (
                    <div className="mb-6 p-4 bg-neutral-800 rounded-lg text-left overflow-auto max-h-40">
                        <pre className="text-xs text-neutral-500 whitespace-pre-wrap">
                            {error.stack}
                        </pre>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={handleGoHome}
                        className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Go Home
                    </button>
                    <button
                        onClick={handleReload}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                        Refresh Page
                    </button>
                </div>
            </div>
        </div>
    );
};
