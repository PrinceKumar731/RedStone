import { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader';
import Notification from '../components/Notification';

function Servers() {
  const [availableServers, setAvailableServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeVersionActionKey, setActiveVersionActionKey] = useState('');

  const fetchAvailableServers = async () => {
    const response = await fetch('http://localhost:8080/AvailableServers');
    if (!response.ok) {
      throw new Error('Failed to load available servers.');
    }
    const data = await response.json();
    const versionWithWorlds = Array.isArray(data)
      ? data
      : Array.isArray(data?.versionWithWorlds)
        ? data.versionWithWorlds
        : [];
    setAvailableServers(versionWithWorlds);
  };

  const fetchServers = async () => {
    try {
      setLoading(true);
      setError('');
      await fetchAvailableServers();
    } catch (err) {
      setError(err.message || 'Unexpected error while loading servers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  useEffect(() => {
    if (!error) return undefined;
    const timer = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!success) return undefined;
    const timer = setTimeout(() => setSuccess(''), 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const handleBackendResult = async (response, fallbackMessage) => {
    const text = (await response.text()).trim();
    const lower = text.toLowerCase();
    if (!response.ok || lower.includes('fail') || lower.includes('error')) {
      throw new Error(text || fallbackMessage);
    }
    return text || fallbackMessage;
  };

  const deleteWorld = async (versionId, worldName) => {
    const key = `delete-world::${versionId}::${worldName}`;
    try {
      setActiveVersionActionKey(key);
      setError('');
      setSuccess('');

      const response = await fetch(
        `http://localhost:8080/delete/${encodeURIComponent(versionId)}/${encodeURIComponent(worldName)}`,
        { method: 'DELETE' }
      );

      const message = await handleBackendResult(response, `${worldName} deleted.`);
      await fetchServers();
      setSuccess(message);
    } catch (err) {
      setError(err.message || `${worldName} delete failed.`);
    } finally {
      setActiveVersionActionKey('');
    }
  };

  const deleteVersion = async (versionId) => {
    const key = `delete-version::${versionId}`;
    try {
      setActiveVersionActionKey(key);
      setError('');
      setSuccess('');

      const response = await fetch(`http://localhost:8080/delete/${encodeURIComponent(versionId)}`, {
        method: 'DELETE'
      });

      const message = await handleBackendResult(response, `${versionId} deleted.`);
      await fetchServers();
      setSuccess(message);
    } catch (err) {
      setError(err.message || `${versionId} delete failed.`);
    } finally {
      setActiveVersionActionKey('');
    }
  };

  const availableCount = useMemo(() => availableServers.length, [availableServers.length]);
  const worldCount = useMemo(
    () => availableServers.reduce((total, item) => total + (Array.isArray(item?.worlds) ? item.worlds.length : 0), 0),
    [availableServers]
  );
  const pendingEulaCount = useMemo(
    () => availableServers.reduce((total, item) => total + (item?.eula ? 0 : 1), 0),
    [availableServers]
  );

  return (
    <section className="page-wrap servers-page">
      <div className="card servers-hero">
        <div className="section-row">
          <div>
            <p className="section-kicker">Server Registry</p>
            <h2 className="servers-hero-title">Version Vault Control</h2>
            <p className="servers-hero-subtitle">Track worlds, EULA status, and clean old versions quickly.</p>
          </div>
          <button
            type="button"
            className="btn btn-outline icon-btn"
            onClick={fetchServers}
            aria-label="Refresh servers"
            title="Refresh servers"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-btn-svg">
              <path
                d="M20 12a8 8 0 1 1-2.35-5.65M20 4v4h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="servers-hero-metrics">
          <article className="servers-metric">
            <p className="detail-label">Versions</p>
            <p className="servers-metric-value">{availableCount}</p>
          </article>
          <article className="servers-metric">
            <p className="detail-label">Worlds</p>
            <p className="servers-metric-value">{worldCount}</p>
          </article>
          <article className="servers-metric">
            <p className="detail-label">EULA Pending</p>
            <p className="servers-metric-value">{pendingEulaCount}</p>
          </article>
        </div>
      </div>

      {loading && <Loader label="Scanning server vault" />}
      <Notification type="error" message={error} />
      <Notification type="success" message={success} />

      <div className="card servers-registry-card">
        <div className="section-row">
          <p className="detail-label">Server Versions</p>
          <span className="meta-badge">Total: {availableCount}</span>
        </div>

        {!loading && availableServers.length === 0 && (
          <div className="servers-empty-state">
            <p className="muted-text">No version blocks available.</p>
          </div>
        )}

        <div className="server-blocks-grid">
          {availableServers.map((item) => {
            const versionId = String(item?.versionId ?? '').trim();
            if (!versionId) return null;
            const worlds = Array.isArray(item?.worlds) ? item.worlds.map((w) => String(w)) : [];
            const deleteVersionKey = `delete-version::${versionId}`;

            return (
              <article key={versionId} className="server-version-block">
                <div className="server-version-head">
                  <div className="server-version-head-left">
                    <h3 className="server-title">{versionId}</h3>
                    <span className={`eula-pill ${item?.eula ? 'accepted' : 'pending'}`}>
                      EULA {item?.eula ? 'Accepted' : 'Pending'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => deleteVersion(versionId)}
                    disabled={activeVersionActionKey === deleteVersionKey}
                  >
                    {activeVersionActionKey === deleteVersionKey ? 'Deleting...' : 'Delete Server'}
                  </button>
                </div>

                <div className="world-list-panel">
                  {worlds.length === 0 && <p className="muted-text">No worlds in this version.</p>}

                  {worlds.map((worldName) => {
                    const deleteWorldKey = `delete-world::${versionId}::${worldName}`;
                    const isDeleting = activeVersionActionKey === deleteWorldKey;
                    return (
                      <div key={`${versionId}-${worldName}`} className="world-row">
                        <div className="world-row-main">
                          <span className="meta-badge world-name-badge">{worldName}</span>
                        </div>
                        <div className="server-actions">
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => deleteWorld(versionId, worldName)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Servers;
