import { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader';
import Notification from '../components/Notification';
import ConsoleTerminal from '../components/ConsoleTerminal';

const defaultProperties = {
  difficulty: 'easy',
  gamemode: 'survival',
  'max-players': 20,
  'allow-flight': true,
  'force-gamemode': false,
  'white-list': false,
  cracked: null,
  'online-mode': true,
  'spawn-protection': 16
};

const RUNNING_SERVER_STORAGE_KEY = 'redstone.runningServer';

function getStoredRunningServer() {
  try {
    const raw = localStorage.getItem(RUNNING_SERVER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.versionId && parsed?.worldName) {
      return { versionId: String(parsed.versionId), worldName: String(parsed.worldName) };
    }
  } catch (_err) {
    // Ignore storage parse errors.
  }
  return null;
}

function boolFromAny(value, fallback) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return fallback;
}

function numberFromAny(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function Dashboard() {
  const storedRunningServer = getStoredRunningServer();
  const [availableServers, setAvailableServers] = useState([]);
  const [selectedVersionId, setSelectedVersionId] = useState(storedRunningServer?.versionId ?? '');
  const [selectedWorld, setSelectedWorld] = useState(storedRunningServer?.worldName ?? '');
  const [properties, setProperties] = useState(defaultProperties);
  const [runningServer, setRunningServer] = useState(storedRunningServer);
  const [loading, setLoading] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [savingProperties, setSavingProperties] = useState(false);
  const [starting, setStarting] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [serverLink, setServerLink] = useState('');
  const [loadingServerLink, setLoadingServerLink] = useState(false);
  const [serverLinkError, setServerLinkError] = useState('');
  const [isServerLinkExpanded, setIsServerLinkExpanded] = useState(false);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isLockedByRunning = Boolean(runningServer);

  const worldsForSelectedVersion = useMemo(() => {
    const selected = availableServers.find((item) => String(item?.versionId ?? '') === selectedVersionId);
    const worlds = Array.isArray(selected?.worlds) ? selected.worlds.map((w) => String(w)) : [];
    return worlds;
  }, [availableServers, selectedVersionId]);

  const selectedVersionEntry = useMemo(
    () => availableServers.find((item) => String(item?.versionId ?? '') === selectedVersionId) ?? null,
    [availableServers, selectedVersionId]
  );

  const fetchAvailableServers = async () => {
    const response = await fetch('http://localhost:8080/AvailableServers');
    if (!response.ok) {
      throw new Error('Failed to load available servers.');
    }

    const data = await response.json();
    const normalized = Array.isArray(data)
      ? data
      : Array.isArray(data?.versionWithWorlds)
        ? data.versionWithWorlds
        : [];

    setAvailableServers(normalized);

    if (runningServer?.versionId && runningServer?.worldName) {
      setSelectedVersionId(String(runningServer.versionId));
      setSelectedWorld(String(runningServer.worldName));
      return;
    }

    if (!selectedVersionId && normalized.length > 0) {
      const version = String(normalized[0]?.versionId ?? '');
      const firstWorld = Array.isArray(normalized[0]?.worlds) && normalized[0].worlds.length > 0
        ? String(normalized[0].worlds[0])
        : '';
      setSelectedVersionId(version);
      setSelectedWorld(firstWorld);
    }
  };

  const loadProperties = async (versionId, worldName) => {
    if (!versionId || !worldName) {
      setProperties(defaultProperties);
      return;
    }

    try {
      setLoadingProperties(true);
      const response = await fetch(
        `http://localhost:8080/dashboard/${encodeURIComponent(versionId)}/${encodeURIComponent(worldName)}`
      );
      if (!response.ok) {
        throw new Error('Failed to load selected world properties.');
      }
      const data = await response.json();
      const onlineMode = boolFromAny(data?.['online-mode'], defaultProperties['online-mode']);
      const crackedValue = data?.cracked == null ? !onlineMode : boolFromAny(data?.cracked, false);

      setProperties({
        difficulty: String(data?.difficulty ?? defaultProperties.difficulty),
        gamemode: String(data?.gamemode ?? defaultProperties.gamemode),
        'max-players': numberFromAny(data?.['max-players'], defaultProperties['max-players']),
        'allow-flight': boolFromAny(data?.['allow-flight'], defaultProperties['allow-flight']),
        'force-gamemode': boolFromAny(data?.['force-gamemode'], defaultProperties['force-gamemode']),
        'white-list': boolFromAny(data?.['white-list'], defaultProperties['white-list']),
        cracked: crackedValue,
        'online-mode': onlineMode,
        'spawn-protection': numberFromAny(data?.['spawn-protection'], defaultProperties['spawn-protection'])
      });
    } finally {
      setLoadingProperties(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        await fetchAvailableServers();
      } catch (err) {
        setError(err.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedVersionId && selectedWorld && !isLockedByRunning) {
      loadProperties(selectedVersionId, selectedWorld);
    }
  }, [selectedVersionId, selectedWorld, isLockedByRunning]);

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

  useEffect(() => {
    if (!runningServer) return;
    setSelectedVersionId(String(runningServer.versionId));
    setSelectedWorld(String(runningServer.worldName));
  }, [runningServer]);

  const handleVersionChange = async (value) => {
    setSelectedVersionId(value);
    const entry = availableServers.find((item) => String(item?.versionId ?? '') === value);
    const firstWorld = Array.isArray(entry?.worlds) && entry.worlds.length > 0 ? String(entry.worlds[0]) : '';
    setSelectedWorld(firstWorld);
    setSuccess('');
    setError('');

    if (entry && !entry.eula) {
      const shouldAcceptEula = window.confirm(
        `EULA is not accepted for ${value}. Do you want to agree now?`
      );

      if (!shouldAcceptEula) {
        return;
      }

      try {
        const eulaResponse = await fetch(`http://localhost:8080/eula/${encodeURIComponent(value)}`, {
          method: 'GET'
        });
        const eulaText = (await eulaResponse.text()).trim();
        const eulaLower = eulaText.toLowerCase();
        if (!eulaResponse.ok || eulaLower.includes('fail') || eulaLower.includes('error')) {
          throw new Error(eulaText || 'EULA acceptance failed.');
        }

        setSuccess('EULA accepted.');
        await fetchAvailableServers();
      } catch (err) {
        setError(err.message || 'EULA acceptance failed.');
      }
    }
  };

  const updateProperty = (key, value) => {
    setProperties((prev) => ({ ...prev, [key]: value }));
  };

  const saveProperties = async () => {
    if (!selectedVersionId || !selectedWorld) {
      setError('Please select version and world first.');
      return;
    }

    try {
      setSavingProperties(true);
      setError('');
      setSuccess('');

      const payload = {
        versionId: selectedVersionId,
        difficulty: properties.difficulty,
        gamemode: properties.gamemode,
        'level-name': selectedWorld,
        'max-players': properties['max-players'],
        cracked: properties.cracked,
        'allow-flight': properties['allow-flight'],
        'force-gamemode': properties['force-gamemode'],
        'online-mode': properties['online-mode'],
        'white-list': properties['white-list'],
        'spawn-protection': properties['spawn-protection']
      };

      const response = await fetch(
        `http://localhost:8080/dashboard/${encodeURIComponent(selectedVersionId)}/${encodeURIComponent(selectedWorld)}`,
        {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
        }
      );

      const resultText = (await response.text()).trim();
      const lower = resultText.toLowerCase();
      if (!response.ok || lower.includes('fail') || lower.includes('error')) {
        throw new Error(resultText || 'Failed to update world properties.');
      }

      setSuccess(resultText || `${selectedWorld} properties updated.`);
    } catch (err) {
      setError(err.message || 'Failed to update world properties.');
    } finally {
      setSavingProperties(false);
    }
  };

  const startSelectedServer = async () => {
    if (!selectedVersionId || !selectedWorld) {
      setError('Please select version and world first.');
      return;
    }

    try {
      setStarting(true);
      setError('');
      setSuccess('');

      const isEulaAccepted = Boolean(selectedVersionEntry?.eula);
      if (!isEulaAccepted) {
        const shouldAcceptEula = window.confirm(
          `EULA is not accepted for ${selectedVersionId}. Do you want to agree now?`
        );

        if (!shouldAcceptEula) {
          throw new Error('You must agree to EULA before starting the server.');
        }

        const eulaResponse = await fetch(`http://localhost:8080/eula/${encodeURIComponent(selectedVersionId)}`, {
          method: 'GET'
        });
        const eulaText = (await eulaResponse.text()).trim();
        const eulaLower = eulaText.toLowerCase();
        if (!eulaResponse.ok || eulaLower.includes('fail') || eulaLower.includes('error')) {
          throw new Error(eulaText || 'EULA acceptance failed.');
        }

        await fetchAvailableServers();
      }

      const response = await fetch(
        `http://localhost:8080/start/${encodeURIComponent(selectedVersionId)}/${encodeURIComponent(selectedWorld)}`
      );
      const resultText = (await response.text()).trim();
      const lower = resultText.toLowerCase();
      if (!response.ok || lower.includes('fail') || lower.includes('error')) {
        throw new Error(resultText || 'Failed to start server.');
      }

      const startedServer = { versionId: selectedVersionId, worldName: selectedWorld };
      setRunningServer(startedServer);
      localStorage.setItem(RUNNING_SERVER_STORAGE_KEY, JSON.stringify(startedServer));
      setSuccess('server started');
    } catch (err) {
      setError(err.message || 'Failed to start server.');
    } finally {
      setStarting(false);
    }
  };

  const stopRunningServer = async () => {
    if (!runningServer) return;

    try {
      setStopping(true);
      setError('');
      setSuccess('');
      const response = await fetch(
        `http://localhost:8080/stop/${encodeURIComponent(runningServer.versionId)}/${encodeURIComponent(runningServer.worldName)}`
      );
      const resultText = (await response.text()).trim();
      const lower = resultText.toLowerCase();
      if (!response.ok || lower.includes('fail') || lower.includes('error')) {
        throw new Error(resultText || 'Failed to stop server.');
      }

      setSuccess('Stopped');
      setRunningServer(null);
      localStorage.removeItem(RUNNING_SERVER_STORAGE_KEY);
    } catch (err) {
      setError(err.message || 'Failed to stop server.');
    } finally {
      setStopping(false);
    }
  };

  const fetchServerLink = async () => {
    const response = await fetch('http://localhost:8080/serverLink');
    if (!response.ok) {
      throw new Error('Failed to load server link.');
    }

    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('application/json')) {
      const data = await response.json();
      const link = String(data?.serverLink ?? data?.link ?? '').trim();
      if (!link) {
        throw new Error('Server link is empty.');
      }
      return link;
    }

    const text = (await response.text()).trim();
    if (!text) {
      throw new Error('Server link is empty.');
    }
    return text;
  };

  useEffect(() => {
    let isCancelled = false;

    const loadServerLink = async () => {
      if (!runningServer) {
        setServerLink('');
        setServerLinkError('');
        setLoadingServerLink(false);
        setIsServerLinkExpanded(false);
        return;
      }

      try {
        setLoadingServerLink(true);
        setServerLinkError('');
        const nextLink = await fetchServerLink();
        if (!isCancelled) {
          setServerLink(nextLink);
        }
      } catch (err) {
        if (!isCancelled) {
          setServerLink('');
          setServerLinkError(err.message || 'Failed to load server link.');
        }
      } finally {
        if (!isCancelled) {
          setLoadingServerLink(false);
        }
      }
    };

    loadServerLink();

    return () => {
      isCancelled = true;
    };
  }, [runningServer]);

  return (
    <section className="page-wrap">
      <p className="section-kicker">Control Room</p>

      {loading && <Loader label="Loading available worlds" />}
      {loadingProperties && <Loader label="Loading world properties" />}
      <Notification type="error" message={error} />
      <Notification type="success" message={success} />

      {!loading && (
        <>
          <div className="card dashboard-select-grid">
            <div className="dashboard-top-actions">
              <button
                type="button"
                className="btn btn-start-hero"
                onClick={startSelectedServer}
                disabled={starting || isLockedByRunning}
              >
                {starting ? 'Starting...' : 'Start Server'}
              </button>

              <button
                type="button"
                className="btn btn-stop-hero"
                onClick={stopRunningServer}
                disabled={stopping || !isLockedByRunning}
              >
                {stopping ? 'Stopping...' : 'Stop Server'}
              </button>
            </div>

            {isLockedByRunning && (
              <div className="server-link-block">
                <div className="server-link-head">
                  <p className="detail-label">Join Server</p>
                  <button
                    type="button"
                    className="btn server-link-toggle"
                    onClick={() => setIsServerLinkExpanded((prev) => !prev)}
                    aria-expanded={isServerLinkExpanded}
                    aria-label={isServerLinkExpanded ? 'Collapse server link' : 'Expand server link'}
                  >
                    {isServerLinkExpanded ? '▲' : '▼'}
                  </button>
                </div>

                <div className="server-link-body">
                  {loadingServerLink && <p className="muted-text">Loading server link...</p>}
                  {!loadingServerLink && serverLink && <p className="server-link-value">{serverLink}</p>}
                  {!loadingServerLink && serverLinkError && <p className="muted-text">{serverLinkError}</p>}

                  {isServerLinkExpanded && (
                    <ul className="server-link-points">
                      <li>Paste this link in Minecraft Add Server (Server Address).</li>
                      <li>If you use your own hotspot, use IPv4:25565 (example: 192.168.1.23:25565).</li>
                      <li>All devices should be connected to the same WiFi network.</li>
                      <li>Some networks may block this, so try switching the network.</li>
                    </ul>
                  )}
                </div>
              </div>
            )}

            <label className="field">
              <span>Version</span>
              <select
                value={selectedVersionId}
                onChange={(event) => handleVersionChange(event.target.value)}
                disabled={isLockedByRunning}
              >
                {availableServers.map((item) => {
                  const versionId = String(item?.versionId ?? '');
                  return (
                    <option key={versionId} value={versionId}>
                      {versionId}
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="field">
              <span>World</span>
              <select
                value={selectedWorld}
                onChange={(event) => setSelectedWorld(event.target.value)}
                disabled={isLockedByRunning}
              >
                {worldsForSelectedVersion.map((world) => (
                  <option key={world} value={world}>
                    {world}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="section-kicker">Properties</p>
          <div className="card dashboard-grid">
            <label className="field">
              <span>Slots</span>
              <input
                type="number"
                min="1"
                value={properties['max-players']}
                onChange={(event) => updateProperty('max-players', numberFromAny(event.target.value, 20))}
                disabled={isLockedByRunning}
              />
            </label>

            <label className="field">
              <span>Spawn</span>
              <input
                type="number"
                min="0"
                value={properties['spawn-protection']}
                onChange={(event) => updateProperty('spawn-protection', numberFromAny(event.target.value, 16))}
                disabled={isLockedByRunning}
              />
            </label>

            <label className="field">
              <span>Game Mode</span>
              <div className="toggle-group">
                {['survival', 'creative', 'adventure', 'spectator'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`toggle-chip ${properties.gamemode === mode ? 'active' : ''}`}
                    onClick={() => updateProperty('gamemode', mode)}
                    disabled={isLockedByRunning}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </label>

            <label className="field">
              <span>Difficulty</span>
              <div className="toggle-group">
                {['peaceful', 'easy', 'normal', 'hard'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`toggle-chip ${properties.difficulty === level ? 'active' : ''}`}
                    onClick={() => updateProperty('difficulty', level)}
                    disabled={isLockedByRunning}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </label>

            <label className="field">
              <span>Whitelist</span>
              <button
                type="button"
                className={`switch-btn ${properties['white-list'] ? 'on' : 'off'}`}
                onClick={() => updateProperty('white-list', !properties['white-list'])}
                disabled={isLockedByRunning}
              >
                {properties['white-list'] ? 'Enabled' : 'Disabled'}
              </button>
            </label>

            <label className="field">
              <span>Cracked</span>
              <button
                type="button"
                className={`switch-btn ${properties.cracked ? 'on' : 'off'}`}
                onClick={() => {
                  const nextCracked = !Boolean(properties.cracked);
                  updateProperty('cracked', nextCracked);
                  updateProperty('online-mode', !nextCracked);
                }}
                disabled={isLockedByRunning}
              >
                {properties.cracked ? 'Enabled' : 'Disabled'}
              </button>
            </label>

            <label className="field">
              <span>Fly</span>
              <button
                type="button"
                className={`switch-btn ${properties['allow-flight'] ? 'on' : 'off'}`}
                onClick={() => updateProperty('allow-flight', !properties['allow-flight'])}
                disabled={isLockedByRunning}
              >
                {properties['allow-flight'] ? 'Enabled' : 'Disabled'}
              </button>
            </label>

            <label className="field">
              <span>Force Game Mode</span>
              <button
                type="button"
                className={`switch-btn ${properties['force-gamemode'] ? 'on' : 'off'}`}
                onClick={() => updateProperty('force-gamemode', !properties['force-gamemode'])}
                disabled={isLockedByRunning}
              >
                {properties['force-gamemode'] ? 'Enabled' : 'Disabled'}
              </button>
            </label>

            <div className="server-actions dashboard-actions">
              {!isLockedByRunning && (
                <button type="button" className="btn btn-outline" onClick={saveProperties} disabled={savingProperties}>
                  {savingProperties ? 'Saving...' : 'Save Properties'}
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <div className="card console-card">
        <div className="section-row">
          <p className="section-kicker">Console</p>
          <button
            type="button"
            className="btn server-link-toggle"
            onClick={() => setIsConsoleExpanded((prev) => !prev)}
            aria-expanded={isConsoleExpanded}
            aria-label={isConsoleExpanded ? 'Collapse console' : 'Expand console'}
          >
            {isConsoleExpanded ? '▲' : '▼'}
          </button>
        </div>
        {isConsoleExpanded && (
          <ConsoleTerminal
            enabled={Boolean(runningServer)}
            runningLabel={
              runningServer
                ? `Running: ${runningServer.versionId} / ${runningServer.worldName}`
                : ''
            }
          />
        )}
      </div>
    </section>
  );
}

export default Dashboard;
