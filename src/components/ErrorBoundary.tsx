import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

interface Props {
  children: React.ReactNode;
}

function Fallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-100 text-red-700 p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
      <p className="text-lg mb-2">Please try refreshing the page or contact support if the issue persists.</p>
      <details className="text-sm text-red-800">
        <summary>Error Details</summary>
        <pre className="whitespace-pre-wrap text-left mt-2 p-2 bg-red-200 rounded-md">{error.message}</pre>
      </details>
    </div>
  );
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
  return (
    <ReactErrorBoundary FallbackComponent={Fallback} onError={(error, info) => console.error("Caught error:", error, info)}>
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;