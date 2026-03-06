function ServerCard({ server, onStart, onStop, onViewDetails, actionLoading }) {
  const isRunning = String(server.status || '').toLowerCase() === 'running';

  return (
    <article className="card server-card">
      <div className="server-main">
        <h3 className="server-title">{server.name}</h3>
        <p className="muted-text">World: {server.world}</p>
      </div>

      <div className="server-meta">
        <div className="status-inline">
          <span className={`status-dot ${isRunning ? 'running' : 'stopped'}`} />
          <span>{isRunning ? 'Running' : 'Stopped'}</span>
        </div>
        <span className="meta-badge">RAM: {server.ram}</span>
        <span className="meta-badge">Port: {server.port}</span>
      </div>

      <div className="server-actions">
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onStart(server.id)}
          disabled={actionLoading || isRunning}
        >
          {actionLoading ? 'Starting...' : 'Start'}
        </button>
        <button
          type="button"
          className="btn btn-muted"
          onClick={() => onStop(server.id)}
          disabled={actionLoading || !isRunning}
        >
          {actionLoading ? 'Stopping...' : 'Stop'}
        </button>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => onViewDetails(server.id)}
        >
          View Details
        </button>
      </div>
    </article>
  );
}

export default ServerCard;
