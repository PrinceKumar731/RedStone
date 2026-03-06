import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Dashboard from './Pages/Dashboard';
import Servers from './Pages/Servers';
import ServerDetails from './Pages/ServerDetails';
import CreateServer from './Pages/CreateServer';
import LoadingScreen from './components/LoadingScreen';
import './index.css';


function App() {
  const [showBootScreen, setShowBootScreen] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedServerId, setSelectedServerId] = useState(null);
  const [hasRunningServer, setHasRunningServer] = useState(false);

  useEffect(() => {
    const durationMs = 4000;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.min(100, (elapsed / durationMs) * 100);
      setBootProgress(nextProgress);
    }, 40);

    const doneTimer = setTimeout(() => {
      setBootProgress(100);
      setShowBootScreen(false);
    }, durationMs);

    return () => {
      clearInterval(timer);
      clearTimeout(doneTimer);
    };
  }, []);

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  const handleViewServerDetails = (serverId) => {
    setSelectedServerId(serverId);
    setActivePage('serverDetails');
  };

  const handleBackToServers = () => {
    setActivePage('servers');
  };

  useEffect(() => {
    let cancelled = false;

    const pollRunningState = async () => {
      try {
        const response = await fetch('http://localhost:8080/servers/stats');
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled) {
          setHasRunningServer(Number(data?.runningServers ?? 0) > 0);
        }
      } catch (_err) {
        // Keep previous indicator state when polling fails.
      }
    };

    pollRunningState();
    const timer = setInterval(pollRunningState, 3000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (showBootScreen) {
    return <LoadingScreen progress={bootProgress} />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        hasRunningServer={hasRunningServer}
      />
      <main className="content-shell">
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'servers' && (
          <Servers onViewDetails={handleViewServerDetails} />
        )}
        {activePage === 'createServer' && <CreateServer />}
        {activePage === 'serverDetails' && selectedServerId && (
          <ServerDetails
            serverId={selectedServerId}
            onBack={handleBackToServers}
          />
        )}
      </main>
    </div>
  );
}

export default App;

