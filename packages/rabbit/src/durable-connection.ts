import { Connection, Options, connect as connectToRabbit } from 'amqplib';

const RECONNECT_DELAY_MS = 5000;
const RECONNECT_LIMIT: number = 10;

export type DurableConnectionUrl = string | Options.Connect;

interface DurableConnectionEvents {
  onReconnectAttempt?: () => void;
  onReconnectSuccessful?: (connection: Connection) => void;
  onReconnectFailure?: () => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export const createDurableConnection = async (url: DurableConnectionUrl, events: DurableConnectionEvents = {}) => {
  let isCloseCalled = false;
  let connection: Connection;
  let reconnectionFailureCount = 0;
  let reconnectionTimeout: NodeJS.Timeout | null = null;

  const reconnect = () => new Promise<Connection>((resolve, reject) => {
    reconnectionTimeout = setTimeout(async () => {
      events.onReconnectAttempt?.();

      try {
        const connection = await connect();
        events.onReconnectSuccessful?.(connection);
        resolve(connection);
      } catch (error) {
        events.onReconnectFailure?.();
        reject(error);
      }
    }, RECONNECT_DELAY_MS);
  })

  const reconnectUntilFailure = () => new Promise<Connection>(async (resolve, reject) => {
    while (RECONNECT_LIMIT === -1 ? true : reconnectionFailureCount < RECONNECT_LIMIT) {
      try {
        const connection = await reconnect();
        reconnectionFailureCount = 0;
        resolve(connection);
        return;
      } catch {
        reconnectionFailureCount++;
        continue;
      }
    }

    reject(new Error('Reconnection limit passed!'));
  });

  const bindEvents = (connection: Connection) => {
    if (events.onError) {
      connection.on('error', events.onError);
    }

    connection.on('close', () => {
      events.onClose?.();
      if (!isCloseCalled) {
        reconnectUntilFailure();
      }
    });
  }

  const connect = async () => {
    const connection = await connectToRabbit(url);

    bindEvents(connection);

    return connection;
  }

  // Well initializing the connection is not more than just connecting, it doesn't trigger reconnect logic because we want the app to crash if not immediately connected to rabbit.
  const initializeConnection = connect;

  connection = await initializeConnection();

  return {
    get: () => connection,
    close: async () => {
      isCloseCalled = true;

      if (reconnectionTimeout) {
        clearTimeout(reconnectionTimeout);
      } else {
        await connection.close();
      }
    }
  }
}