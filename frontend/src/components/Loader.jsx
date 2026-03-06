function Loader({ label = 'Loading' }) {
  return (
    <div className="loader-wrap card" role="status" aria-live="polite">
      <svg className="loader-svg" viewBox="0 0 64 64" aria-hidden="true">
        <circle className="loader-ring-outer" cx="32" cy="32" r="26" />
        <circle className="loader-ring-inner" cx="32" cy="32" r="16" />
        <polygon className="loader-core" points="32,14 44,32 32,50 20,32" />
        <rect className="loader-scan" x="30" y="8" width="4" height="10" rx="2" />
      </svg>
      <p className="loader-label">{label}</p>
    </div>
  );
}

export default Loader;
