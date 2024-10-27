import { ConfirmChannel, Connection, Options, connect as connectToRabbit } from 'amqplib';

export type RabbitMQConnectionOptions = {url: string} | (Options.Connect & {url?: never});

export interface RabbitMQConnection {
  connect: () => Promise<void>;
  connection: Connection | null;
  channel: ConfirmChannel | null;
}

export const mapConnectionOptionsToUrl = (connectionOptions: RabbitMQConnectionOptions): string | Options.Connect => {
  if (typeof connectionOptions.url === 'string') {
    return connectionOptions.url;
  }

  return connectionOptions;
}

export const createRabbitConnection = (connectionOptions: RabbitMQConnectionOptions): RabbitMQConnection => {
  let connection: Connection | null = null;
  let channel: ConfirmChannel | null = null;

  const connect = async () => {
    if (connection && channel) {
      throw new Error('Already connected!');
    }

    const url = mapConnectionOptionsToUrl(connectionOptions);

    connection = await connectToRabbit(url);
    channel = await connection.createConfirmChannel();

    // TODO: Reconnect mechanism.
  }

  return {
    connect,
    get connection() {
      return connection;
    },
    get channel() {
      return channel;
    }
  }
}