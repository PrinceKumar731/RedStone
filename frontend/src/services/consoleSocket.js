import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

const CONSOLE_ENDPOINT = 'http://localhost:8080/console';
const CONSOLE_TOPIC = '/topic/console';

export function connectConsoleSocket({ onMessage, onStatusChange }) {
  const client = new Client({
    webSocketFactory: () => new SockJS(CONSOLE_ENDPOINT),
    reconnectDelay: 2000,
    debug: () => {}
  });

  client.onConnect = () => {
    onStatusChange?.('connected');
    client.subscribe(CONSOLE_TOPIC, (message) => {
      onMessage?.(message.body ?? '');
    });
  };

  client.onStompError = () => {
    onStatusChange?.('error');
  };

  client.onWebSocketClose = () => {
    onStatusChange?.('disconnected');
  };

  client.activate();

  return () => {
    client.deactivate();
  };
}
