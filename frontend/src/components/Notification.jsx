function Notification({ type = 'info', message }) {
  if (!message) return null;

  return (
    <div className={`notice notice-${type}`} role="alert">
      <span className="notice-dot" />
      <p>{message}</p>
    </div>
  );
}

export default Notification;
