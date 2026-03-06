import { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader';
import Notification from '../components/Notification';

const initialForm = {
  serverKey: '',
  world: '',
  maxPlayers: 20,
  gamemode: 'survival',
  difficulty: 'easy',
  whitelist: false,
  cracked: false,
  fly: true,
  forceGamemode: false,
  spawnProtection: 0
};

function normalizeWorldName(value) {
  return String(value || '').trim().toLowerCase();
}

function GamingStatus({ label }) {
  return (
    <span className="gaming-status-inline">
      <svg className="gaming-status-svg" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="gaming-status-ring" cx="12" cy="12" r="9" />
        <path className="gaming-status-core" d="M12 6L15.5 12L12 18L8.5 12Z" />
      </svg>
      <span>{label}</span>
    </span>
  );
}

function CreateServer() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [loadingDownloaded, setLoadingDownloaded] = useState(true);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [downloadingVersionId, setDownloadingVersionId] = useState('');
  const [acceptingEula, setAcceptingEula] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [downloadedServers, setDownloadedServers] = useState([]);
  const [onlineServers, setOnlineServers] = useState([]);
  const [existingWorlds, setExistingWorlds] = useState([]);

  const existingWorldSet = useMemo(
    () => new Set(existingWorlds.map((name) => normalizeWorldName(name)).filter(Boolean)),
    [existingWorlds]
  );
  const downloadedVersionSet = useMemo(
    () => new Set(downloadedServers.map((server) => String(server.id ?? '').trim()).filter(Boolean)),
    [downloadedServers]
  );

  const fetchFirstAvailable = async (paths) => {
    for (const path of paths) {
      try {
        const response = await fetch(`http://localhost:8080${path}`);
        if (!response.ok) continue;
        const data = await response.json();
        return { path, data };
      } catch (_err) {
        // Try next endpoint option.
      }
    }
    return null;
  };

  const loadDownloadedServers = async () => {
    setLoadingDownloaded(true);
    const result = await fetchFirstAvailable([
      '/offlineVersions',
      '/servers/downloaded',
      '/downloaded-servers',
      '/servers/local'
    ]);
    const data = result?.data;
    if (!Array.isArray(data)) {
      setDownloadedServers([]);
      setError('Filed to fetch');
      setLoadingDownloaded(false);
      return;
    }

    const normalized = data.map((item) => {
      if (typeof item === 'string') {
        return { id: item, name: item, version: item };
      }
      if (item && typeof item === 'object') {
        const version = String(item.id ?? item.version ?? item.name ?? '').trim();
        return { ...item, id: version || String(item.id ?? ''), name: item.name ?? version, version };
      }
      return { id: '', name: '', version: '' };
    }).filter((item) => item.id);

    setDownloadedServers(normalized);
    setLoadingDownloaded(false);
  };

  const loadExistingWorlds = async () => {
    const result = await fetchFirstAvailable([
      '/worlds',
      '/servers/worlds',
      '/worlds/list',
      '/servers'
    ]);

    const data = result?.data;
    if (!Array.isArray(data)) {
      setExistingWorlds([]);
      return;
    }

    const worldNames = data
      .map((item) => {
        if (typeof item === 'string') return item;
        if (!item || typeof item !== 'object') return '';
        if (result.path === '/servers') return item.world ?? '';
        return item.world ?? item.name ?? '';
      })
      .filter(Boolean);

    setExistingWorlds(worldNames);
  };

  const loadOnlineServers = async () => {
    try {
      setLoadingOnline(true);
      setError('');

      const result = await fetchFirstAvailable([
        '/onlineVersions',
        '/servers-online',
        '/get-servers-online',
        '/servers/online'
      ]);

      if (!result) {
        throw new Error('Unable to fetch online servers. Please verify backend endpoint.');
      }

      const data = Array.isArray(result.data) ? result.data : [];
      setOnlineServers(data);

      if (data.length === 0) {
        setError('No downloadable versions found.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load online servers.');
    } finally {
      setLoadingOnline(false);
    }
  };

  const downloadOnlineVersion = async (version) => {
    const versionId = String(version?.id ?? '').trim();
    if (!versionId) {
      setError('Invalid version selected.');
      return;
    }

    try {
      setDownloadingVersionId(versionId);
      setError('');
      setSuccess('');

      const response = await fetch(`http://localhost:8080/download/${encodeURIComponent(versionId)}`, {
        method: 'POST'
      });

      const resultText = (await response.text()).trim();
      const lower = resultText.toLowerCase();

      if (!response.ok || lower.includes('fail') || lower.includes('error')) {
        throw new Error(resultText || `${versionId} download failed.`);
      }

      if (!lower.includes('success')) {
        setSuccess(resultText || `${versionId} downloaded.`);
      } else {
        setSuccess(resultText);
      }

      await loadDownloadedServers();

      const shouldProceedEula = window.confirm(
        `Download successful for ${versionId}. Do you want to accept EULA and start first time now?`
      );

      if (!shouldProceedEula) {
        setSuccess(`${versionId} downloaded. EULA skipped.`);
        return;
      }

      try {
        setAcceptingEula(true);
        const eulaResponse = await fetch(`http://localhost:8080/eula/${encodeURIComponent(versionId)}`, {
          method: 'GET'
        });
        const eulaText = (await eulaResponse.text()).trim();
        const eulaLower = eulaText.toLowerCase();

        if (!eulaResponse.ok || eulaLower.includes('fail') || eulaLower.includes('error')) {
          throw new Error(eulaText || `${versionId} EULA/start failed.`);
        }

        setSuccess(eulaText || `${versionId} started.`);
      } catch (eulaErr) {
        setError(eulaErr.message || `${versionId} EULA/start failed.`);
      } finally {
        setAcceptingEula(false);
      }
    } catch (err) {
      setError(err.message || `${versionId} download failed.`);
    } finally {
      setDownloadingVersionId('');
    }
  };

  useEffect(() => {
    loadDownloadedServers();
    loadExistingWorlds();
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'maxPlayers' || name === 'spawnProtection'
          ? Number(value)
          : value
    }));
  };

  const handleServerChange = async (event) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      serverKey: value
    }));

    if (!value) return;

    const selectedServer = downloadedServers.find((server) => {
      const key = String(server.id ?? server.name ?? server.serverName ?? '');
      return key === value;
    });

    if (!selectedServer || selectedServer.eula !== false) {
      return;
    }

    const versionId = String(selectedServer.id ?? value);
    const shouldAcceptEula = window.confirm(
      `EULA is not accepted for ${versionId}. Do you want to agree now?`
    );

    if (!shouldAcceptEula) {
      setError('You must accept EULA before using this server.');
      return;
    }

    try {
      setAcceptingEula(true);
      setError('');
      const eulaResponse = await fetch(`http://localhost:8080/eula/${encodeURIComponent(versionId)}`, {
        method: 'GET'
      });
      const eulaText = (await eulaResponse.text()).trim();
      const eulaLower = eulaText.toLowerCase();

      if (!eulaResponse.ok || eulaLower.includes('fail') || eulaLower.includes('error')) {
        throw new Error(eulaText || `${versionId} EULA acceptance failed.`);
      }

      setSuccess('EULA accepted.');
      await loadDownloadedServers();
    } catch (err) {
      setError(err.message || `${versionId} EULA acceptance failed.`);
    } finally {
      setAcceptingEula(false);
    }
  };

  const handleBooleanToggle = (name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSetField = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDownloadedLabel = (server) => {
    const version = server.version ?? server.id ?? '';
    const name = server.name ?? server.serverName ?? version ?? 'Unnamed Server';
    if (!version || name === version) return String(name);
    return `${name} (${version})`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const selectedServer = downloadedServers.find((server) => {
      const key = String(server.id ?? server.name ?? server.serverName ?? '');
      return key === formData.serverKey;
    });

    if (!selectedServer) {
      setError('Filed to fetch');
      return;
    }

    const trimmedWorld = String(formData.world || '').trim();
    if (!trimmedWorld) {
      setError('Enter a world name.');
      return;
    }

    if (existingWorldSet.has(normalizeWorldName(trimmedWorld))) {
      setError(`${trimmedWorld} already exists.`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = {
        versionId: selectedServer.id ?? formData.serverKey,
        difficulty: formData.difficulty,
        gamemode: formData.gamemode,
        'level-name': trimmedWorld,
        'max-players': formData.maxPlayers,
        'allow-flight': formData.fly,
        'force-gamemode': formData.forceGamemode,
        'online-mode': !formData.cracked,
        'white-list': formData.whitelist,
        'spawn-protection': formData.spawnProtection
      };

      const response = await fetch('http://localhost:8080/world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resultText = (await response.text()).trim();
      const lower = resultText.toLowerCase();
      const isFailure = !response.ok || lower.includes('fail') || lower.includes('error');

      if (isFailure) {
        throw new Error(resultText || `${trimmedWorld} creation failed.`);
      }

      setSuccess(resultText || `${trimmedWorld} created.`);
      setFormData((prev) => ({
        ...initialForm,
        serverKey: prev.serverKey
      }));
      await loadExistingWorlds();
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Network/CORS blocked request.');
      } else {
        setError(err.message || `${trimmedWorld} creation failed.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-wrap">
      <p className="section-kicker">Create World</p>

      <Notification type="error" message={error} />
      <Notification type="success" message={success} />

      {loading && <Loader label="Creating world" />}
      {acceptingEula && <Loader label="Applying EULA" />}
      {loadingDownloaded && <Loader label="Loading downloaded server list" />}

      <form className="card form-grid" onSubmit={handleSubmit}>
        <label className="field">
          <span>Server</span>
          <select
            name="serverKey"
            value={formData.serverKey}
            onChange={handleServerChange}
            required
            disabled={loading || loadingDownloaded || downloadedServers.length === 0}
          >
            <option value="">Select a downloaded server</option>
            {downloadedServers.map((server) => {
              const key = String(server.id ?? server.name ?? server.serverName ?? '');
              return (
                <option key={key} value={key}>
                  {formatDownloadedLabel(server)}
                </option>
              );
            })}
          </select>
        </label>

        <label className="field">
          <span>World Name</span>
          <input
            name="world"
            value={formData.world}
            onChange={handleChange}
            required
            disabled={!formData.serverKey || loadingDownloaded}
            placeholder={formData.serverKey ? 'Enter new world name' : 'Choose server first'}
          />
        </label>

        <label className="field">
          <span>Slots</span>
          <input
            type="number"
            min="1"
            name="maxPlayers"
            value={formData.maxPlayers}
            onChange={handleChange}
            required
          />
        </label>

        <label className="field">
          <span>Spawn</span>
          <input
            type="number"
            min="0"
            name="spawnProtection"
            value={formData.spawnProtection}
            onChange={handleChange}
            required
          />
        </label>

        <label className="field">
          <span>Game Mode</span>
          <div className="toggle-group">
            {['survival', 'creative', 'adventure', 'spectator'].map((mode) => (
              <button
                key={mode}
                type="button"
                className={`toggle-chip ${formData.gamemode === mode ? 'active' : ''}`}
                onClick={() => handleSetField('gamemode', mode)}
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
                className={`toggle-chip ${formData.difficulty === level ? 'active' : ''}`}
                onClick={() => handleSetField('difficulty', level)}
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
            className={`switch-btn ${formData.whitelist ? 'on' : 'off'}`}
            onClick={() => handleBooleanToggle('whitelist')}
          >
            {formData.whitelist ? 'Enabled' : 'Disabled'}
          </button>
        </label>

        <label className="field">
          <span>Cracked</span>
          <button
            type="button"
            className={`switch-btn ${formData.cracked ? 'on' : 'off'}`}
            onClick={() => handleBooleanToggle('cracked')}
          >
            {formData.cracked ? 'Enabled' : 'Disabled'}
          </button>
        </label>

        <label className="field">
          <span>Fly</span>
          <button
            type="button"
            className={`switch-btn ${formData.fly ? 'on' : 'off'}`}
            onClick={() => handleBooleanToggle('fly')}
          >
            {formData.fly ? 'Enabled' : 'Disabled'}
          </button>
        </label>

        <label className="field">
          <span>Force Game Mode</span>
          <button
            type="button"
            className={`switch-btn ${formData.forceGamemode ? 'on' : 'off'}`}
            onClick={() => handleBooleanToggle('forceGamemode')}
          >
            {formData.forceGamemode ? 'Enabled' : 'Disabled'}
          </button>
        </label>

        <div className="form-actions">
          <button type="submit" className="btn btn-danger" disabled={loading || downloadedServers.length === 0}>
            {loading ? <GamingStatus label="Creating" /> : 'Create World'}
          </button>
        </div>
      </form>

      <div className="card download-tab">
        <div className="section-row">
          <p className="detail-label">Download Servers</p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={loadOnlineServers}
            disabled={loadingOnline || acceptingEula}
          >
            {loadingOnline ? <GamingStatus label="Loading" /> : 'Download Servers'}
          </button>
        </div>

        {!loadingDownloaded && downloadedServers.length === 0 && (
          <p className="muted-text">No downloaded servers found yet.</p>
        )}

        <div className="server-list online-server-scroll">
          {onlineServers.map((server, index) => {
            const versionId = String(server.id ?? index);
            const isDownloaded = downloadedVersionSet.has(versionId);
            return (
              <div key={versionId} className="online-server-item">
                <div>
                  <p className="online-server-title">{String(server.id ?? 'unknown')}</p>
                  <p className="muted-text">Type: {String(server.type ?? 'unknown')}</p>
                  <p className="muted-text">Release: {String(server.releaseTime ?? server.time ?? 'unknown')}</p>
                </div>
                <button
                  type="button"
                  className={`btn ${isDownloaded ? 'btn-muted' : 'btn-danger'}`}
                  onClick={() => downloadOnlineVersion(server)}
                  disabled={isDownloaded || downloadingVersionId === versionId || acceptingEula}
                >
                  {isDownloaded
                    ? 'Downloaded'
                    : downloadingVersionId === versionId
                      ? <GamingStatus label="Downloading" />
                      : 'Download'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CreateServer;
