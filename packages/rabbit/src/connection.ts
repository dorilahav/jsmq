import { Connection, Options, connect as connectToRabbit } from 'amqplib';

export type RabbitMQConnectionOptions = {url: string} | (Options.Connect & {url?: never});

export interface RabbitMQConnection {
  connect: () => Promise<void>;
  connection: Connection;
}

export const mapConnectionOptionsToUrl = (connectionOptions: RabbitMQConnectionOptions): string | Options.Connect => {
  if (typeof connectionOptions.url === 'string') {
    return connectionOptions.url;
  }

  return connectionOptions;
}

export const createRabbitConnection = (connectionOptions: RabbitMQConnectionOptions): RabbitMQConnection => {
  let connection: Connection;

  const connect = async () => {
    const url = mapConnectionOptionsToUrl(connectionOptions);

    connection = await connectToRabbit(url);
  }

  return {
    connect,
    get connection () {
      if (!connection) {
        throw new Error('In order to have a connection you need to connect first!');
      }

      return connection;
    }
  }
}