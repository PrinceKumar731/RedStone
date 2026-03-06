import { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader';
import Notification from '../components/Notification';

function parseRamToMb(ramValue) {
  const value = String(ramValue || '').trim().toUpperCase();
  if (value.endsWith('G')) {
    const num = Number(value.replace('G', ''));
    return Number.isFinite(num) ? num * 1024 : 0;
  }
  if (value.endsWith('M')) {
    const num = Number(value.replace('M', ''));
    return Number.isFinite(num) ? num : 0;
  }
  return 0;
}

function ServerDetails({ serverId, onBack }) {
  const [server, setServer] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const [serverRes, statsRes] = await Promise.all([
          fetch(`http://localhost:8080/servers/${serverId}`),
          fetch(`http://localhost:8080/servers/${serverId}/stats`)
        ]);

        if (!serverRes.ok) {
          throw new Error('Failed to load server details.');
        }
        if (!statsRes.ok) {
          throw new Error('Failed to load server stats.');
        }

        const serverData = await serverRes.json();
        const statsData = await statsRes.json();

        setServer(serverData);
        setStats(statsData);
      } catch (err) {
        setError(err.message || 'Unexpected error while loading details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [serverId]);

  const ramUsagePercent = useMemo(() => {
    if (!server || !stats) return 0;
    const limitMb = parseRamToMb(server.ram);
    const usedMb = Number(stats.currentRamUsageMb || 0);
    if (!limitMb) return 0;
    return Math.min(100, Math.round((usedMb / limitMb) * 100));
  }, [server, stats]);

  return (
    <section className="page-wrap">
      <div className="section-row">
        <p className="section-kicker">Node Inspection</p>
        <button type="button" className="btn btn-outline" onClick={onBack}>
          Back to Grid
        </button>
      </div>

      {loading && <Loader label="Loading node telemetry" />}
      <Notification type="error" message={error} />

      {!loading && !error && server && stats && (
        <>
          <div className="card detail-grid">
            <div>
              <p className="detail-label">Server Name</p>
              <p className="detail-value">{server.name}</p>
            </div>
            <div>
              <p className="detail-label">World Name</p>
              <p className="detail-value">{server.world}</p>
            </div>
            <div>
              <p className="detail-label">Difficulty</p>
              <p className="detail-value">{server.difficulty}</p>
            </div>
            <div>
              <p className="detail-label">Game Mode</p>
              <p className="detail-value">{server.gamemode}</p>
            </div>
            <div>
              <p className="detail-label">Port</p>
              <p className="detail-value">{server.port}</p>
            </div>
            <div>
              <p className="detail-label">Max Players</p>
              <p className="detail-value">{server.maxPlayers}</p>
            </div>
            <div>
              <p className="detail-label">RAM</p>
              <p className="detail-value">{server.ram}</p>
            </div>
            <div>
              <p className="detail-label">Active Players</p>
              <p className="detail-value">{stats.activePlayers ?? 0}</p>
            </div>
          </div>

          <div className="card">
            <div className="ram-head">
              <p className="detail-label">Current RAM Usage</p>
              <p className="detail-value">{stats.currentRamUsageMb ?? 0} MB</p>
            </div>
            <div className="ram-track">
              <div className="ram-fill" style={{ width: `${ramUsagePercent}%` }} />
            </div>
            <p className="muted-text">{ramUsagePercent}% of allocated RAM</p>
          </div>

          <div className="player-grid">
            {(stats.onlinePlayers || []).length === 0 && (
              <div className="card muted-text">No players online.</div>
            )}
            {(stats.onlinePlayers || []).map((username) => (
              <div key={username} className="card player-card">
                <p>{username}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default ServerDetails;
