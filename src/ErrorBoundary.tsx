import { Alert } from "antd";
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <Alert
      type="error"
      message="Something went wrong"
      description={error.message}
      onClose={resetErrorBoundary}
      closable
    />
  );
}

export default function ErrorBound({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
  );
}
