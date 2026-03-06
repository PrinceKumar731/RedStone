import { useEffect, useRef, useState } from 'react';
import { connectConsoleSocket } from '../services/consoleSocket';

function ConsoleTerminal({ enabled, runningLabel }) {
  const [logs, setLogs] = useState([]);
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const terminalRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setSocketStatus('disconnected');
      return undefined;
    }

    setSocketStatus('connecting');
    const disconnect = connectConsoleSocket({
      onStatusChange: (status) => setSocketStatus(status),
      onMessage: (line) => {
        setLogs((prev) => [...prev, line]);
      }
    });

    return () => {
      disconnect();
    };
  }, [enabled]);

  useEffect(() => {
    const el = terminalRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs]);

  const statusText = enabled ? socketStatus : 'idle';
  const statusClass = `terminal-status ${statusText}`;

  return (
    <div className="terminal-wrap">
      <div className="terminal-head">
        <span className={statusClass}>WS: {statusText}</span>
        {runningLabel && <span className="meta-badge">{runningLabel}</span>}
      </div>
      <pre ref={terminalRef} className="console-output">
        {logs.length > 0 ? logs.join('\n') : 'Waiting for console stream...'}
      </pre>
    </div>
  );
}

export default ConsoleTerminal;
