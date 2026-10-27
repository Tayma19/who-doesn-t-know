import "../style/ErrorBanner.css";

interface ErrorBannerProps {
  message: string | null | undefined;
  onClose?: () => void;
}

export default function ErrorBanner({ message, onClose }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <div className="error-banner" role="alert">
      <span className="error-banner__text">{message}</span>
      {onClose && (
        <button
          type="button"
          className="error-banner__close"
          onClick={onClose}
          aria-label="Dismiss message"
        >
          ×
        </button>
      )}
    </div>
  );
}