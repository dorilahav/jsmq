import { Connection, Options, connect as connectToRabbit } from 'amqplib';
import { EventEmitter } from 'events';

const RECONNECT_DELAY_MS = 5000;
const RECONNECT_LIMIT: number = 10;

export type DurableConnectionUrl = string | Options.Connect;

export interface IDurableConnection {
  get: () => Promise<Connection>;
  close: () => Promise<void>;
}

interface DurableConnectionOptions {
  url: DurableConnectionUrl;
  eventEmitterOptions?: {
    captureRejections?: boolean | undefined;
  };
}

interface DurableConnectionEventMap {
  'reconnect-attempt': [];
  'reconnect-success': [connection: Connection];
  'reconnect-failed': [];
  error: [error: Error];
  close: [];
}

export class DurableConnection extends EventEmitter<DurableConnectionEventMap> implements IDurableConnection {
  private url: DurableConnectionUrl;

  private isCloseCalled: boolean;
  private connection: Connection | null;

  private reconnectionFailureCount: number;
  private reconnectionTimeout: NodeJS.Timeout | null;

  constructor(options: DurableConnectionOptions) {
    super(options.eventEmitterOptions);
    
    this.url = options.url;

    this.isCloseCalled = false;
    this.connection = null;

    this.reconnectionFailureCount = 0;
    this.reconnectionTimeout = null;
  }

  public async get() {
    if (!this.connection) {
      this.connection = await this.createConnection();
    }

    return this.connection;
  }

  public async close() {
    this.isCloseCalled = true;

    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
    } else {
      await this.connection?.close();
    }
  }

  private async createConnection() {
    const connection = await connectToRabbit(this.url);

    this.bindEvents(connection);

    return connection;
  }

  private bindEvents(connection: Connection) {
    connection.on('error', error => this.emit('error', error));

    connection.on('close', () => {
      this.emit('close');

      if (!this.isCloseCalled) {
        this.reconnectUntilFailure();
      }
    });
  }

  private reconnectUntilFailure() {
    return new Promise<Connection>(async (resolve, reject) => {
      while (RECONNECT_LIMIT === -1 ? true : this.reconnectionFailureCount < RECONNECT_LIMIT) {
        try {
          const connection = await this.reconnect();
          this.reconnectionFailureCount = 0;
          resolve(connection);
          return;
        } catch {
          this.reconnectionFailureCount++;
          continue;
        }
      }

      reject(new Error('Reconnection limit passed!'));
    });
  }

  private reconnect() {
    return new Promise<Connection>((resolve, reject) => {
      this.reconnectionTimeout = setTimeout(async () => {
        this.emit('reconnect-attempt');

        try {
          const connection = await this.createConnection();
          this.emit('reconnect-success', connection);
          resolve(connection);
        } catch (error) {
          this.emit('reconnect-failed');
          reject(error);
        }
      }, RECONNECT_DELAY_MS);
    });
  }
}